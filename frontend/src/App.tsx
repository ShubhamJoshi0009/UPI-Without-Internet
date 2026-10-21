import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { api } from './services/api';
import type {
  Account,
  Transaction,
  VirtualDevice,
  ServerKeyInfo,
  DemoSendRequest,
  LogEntry,
} from './types';
import { Header } from './components/Header';
import { ProtocolExplainer } from './components/ProtocolExplainer';
import { AccountsGrid } from './components/AccountsGrid';
import { DemoControls } from './components/DemoControls';
import { MeshTopology } from './components/MeshTopology';
import { TransactionLedger } from './components/TransactionLedger';
import { ActivityConsole } from './components/ActivityConsole';
import { CryptoKeyModal } from './components/CryptoKeyModal';

export function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [devices, setDevices] = useState<VirtualDevice[]>([]);
  const [idempotencyCacheSize, setIdempotencyCacheSize] = useState<number>(0);
  const [serverKey, setServerKey] = useState<ServerKeyInfo | null>(null);

  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [isAutoPolling, setIsAutoPolling] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAutoDemoRunning, setIsAutoDemoRunning] = useState<boolean>(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState<boolean>(false);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      title: 'UPI Offline Mesh Console Initialized',
      detail: 'Connecting to backend at port 8080...',
    },
  ]);

  const addLog = useCallback(
    (
      type: LogEntry['type'],
      title: string,
      detail?: string
    ) => {
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          type,
          title,
          detail,
        },
      ]);
    },
    []
  );

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [accs, txs, mesh, key] = await Promise.all([
        api.getAccounts(),
        api.getTransactions(),
        api.getMeshState(),
        serverKey ? Promise.resolve(serverKey) : api.getServerKey(),
      ]);

      setAccounts(accs);
      setTransactions(txs);
      setDevices(mesh.devices || []);
      setIdempotencyCacheSize(mesh.idempotencyCacheSize || 0);
      if (!serverKey && key) setServerKey(key);
      setBackendConnected(true);
    } catch (err: any) {
      setBackendConnected(false);
      if (isManual) {
        addLog('error', 'Failed to connect to backend', err.message);
      }
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, [serverKey, addLog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-poll interval
  useEffect(() => {
    if (!isAutoPolling) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoPolling, loadData]);

  // Handlers
  const handleSendPacket = async (req: DemoSendRequest) => {
    setIsSubmitting(true);
    try {
      const res = await api.sendDemoPacket(req);
      if (res.tampered) {
        addLog(
          'tamper',
          `⚠️ Tampered Packet ${res.packetId.substring(0, 8)} injected at ${res.injectedAt} (TTL ${res.ttl})`,
          `Corrupted ciphertext: ${res.ciphertextPreview}`
        );
      } else {
        addLog(
          'inject',
          `📤 Packet ${res.packetId.substring(0, 8)} encrypted & injected at ${res.injectedAt} (TTL ${res.ttl})`,
          `Ciphertext preview: ${res.ciphertextPreview}`
        );
      }
      await loadData();
    } catch (err: any) {
      addLog('error', 'Injection failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunGossip = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.runGossip();
      const countsStr = Object.entries(res.deviceCounts)
        .map(([dev, cnt]) => `${dev}:${cnt}`)
        .join(', ');
      addLog(
        'gossip',
        `🔄 Gossip Round: ${res.transfers} packet transfer(s) across nodes`,
        `Distribution: [${countsStr}]`
      );
      await loadData();
    } catch (err: any) {
      addLog('error', 'Gossip failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlushBridges = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.flushBridges();
      addLog(
        'bridge',
        `📡 Bridge Flush: ${res.uploadsAttempted} upload(s) attempted over 4G`
      );
      res.results.forEach((r) => {
        if (r.outcome === 'SETTLED') {
          addLog(
            'settled',
            `✅ ${r.bridgeNode} uploaded packet ${r.packetId} → SETTLED (Tx #${r.transactionId})`
          );
        } else if (r.outcome === 'DUPLICATE_DROPPED') {
          addLog(
            'duplicate',
            `🔁 ${r.bridgeNode} uploaded packet ${r.packetId} → DUPLICATE_DROPPED (Zero double-spend)`
          );
        } else {
          addLog(
            'tamper',
            `❌ ${r.bridgeNode} packet ${r.packetId} → ${r.outcome}`,
            r.reason || ''
          );
        }
      });
      await loadData();
    } catch (err: any) {
      addLog('error', 'Bridge flush failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateStorm = async (count: number) => {
    setIsSubmitting(true);
    try {
      addLog(
        'duplicate',
        `⚡ Launching ${count} concurrent bridge threads delivering identical packet simultaneously...`
      );
      const res = await api.runDuplicateStorm(count);
      addLog(
        'duplicate',
        `⚡ Storm Result: ${res.settledCount} SETTLED, ${res.duplicateCount} DUPLICATE_DROPPED out of ${res.totalAttempts} parallel threads!`
      );
      res.results.forEach((r) => {
        if (r.outcome === 'SETTLED') {
          addLog('settled', `   ${r.bridgeNode} → SETTLED (Tx #${r.transactionId})`);
        } else {
          addLog('duplicate', `   ${r.bridgeNode} → DUPLICATE_DROPPED (Short-circuited before DB)`);
        }
      });
      await loadData();
    } catch (err: any) {
      addLog('error', 'Duplicate storm failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetMesh();
      addLog('reset', '🗑 Mesh packet buffers and server idempotency cache cleared');
      await loadData();
    } catch (err: any) {
      addLog('error', 'Reset failed', err.message);
    }
  };

  // Full 1-Click Automated Demo Flow
  const handleRunAutoDemo = async () => {
    if (isAutoDemoRunning) return;
    setIsAutoDemoRunning(true);
    addLog('info', '🎬 Starting 1-Click Automated Demo Walkthrough...');

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // 1. Reset mesh first
      await api.resetMesh();
      addLog('reset', 'Step 0: Mesh buffers and idempotency cache cleared');
      await loadData();
      await sleep(1000);

      // 2. Inject payment
      addLog('inject', 'Step 1: Alice creates offline payment instruction of ₹500 to Bob');
      const sendRes = await api.sendDemoPacket({
        senderVpa: 'alice@demo',
        receiverVpa: 'bob@demo',
        amount: 500,
        pin: '1234',
        ttl: 5,
        startDevice: 'phone-alice',
      });
      addLog(
        'inject',
        `   Encrypted RSA+AES packet ${sendRes.packetId.substring(0, 8)} held by phone-alice`
      );
      await loadData();
      await sleep(1400);

      // 3. Gossip Round 1
      addLog('gossip', 'Step 2a: First Bluetooth gossip round — nearby strangers relay packet');
      await api.runGossip();
      await loadData();
      await sleep(1400);

      // 4. Gossip Round 2
      addLog('gossip', 'Step 2b: Second gossip round — packet propagates to bridge device');
      await api.runGossip();
      await loadData();
      await sleep(1400);

      // 5. Bridge uploads to backend
      addLog('bridge', 'Step 3: phone-bridge walks outside, detects 4G, and uploads to backend');
      const flushRes = await api.flushBridges();
      flushRes.results.forEach((r) => {
        addLog('settled', `   ${r.bridgeNode} → ${r.outcome} (Tx #${r.transactionId})`);
      });
      await loadData();
      await sleep(1500);

      // 6. Test duplicate storm
      addLog('duplicate', 'Step 4: Proving idempotency — firing 3 concurrent bridge uploads');
      const stormRes = await api.runDuplicateStorm(3);
      addLog(
        'duplicate',
        `   Result: Exactly ${stormRes.settledCount} settled, ${stormRes.duplicateCount} dropped as duplicates!`
      );
      await loadData();
      addLog('info', '🎉 Full demo pipeline completed successfully!');
    } catch (err: any) {
      addLog('error', 'Auto demo failed', err.message);
    } finally {
      setIsAutoDemoRunning(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        backendConnected={backendConnected}
        idempotencyCacheSize={idempotencyCacheSize}
        isAutoPolling={isAutoPolling}
        isRefreshing={isRefreshing}
        isAutoDemoRunning={isAutoDemoRunning}
        onToggleAutoPoll={() => setIsAutoPolling(!isAutoPolling)}
        onRefresh={() => loadData(true)}
        onReset={handleReset}
        onOpenCryptoModal={() => setIsCryptoModalOpen(true)}
        onRunAutoDemo={handleRunAutoDemo}
      />

      <ProtocolExplainer />

      {/* User Wallets */}
      <AccountsGrid accounts={accounts} />

      {/* Controls & Mesh Visualizer */}
      <div className="dashboard-grid">
        <DemoControls
          accounts={accounts}
          isSubmitting={isSubmitting || isAutoDemoRunning}
          onSendPacket={handleSendPacket}
          onRunGossip={handleRunGossip}
          onFlushBridges={handleFlushBridges}
          onDuplicateStorm={handleDuplicateStorm}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <MeshTopology devices={devices} />
          <ActivityConsole logs={logs} onClearLogs={() => setLogs([])} />
        </div>
      </div>

      {/* Transaction Ledger */}
      <TransactionLedger transactions={transactions} />

      {/* Crypto Specs Modal */}
      {isCryptoModalOpen && (
        <CryptoKeyModal
          keyInfo={serverKey}
          onClose={() => setIsCryptoModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
