# UPI Offline Mesh — React Frontend

A modern React 19 + TypeScript + Vite frontend dashboard for the **UPI Offline Mesh** project.

## Key Features

1. **Protocol Explainer & Cryptographic Specifications**
   - Visual breakdown of the 3-step offline transaction lifecycle: Offline Encryption &rarr; Bluetooth Low Energy Mesh Gossip &rarr; 4G Bridge Ingestion & Settlement.
   - Cryptographic inspect modal showing Server RSA-2048 Public Key, OAEP-SHA256 asymmetric padding, AES-256-GCM authenticated cipher, and SHA-256 idempotency hash pipeline.

2. **Step-by-Step Interactive Control Center**
   - **Step 1: Compose & Inject Offline Payment**: Sender & receiver dropdowns, amount selector with quick chips (+₹100, +₹500, etc.), 4-digit PIN, start node selector, and hop TTL slider.
   - **Step 2: Bluetooth Mesh Gossip**: Broadcast packets device-to-device with TTL decrement simulation.
   - **Step 3: Bridge Node Ingestion**: Simulates 4G bridge uploading held packets to `/api/bridge/ingest`.
   - **Step 4: Security & Concurrency Lab**:
     - **Concurrent Duplicate Storm**: Fires 3+ simultaneous bridge upload threads for the exact same packet to prove atomic idempotency and zero double-spending.
     - **Ciphertext Bit-Flip Attack**: Mutates a byte in the encrypted ciphertext to prove AES-GCM authentication fails and returns `INVALID`.

3. **Live Mesh Topology Visualizer**
   - Visual device cards showing online/offline status (🌐 4G LTE vs 🚫 BLE Mesh), held packet counts, and packet ID pills.
   - Dynamic glow and ripple pulse animations when devices hold packets.

4. **Accounts & Wallets**
   - Neo-banking wallet cards for Alice, Bob, Carol, and Dave with live balance in ₹ INR and 1-click "Send from here" action.

5. **Settled Transaction Ledger**
   - Real-time ledger table with status pills (`SETTLED`, `DUPLICATE_DROPPED`, `INVALID`), hop counts, bridge node IDs, and 1-click copy for the 64-character SHA-256 packet hash.
   - Search filter by VPA, bridge node, or hash.

6. **Protocol Audit & Activity Console**
   - Real-time terminal with color-coded event tags (`INJECT`, `GOSSIP`, `BRIDGE`, `SETTLED`, `DUPLICATE`, `TAMPER`, `RESET`).
   - Copy logs and clear logs controls.

7. **1-Click Full Automated Demo**
   - Runs an automated end-to-end simulation from injection &rarr; gossip propagation &rarr; 4G settlement &rarr; concurrency race test.

---

## How to Run

### Development Mode (with Hot Reload)
1. Ensure the Spring Boot backend is running on `http://localhost:8080`.
2. Start the Vite development server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173`. Requests to `/api` are automatically proxied to `http://localhost:8080`.

### Production Build (Integrated with Spring Boot)
1. Build the React frontend into Spring Boot's static resources:
   ```bash
   cd frontend
   npm run build
   ```
   *This outputs the compiled bundle directly to `../src/main/resources/static`.*
2. Start the Spring Boot backend:
   ```bash
   cd ..
   .\mvnw.cmd spring-boot:run
   ```
3. Open `http://localhost:8080`. Spring Boot serves the React app directly from `http://localhost:8080/`. The classic Thymeleaf dashboard remains accessible at `http://localhost:8080/classic`.
