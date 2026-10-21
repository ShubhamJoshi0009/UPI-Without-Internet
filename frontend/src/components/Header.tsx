import React from 'react';
import {
  Bluetooth,
  RefreshCw,
  Trash2,
  KeyRound,
  PlayCircle,
  Wifi,
  WifiOff,
  Cpu,
  Sparkles,
  IndianRupee,
} from 'lucide-react';

interface HeaderProps {
  backendConnected: boolean;
  idempotencyCacheSize: number;
  isAutoPolling: boolean;
  isRefreshing: boolean;
  isAutoDemoRunning: boolean;
  onToggleAutoPoll: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onOpenCryptoModal: () => void;
  onRunAutoDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendConnected,
  idempotencyCacheSize,
  isAutoPolling,
  isRefreshing,
  isAutoDemoRunning,
  onToggleAutoPoll,
  onRefresh,
  onReset,
  onOpenCryptoModal,
  onRunAutoDemo,
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">
          <Bluetooth size={24} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }} />
          <IndianRupee
            size={14}
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: '#0284c7',
              borderRadius: '50%',
              padding: '1px',
            }}
          />
        </div>
        <div>
          <h1 className="brand-title">
            <span>UPI Offline Mesh</span>
            <span className="spec-pill" style={{ fontSize: '11px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Bluetooth size={11} color="#38bdf8" /> BLE + RSA-2048 + GCM
            </span>
          </h1>
          <p className="brand-subtitle">
            Decentralized Store-and-Forward Offline Payment Protocol Simulator
          </p>
        </div>
      </div>

      <div className="header-status-group">
        <div className={`status-chip ${backendConnected ? 'online' : 'offline'}`}>
          <span className="pulse-dot" />
          {backendConnected ? (
            <>
              <Wifi size={14} /> Backend Online (Port 8080)
            </>
          ) : (
            <>
              <WifiOff size={14} /> Backend Disconnected
            </>
          )}
        </div>

        <div className="status-chip cache" title="Number of claimed SHA-256 ciphertext hashes in memory">
          <Cpu size={14} />
          <span>Cache: <strong>{idempotencyCacheSize}</strong> claimed</span>
        </div>

        <button
          className={`header-btn ${isAutoPolling ? 'primary' : ''}`}
          onClick={onToggleAutoPoll}
          title="Toggle 2.5s real-time state polling"
        >
          <RefreshCw size={13} className={isAutoPolling ? 'pulse-dot' : ''} />
          Auto-Poll: {isAutoPolling ? 'ON' : 'OFF'}
        </button>

        <button
          className="header-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sync accounts, transactions & mesh buffers"
        >
          <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
          Refresh
        </button>

        <button
          className="header-btn primary"
          onClick={onRunAutoDemo}
          disabled={isAutoDemoRunning || !backendConnected}
          title="Run 1-Click interactive automated walk-through"
        >
          <Sparkles size={14} color="#fef08a" />
          <PlayCircle size={14} />
          {isAutoDemoRunning ? 'Simulating...' : '1-Click Full Demo'}
        </button>

        <button
          className="header-btn"
          onClick={onOpenCryptoModal}
          title="Inspect Server RSA-2048 Public Key & Hybrid Encryption Wire Format"
        >
          <KeyRound size={13} color="#38bdf8" />
          Crypto Specs
        </button>

        <button
          className="header-btn danger"
          onClick={onReset}
          title="Clear mesh device packets and reset idempotency cache"
        >
          <Trash2 size={13} />
          Reset Mesh
        </button>
      </div>
    </header>
  );
};
