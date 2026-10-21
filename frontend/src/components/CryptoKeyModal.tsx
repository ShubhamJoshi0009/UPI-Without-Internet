import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, ShieldCheck, Lock, Cpu } from 'lucide-react';
import type { ServerKeyInfo } from '../types';

interface CryptoKeyModalProps {
  keyInfo: ServerKeyInfo | null;
  onClose: () => void;
}

export const CryptoKeyModal: React.FC<CryptoKeyModalProps> = ({ keyInfo, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!keyInfo) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(keyInfo.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Cryptographic Scheme &amp; Server Public Key
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Server RSA-2048 Public Key (Base64 X.509)</label>
              <button className="terminal-btn" onClick={handleCopyKey}>
                {copied ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy Key'}
              </button>
            </div>
            <textarea
              readOnly
              className="form-input mono"
              style={{
                fontSize: '11px',
                height: '110px',
                color: '#7dd3fc',
                resize: 'none',
              }}
              value={keyInfo.publicKey}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                background: 'rgba(10, 15, 29, 0.6)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Lock size={14} color="#38bdf8" />
                <strong style={{ fontSize: '13px' }}>Asymmetric Wrapping</strong>
              </div>
              <span className="spec-pill">{keyInfo.algorithm}</span>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                RSA with Optimal Asymmetric Encryption Padding (OAEP) wrapping an ephemeral 256-bit AES key.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(10, 15, 29, 0.6)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <ShieldCheck size={14} color="#10b981" />
                <strong style={{ fontSize: '13px' }}>Symmetric Cipher</strong>
              </div>
              <span className="spec-pill" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                AES-256-GCM
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                Galois/Counter Mode provides authenticated encryption. Any bit flip in transit invalidates the GCM auth tag.
              </p>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
              <Cpu size={15} />
              <strong>Wire Format Wire Breakdown:</strong>
            </div>
            <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
              [256 bytes RSA Key] + [12 bytes IV] + [Ciphertext + 16-byte GCM Tag]
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Idempotency is performed before decryption by calculating <code>SHA-256(ciphertext)</code> and claiming
              it in the cache atomically. If multiple bridge nodes submit the same wire packet, deduplication
              happens with zero RSA decryption overhead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
