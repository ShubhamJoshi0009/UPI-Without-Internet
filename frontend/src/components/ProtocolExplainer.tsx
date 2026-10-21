import React, { useState } from 'react';
import {
  WifiOff,
  Bluetooth,
  RadioTower,
  LockKeyhole,
  Network,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  FileLock2,
  Binary,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const ProtocolExplainer: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="protocol-banner">
      <div className="banner-header">
        <div className="banner-title">
          <ShieldCheck size={20} color="#38bdf8" />
          <span>How UPI Without Internet Works (Bluetooth Mesh + Hybrid RSA)</span>
        </div>
        <button
          className="header-btn"
          style={{ padding: '5px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              Hide Architecture Details <ChevronUp size={13} />
            </>
          ) : (
            <>
              View Architecture &amp; Cryptography <ChevronDown size={13} />
            </>
          )}
        </button>
      </div>

      <div className="banner-steps">
        <div className="banner-step-card">
          <div className="step-icon-wrap one">
            <WifiOff size={18} />
          </div>
          <div className="step-content">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LockKeyhole size={14} color="#38bdf8" />
              1. Offline Encryption
            </h4>
            <p>
              In a basement with 0% cellular signal, Alice's phone generates a UUID nonce, timestamps the instruction,
              and encrypts the payload using the Server's RSA-2048 public key (via AES-256-GCM). Untrusted intermediaries cannot read or alter it.
            </p>
          </div>
        </div>

        <div className="banner-step-card">
          <div className="step-icon-wrap two">
            <Bluetooth size={18} />
          </div>
          <div className="step-content">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Network size={14} color="#c084fc" />
              2. BLE Mesh Gossip Relay
            </h4>
            <p>
              The phone broadcasts the opaque ciphertext packet over Bluetooth Low Energy. Nearby stranger devices store and
              forward it peer-to-peer, decrementing TTL (hop limit) on each relay until a bridge device reaches internet.
            </p>
          </div>
        </div>

        <div className="banner-step-card">
          <div className="step-icon-wrap three">
            <RadioTower size={18} />
          </div>
          <div className="step-content">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BadgeCheck size={14} color="#34d399" />
              3. 4G Bridge Ingestion &amp; Settlement
            </h4>
            <p>
              When a bridge phone walks outside and gets 4G/LTE, it POSTs the packet to the backend. The server atomically claims
              <code>SHA-256(ciphertext)</code>, decrypts the session key with its private key, checks freshness, and settles the ledger.
            </p>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="crypto-tech-spec">
          <div className="spec-item">
            <FileLock2 size={16} color="#38bdf8" />
            <div>
              <strong>Hybrid Encryption Scheme: </strong>
              <span className="spec-pill">RSA-OAEP-256</span> + <span className="spec-pill">AES-256-GCM</span>
              <div>AES session key wrapped via RSA; 16-byte GCM tag detects any bit tampering in transit.</div>
            </div>
          </div>

          <div className="spec-item">
            <Binary size={16} color="#fbbf24" />
            <div>
              <strong>Atomic Idempotency Deduplication: </strong>
              <span className="spec-pill">SHA-256(ciphertext)</span>
              <div>Claimed with atomic <code>putIfAbsent</code> (SETNX) before RSA decryption. Multiple simultaneous deliveries are dropped at 0 DB cost.</div>
            </div>
          </div>

          <div className="spec-item">
            <Clock size={16} color="#34d399" />
            <div>
              <strong>Replay &amp; Freshness Guard: </strong>
              <span className="spec-pill">Nonce UUID</span> + <span className="spec-pill">&le; 24h Window</span>
              <div>Replays of past signed packets or stale packets older than 24 hours are rejected before reaching the ledger.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
