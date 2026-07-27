import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Earnings() {
  const { user } = useAuthStore();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    const balance = Number(user?.wallet_balance_paise) / 100;

    if (!withdrawAmount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      setError('Insufficient balance');
      return;
    }

    if (amount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }

    try {
      setIsWithdrawing(true);
      setError(null);
      
      // Note: In production, this would integrate with RazorpayX or similar
      // For demo purposes, we'll simulate a withdrawal
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(`Withdrawal request for ₹${amount.toLocaleString('en-IN')} submitted successfully`);
      setWithdrawAmount('');
    } catch (err) {
      setError('Failed to process withdrawal. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <DashboardLayout requiredRole="freelancer">
      <div className="mb-5">
        <h1 className="text-h1 mb-2">Earnings</h1>
        <p className="text-body text-slate">View your earnings and withdraw to your bank account</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="card mb-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-small text-slate mb-2">Wallet Balance</p>
            <p className="text-amount-lg text-amber">
              {user ? formatCurrency(user.wallet_balance_paise) : '₹0'}
            </p>
          </div>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-amber-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-amber-deep)' }}>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="card mb-5">
        <h2 className="text-h2 mb-4">Withdraw Earnings</h2>

        {error && (
          <div className="p-4 mb-4" style={{ 
            backgroundColor: 'var(--bg-rust-tint)', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-alert-rust)'
          }}>
            <p className="text-small text-alert-rust">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 mb-4" style={{ 
            backgroundColor: 'var(--bg-green-tint)', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-signal-green)'
          }}>
            <p className="text-small text-signal-green">{success}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-small text-slate mb-2 block">Amount to Withdraw (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate">₹</span>
              <input
                type="number"
                className="input w-full"
                style={{ paddingLeft: '32px' }}
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={100}
                max={user ? Number(user.wallet_balance_paise) / 100 : 0}
              />
            </div>
            <p className="text-small text-slate mt-2">
              Available: {user ? formatCurrency(user.wallet_balance_paise) : '₹0'}
            </p>
          </div>

          <div className="p-4" style={{ 
            backgroundColor: 'var(--bg-slate-light)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <h3 className="text-h3 mb-2">Withdrawal Info</h3>
            <ul className="flex flex-col gap-2 text-small text-slate">
              <li>• Minimum withdrawal: ₹100</li>
              <li>• Processing time: 1-3 business days</li>
              <li>• Funds will be transferred to your linked bank account</li>
              <li>• No withdrawal fees</li>
            </ul>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount}
            className="btn btn-primary btn-large"
          >
            {isWithdrawing ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>

      {/* Earnings History */}
      <div className="card">
        <h2 className="text-h2 mb-4">Recent Earnings</h2>
        <p className="text-body text-slate">
          Your earnings history will appear here once you start receiving payments
        </p>
      </div>
    </DashboardLayout>
  );
}
