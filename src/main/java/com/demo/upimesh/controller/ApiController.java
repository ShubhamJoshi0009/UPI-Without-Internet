package com.demo.upimesh.controller;

import com.demo.upimesh.crypto.ServerKeyHolder;
import com.demo.upimesh.model.*;
import com.demo.upimesh.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;

/**
 * Public REST surface.
 *
 * The endpoints split into three groups:
 *   /api/server-key      → so simulated senders can fetch the server's public key
 *   /api/mesh/*          → simulator endpoints (inject, gossip, flush)
 *   /api/bridge/ingest   → THE real production endpoint a real bridge node would hit
 *   /api/accounts, /api/transactions → for the dashboard
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired private ServerKeyHolder serverKey;
    @Autowired private DemoService demo;
    @Autowired private MeshSimulatorService mesh;
    @Autowired private BridgeIngestionService bridge;
    @Autowired private AccountRepository accountRepo;
    @Autowired private TransactionRepository txRepo;
    @Autowired private IdempotencyService idempotency;

    // ------------------------------------------------------------------ key

    @GetMapping("/server-key")
    public Map<String, String> getServerPublicKey() {
        return Map.of(
                "publicKey", serverKey.getPublicKeyBase64(),
                "algorithm", "RSA-2048 / OAEP-SHA256",
                "hybridScheme", "RSA-OAEP encrypts an AES-256-GCM session key"
        );
    }

    // ---------------------------------------------------------------- demo

    /**
     * Demo helper: build a packet on the server (simulating a sender phone)
     * and inject it into the mesh at the given device.
     */
    @PostMapping("/demo/send")
    public ResponseEntity<?> demoSend(@RequestBody DemoSendRequest req) throws Exception {
        MeshPacket packet = demo.createPacket(
                req.senderVpa, req.receiverVpa, req.amount, req.pin,
                req.ttl == null ? 5 : req.ttl);

        if (Boolean.TRUE.equals(req.tamper)) {
            char[] chars = packet.getCiphertext().toCharArray();
            chars[chars.length / 2] = chars[chars.length / 2] == 'A' ? 'B' : 'A';
            packet.setCiphertext(new String(chars));
        }

        String startDevice = req.startDevice == null ? "phone-alice" : req.startDevice;
        mesh.inject(startDevice, packet);

        return ResponseEntity.ok(Map.of(
                "packetId", packet.getPacketId(),
                "ciphertextPreview", packet.getCiphertext().substring(0, 64) + "...",
                "ttl", packet.getTtl(),
                "injectedAt", startDevice,
                "tampered", Boolean.TRUE.equals(req.tamper)
        ));
    }

    /**
     * Demo helper: Fire N concurrent bridge threads delivering the same packet
     * to test concurrent idempotency in real time from the UI.
     */
    @PostMapping("/demo/duplicate-storm")
    public ResponseEntity<?> duplicateStorm(@RequestBody(required = false) Map<String, Object> req) throws Exception {
        int count = 3;
        if (req != null && req.containsKey("count")) {
            count = Math.min(10, Math.max(2, ((Number) req.get("count")).intValue()));
        }

        // Find existing packet in the mesh or create a new test packet
        MeshPacket packet = null;
        for (VirtualDevice d : mesh.getDevices()) {
            if (!d.getHeldPackets().isEmpty()) {
                packet = d.getHeldPackets().stream().findFirst().orElse(null);
                break;
            }
        }
        if (packet == null) {
            packet = demo.createPacket("alice@demo", "bob@demo", new BigDecimal("100.00"), "1234", 5);
        }

        final MeshPacket finalPacket = packet;
        ExecutorService pool = Executors.newFixedThreadPool(count);
        CountDownLatch start = new CountDownLatch(1);
        List<Map<String, Object>> outcomes = Collections.synchronizedList(new ArrayList<>());

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            final String node = "bridge-sim-" + (i + 1);
            futures.add(pool.submit(() -> {
                try {
                    start.await();
                    BridgeIngestionService.IngestResult r = bridge.ingest(finalPacket, node, 2);
                    outcomes.add(Map.of(
                            "bridgeNode", node,
                            "packetId", finalPacket.getPacketId().substring(0, 8),
                            "outcome", r.outcome(),
                            "reason", r.reason() == null ? "" : r.reason(),
                            "transactionId", r.transactionId() == null ? -1 : r.transactionId()
                    ));
                } catch (Exception e) {
                    outcomes.add(Map.of("bridgeNode", node, "outcome", "ERROR", "reason", e.getMessage() == null ? "Unknown" : e.getMessage()));
                }
            }));
        }

        start.countDown();
        for (Future<?> f : futures) {
            f.get(5, TimeUnit.SECONDS);
        }
        pool.shutdown();

        long settledCount = outcomes.stream().filter(o -> "SETTLED".equals(o.get("outcome"))).count();
        long duplicateCount = outcomes.stream().filter(o -> "DUPLICATE_DROPPED".equals(o.get("outcome"))).count();

        return ResponseEntity.ok(Map.of(
                "totalAttempts", count,
                "packetId", finalPacket.getPacketId().substring(0, 8),
                "settledCount", settledCount,
                "duplicateCount", duplicateCount,
                "results", outcomes
        ));
    }

    public static class DemoSendRequest {
        public String senderVpa;
        public String receiverVpa;
        public BigDecimal amount;
        public String pin;
        public Integer ttl;
        public String startDevice;
        public Boolean tamper;
    }


    // -------------------------------------------------------------- mesh sim

    @GetMapping("/mesh/state")
    public Map<String, Object> meshState() {
        List<Map<String, Object>> deviceData = new ArrayList<>();
        for (VirtualDevice d : mesh.getDevices()) {
            deviceData.add(Map.of(
                    "deviceId", d.getDeviceId(),
                    "hasInternet", d.hasInternet(),
                    "packetCount", d.packetCount(),
                    "packetIds", d.getHeldPackets().stream()
                            .map(p -> p.getPacketId().substring(0, 8))
                            .toList()
            ));
        }
        return Map.of(
                "devices", deviceData,
                "idempotencyCacheSize", idempotency.size()
        );
    }

    @PostMapping("/mesh/gossip")
    public Map<String, Object> meshGossip() {
        MeshSimulatorService.GossipResult r = mesh.gossipOnce();
        return Map.of(
                "transfers", r.transfers(),
                "deviceCounts", r.deviceCounts()
        );
    }

    /**
     * "All bridge nodes simultaneously walk outside and get 4G."
     * They all upload everything they hold to /api/bridge/ingest.
     *
     * THIS is the moment the duplicate-storm idempotency case is tested:
     * if multiple bridge nodes hold the same packet, the server gets multiple
     * concurrent POSTs of the same ciphertext, and only one should settle.
     */
    @PostMapping("/mesh/flush")
    public Map<String, Object> meshFlush() {
        List<MeshSimulatorService.BridgeUpload> uploads = mesh.collectBridgeUploads();

        List<Map<String, Object>> results = new ArrayList<>();
        // Upload them in parallel to actually exercise concurrent idempotency.
        uploads.parallelStream().forEach(up -> {
            BridgeIngestionService.IngestResult r =
                    bridge.ingest(up.packet(), up.bridgeNodeId(), 5 - up.packet().getTtl());
            synchronized (results) {
                results.add(Map.of(
                        "bridgeNode", up.bridgeNodeId(),
                        "packetId", up.packet().getPacketId().substring(0, 8),
                        "outcome", r.outcome(),
                        "reason", r.reason() == null ? "" : r.reason(),
                        "transactionId", r.transactionId() == null ? -1 : r.transactionId()
                ));
            }
        });

        return Map.of(
                "uploadsAttempted", uploads.size(),
                "results", results
        );
    }

    @PostMapping("/mesh/reset")
    public Map<String, Object> meshReset() {
        mesh.resetMesh();
        idempotency.clear();
        return Map.of("status", "mesh and idempotency cache cleared");
    }

    // -------------------------------------------------------------- bridge

    /**
     * THE PRODUCTION ENDPOINT.
     * In a real deployment, the Android app's bridge logic POSTs here whenever
     * the device has internet and is holding mesh packets.
     */
    @PostMapping("/bridge/ingest")
    public ResponseEntity<?> ingest(
            @RequestBody MeshPacket packet,
            @RequestHeader(value = "X-Bridge-Node-Id", defaultValue = "unknown") String bridgeNodeId,
            @RequestHeader(value = "X-Hop-Count", defaultValue = "0") int hopCount) {

        BridgeIngestionService.IngestResult r = bridge.ingest(packet, bridgeNodeId, hopCount);
        return ResponseEntity.ok(r);
    }

    // ------------------------------------------------------------- accounts

    @GetMapping("/accounts")
    public List<Account> listAccounts() {
        return accountRepo.findAll();
    }

    @GetMapping("/transactions")
    public List<Transaction> listTransactions() {
        return txRepo.findTop20ByOrderByIdDesc();
    }
}
