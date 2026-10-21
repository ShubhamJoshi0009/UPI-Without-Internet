import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Search,
  Clock,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  CopyCheck,
  ShieldX,
  AlertTriangle,
  IndianRupee,
  Route,
  RadioTower,
  Binary,
  ArrowLeftRight,
  Hash,
  Activity,
} from 'lucide-react';
import type { Transaction } from '../types';

interface TransactionLedgerProps {
  transactions: Transaction[];
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filtered = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      tx.senderVpa.toLowerCase().includes(q) ||
      tx.receiverVpa.toLowerCase().includes(q) ||
      tx.bridgeNodeId.toLowerCase().includes(q) ||
      tx.packetHash.toLowerCase().includes(q) ||
      String(tx.id).includes(q)
    );
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'SETTLED':
        return (
          <span className="badge-status SETTLED">
            <BadgeCheck size={12} />
            SETTLED
          </span>
        );
      case 'DUPLICATE_DROPPED':
        return (
          <span className="badge-status DUPLICATE_DROPPED">
            <CopyCheck size={12} />
            DUPLICATE_DROPPED
          </span>
        );
      case 'INVALID':
        return (
          <span className="badge-status INVALID">
            <ShieldX size={12} />
            INVALID
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="badge-status REJECTED">
            <AlertTriangle size={12} />
            REJECTED
          </span>
        );
    }
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <h3 className="card-title">
          <FileText size={18} color="#38bdf8" />
          Settled Transaction Ledger (Top 20)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={13}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '10px' }}
            />
            <input
              type="text"
              placeholder="Search by VPA, Bridge or Hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '30px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '12px',
                width: '240px',
              }}
            />
          </div>
          <span className="card-subtitle">
            {filtered.length} Recorded
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Hash size={11} /> Tx ID
                </span>
              </th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowLeftRight size={11} /> Transfer Flow
                </span>
              </th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <IndianRupee size={11} /> Amount
                </span>
              </th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={11} /> Settlement Status
                </span>
              </th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RadioTower size={11} /> Bridge Gateway
                </span>
              </th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Route size={11} /> Hops
                </span>
              </th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Binary size={11} /> Ciphertext SHA-256 Hash
                </span>
              </th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> Settled Time
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((tx) => (
                <tr key={tx.id}>
                  <td className="mono" style={{ fontWeight: 700, color: '#38bdf8' }}>
                    #{tx.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="mono" style={{ color: '#f8fafc' }}>
                        {tx.senderVpa}
                      </span>
                      <ArrowRight size={12} color="var(--text-dim)" />
                      <span className="mono" style={{ color: '#34d399' }}>
                        {tx.receiverVpa}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="mono"
                      style={{ fontWeight: 700, color: '#34d399', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}
                    >
                      <IndianRupee size={12} />
                      {parseFloat(String(tx.amount)).toFixed(2)}
                    </span>
                  </td>
                  <td>{getStatusBadge(tx.status)}</td>
                  <td>
                    <span className="spec-pill" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <RadioTower size={10} />
                      {tx.bridgeNodeId}
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ color: 'var(--text-muted)' }}>
                      {tx.hopCount} hop{tx.hopCount === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className="mono"
                        style={{ fontSize: '11px', color: 'var(--text-dim)' }}
                        title={tx.packetHash}
                      >
                        {tx.packetHash ? `${tx.packetHash.substring(0, 14)}...` : 'N/A'}
                      </span>
                      {tx.packetHash && (
                        <button
                          className="copy-btn"
                          onClick={() => handleCopy(tx.packetHash)}
                          title="Copy Full SHA-256 Hash"
                        >
                          {copiedHash === tx.packetHash ? (
                            <Check size={12} color="#34d399" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-dim)' }}>
                      <Clock size={11} />
                      <span>{new Date(tx.settledAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                  <ShieldCheck size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} color="#38bdf8" />
                  No settled transactions recorded yet. Complete Step 1 &rarr; Step 2 &rarr; Step 3 to execute an offline payment!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
