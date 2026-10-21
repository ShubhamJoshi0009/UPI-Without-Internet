import React from 'react';
import {
  CreditCard,
  IndianRupee,
  ArrowUpRight,
  UserCheck,
  Coins,
  Shield,
} from 'lucide-react';
import type { Account } from '../types';

interface AccountsGridProps {
  accounts: Account[];
  onSelectAccount?: (vpa: string) => void;
}

export const AccountsGrid: React.FC<AccountsGridProps> = ({ accounts, onSelectAccount }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #0284c7, #38bdf8)',
      'linear-gradient(135deg, #7c3aed, #c084fc)',
      'linear-gradient(135deg, #059669, #34d399)',
      'linear-gradient(135deg, #d97706, #fbbf24)',
    ];
    return gradients[index % gradients.length];
  };

  const totalLiquidity = accounts.reduce(
    (sum, a) => sum + (parseFloat(String(a.balance)) || 0),
    0
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#34d399" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            Demo User Accounts &amp; Wallets
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          <span>Total Liquidity:</span>
          <span style={{ color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
            <IndianRupee size={12} />
            {totalLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="accounts-grid">
        {accounts.map((acc, index) => {
          const balanceNum = parseFloat(String(acc.balance)) || 0;

          return (
            <div key={acc.vpa} className="wallet-card">
              <div className="wallet-header">
                <div className="wallet-user">
                  <div
                    className="user-avatar"
                    style={{ background: getAvatarGradient(index) }}
                  >
                    {getInitials(acc.holderName)}
                  </div>
                  <div className="user-details">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {acc.holderName}
                      <Shield size={12} color="#38bdf8" />
                    </h4>
                    <span>{acc.vpa}</span>
                  </div>
                </div>
                <CreditCard size={18} color="rgba(255, 255, 255, 0.2)" />
              </div>

              <div className="wallet-balance-wrap">
                <div className="balance-label">Available Balance</div>
                <div className="balance-amount" style={{ display: 'flex', alignItems: 'center' }}>
                  <IndianRupee size={20} />
                  {balanceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {onSelectAccount && (
                <div className="wallet-actions">
                  <button
                    className="btn-wallet-action"
                    onClick={() => onSelectAccount(acc.vpa)}
                    title={`Send money from ${acc.holderName}`}
                  >
                    <UserCheck size={12} />
                    Send from here <ArrowUpRight size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
