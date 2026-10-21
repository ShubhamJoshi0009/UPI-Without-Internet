import React, { useState } from 'react';
import {
  SendHorizonal,
  Repeat,
  CloudUpload,
  ShieldAlert,
  Zap,
  LockKeyhole,
  Smartphone,
  Route,
  User,
  UserCheck,
  IndianRupee,
  Layers,
  RadioTower,
  Bluetooth,
  AlertOctagon,
  CopyCheck,
} from 'lucide-react';
import type { Account, DemoSendRequest } from '../types';

interface DemoControlsProps {
  accounts: Account[];
  isSubmitting: boolean;
  onSendPacket: (req: DemoSendRequest) => Promise<void>;
  onRunGossip: () => Promise<void>;
  onFlushBridges: () => Promise<void>;
  onDuplicateStorm: (count: number) => Promise<void>;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  accounts,
  isSubmitting,
  onSendPacket,
  onRunGossip,
  onFlushBridges,
  onDuplicateStorm,
}) => {
  const [senderVpa, setSenderVpa] = useState<string>('alice@demo');
  const [receiverVpa, setReceiverVpa] = useState<string>('bob@demo');
  const [amount, setAmount] = useState<number>(500);
  const [pin, setPin] = useState<string>('1234');
  const [ttl, setTtl] = useState<number>(5);
  const [startDevice, setStartDevice] = useState<string>('phone-alice');
  const [tamper, setTamper] = useState<boolean>(false);

  const quickAmounts = [100, 250, 500, 1000, 2000];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderVpa || !receiverVpa || amount <= 0) return;
    await onSendPacket({
      senderVpa,
      receiverVpa,
      amount,
      pin,
      ttl,
      startDevice,
      tamper,
    });
  };

  const handleInjectTamperedAttack = async () => {
    await onSendPacket({
      senderVpa,
      receiverVpa,
      amount,
      pin,
      ttl,
      startDevice,
      tamper: true,
    });
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <h3 className="card-title">
          <SendHorizonal size={18} color="#38bdf8" />
          Interactive Demo Control Center
        </h3>
        <span className="card-subtitle">Test the full offline payment pipeline step-by-step</span>
      </div>

      <div className="pipeline-steps">
        {/* Step 1: Compose & Inject */}
        <div className="flow-step-box highlight">
          <div className="step-indicator">
            <span className="step-num-badge">1</span>
            <span className="step-title">Compose &amp; Encrypt Offline Payment</span>
            <span className="step-desc">Simulates sender device in an offline basement</span>
          </div>

          <form onSubmit={handleSend}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={13} color="#38bdf8" /> Sender Account
                </label>
                <select
                  className="form-select"
                  value={senderVpa}
                  onChange={(e) => setSenderVpa(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.vpa} value={acc.vpa}>
                      {acc.holderName} ({acc.vpa}) — ₹{parseFloat(String(acc.balance)).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <UserCheck size={13} color="#34d399" /> Receiver Account
                </label>
                <select
                  className="form-select"
                  value={receiverVpa}
                  onChange={(e) => setReceiverVpa(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.vpa} value={acc.vpa}>
                      {acc.holderName} ({acc.vpa})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IndianRupee size={13} color="#fbbf24" /> Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  required
                />
                <div className="quick-amounts">
                  {quickAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`chip-btn ${amount === val ? 'active' : ''}`}
                      onClick={() => setAmount(val)}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <LockKeyhole size={13} color="#c084fc" /> 4-Digit UPI PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Route size={13} color="#38bdf8" /> Hop TTL Limit (Max {ttl} Hops)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="form-input"
                  style={{ padding: '4px' }}
                  value={ttl}
                  onChange={(e) => setTtl(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Smartphone size={13} color="#94a3b8" /> Starting Mesh Device
                </label>
                <select
                  className="form-select"
                  value={startDevice}
                  onChange={(e) => setStartDevice(e.target.value)}
                >
                  <option value="phone-alice">phone-alice (Sender's offline phone)</option>
                  <option value="phone-stranger1">phone-stranger1 (Stranger node)</option>
                  <option value="phone-stranger2">phone-stranger2 (Stranger node)</option>
                  <option value="phone-stranger3">phone-stranger3 (Stranger node)</option>
                  <option value="phone-bridge">phone-bridge (Direct Bridge)</option>
                </select>
              </div>
            </div>

            <div className="action-row">
              <label className="toggle-switch-label">
                <input
                  type="checkbox"
                  checked={tamper}
                  onChange={(e) => setTamper(e.target.checked)}
                />
                <span className="switch-slider" />
                <span style={{ color: tamper ? '#fb7185' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {tamper ? (
                    <>
                      <AlertOctagon size={13} color="#fb7185" />
                      Attack Mode: Corrupt 1 Byte in Ciphertext
                    </>
                  ) : (
                    'Normal Authenticated Payload'
                  )}
                </span>
              </label>

              <button
                type="submit"
                className="btn-action inject"
                disabled={isSubmitting || senderVpa === receiverVpa}
              >
                <SendHorizonal size={15} />
                {isSubmitting ? 'Injecting...' : 'Inject into Mesh'}
              </button>
            </div>
            {senderVpa === receiverVpa && (
              <p style={{ color: '#fb7185', fontSize: '11px', marginTop: '6px' }}>
                Sender and receiver cannot be identical.
              </p>
            )}
          </form>
        </div>

        {/* Step 2: Gossip round */}
        <div className="flow-step-box">
          <div className="step-indicator">
            <span className="step-num-badge" style={{ background: 'linear-gradient(135deg, #9333ea, #7e22ce)' }}>
              2
            </span>
            <span className="step-title">Broadcast via Bluetooth Gossip</span>
            <span className="step-desc">Packets hop device-to-device with TTL decrements</span>
          </div>
          <div className="action-row" style={{ marginTop: '4px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '420px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bluetooth size={14} color="#c084fc" />
              Simulates devices passing by each other in the basement, broadcasting store-and-forward packets over BLE.
            </p>
            <button
              type="button"
              className="btn-action gossip"
              onClick={onRunGossip}
              disabled={isSubmitting}
            >
              <Repeat size={15} />
              Run 1 Gossip Round
            </button>
          </div>
        </div>

        {/* Step 3: Bridge Flush */}
        <div className="flow-step-box">
          <div className="step-indicator">
            <span className="step-num-badge" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
              3
            </span>
            <span className="step-title">Bridge Node Walks Outside &amp; Uploads</span>
            <span className="step-desc">Detects 4G cellular signal &amp; triggers atomic settlement</span>
          </div>
          <div className="action-row" style={{ marginTop: '4px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '420px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RadioTower size={14} color="#34d399" />
              <code>phone-bridge</code> detects internet connectivity and POSTs all packets to <code>/api/bridge/ingest</code>.
            </p>
            <button
              type="button"
              className="btn-action flush"
              onClick={onFlushBridges}
              disabled={isSubmitting}
            >
              <CloudUpload size={15} />
              Flush Bridges (4G Upload)
            </button>
          </div>
        </div>

        {/* Step 4: Security & Concurrency Lab */}
        <div className="flow-step-box" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div className="step-indicator">
            <span className="step-num-badge" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
              4
            </span>
            <span className="step-title">Security &amp; Concurrency Stress Lab</span>
            <span className="step-desc">Test race-condition idempotency &amp; tamper immunity</span>
          </div>

          <div className="security-lab-grid">
            <div className="attack-card">
              <div>
                <h5>
                  <Layers size={15} color="#f59e0b" />
                  Concurrent Duplicate Storm
                </h5>
                <p>
                  Fires 3 concurrent bridge node threads delivering the exact same packet simultaneously to test 
                  atomic SHA-256 deduplication (SETNX).
                </p>
              </div>
              <button
                type="button"
                className="btn-attack"
                onClick={() => onDuplicateStorm(3)}
                disabled={isSubmitting}
              >
                <Zap size={13} color="#f59e0b" />
                <CopyCheck size={13} />
                Fire 3 Concurrent Bridges
              </button>
            </div>

            <div className="attack-card">
              <div>
                <h5>
                  <ShieldAlert size={15} color="#f43f5e" />
                  Ciphertext Bit-Flip Attack
                </h5>
                <p>
                  Modifies a single byte in the ciphertext. Proves AES-GCM authenticated encryption fails and flags 
                  transaction as <code>INVALID</code>.
                </p>
              </div>
              <button
                type="button"
                className="btn-attack"
                style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
                onClick={handleInjectTamperedAttack}
                disabled={isSubmitting}
              >
                <AlertOctagon size={13} />
                Inject Corrupted Packet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
