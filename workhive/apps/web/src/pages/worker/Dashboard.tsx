import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function WorkerDashboard() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  return (
    <DashboardLayout requiredRole="freelancer">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-h1 mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-body text-slate">Here's what's happening with your work</p>
        </div>
        <Link to="/worker/browse-jobs" className="btn btn-primary btn-large">
          Browse Jobs
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        <div className="card">
          <div className="flex flex-col">
            <p className="text-small text-slate mb-2">Wallet Balance</p>
            <p className="text-amount-lg text-amber">
              {user ? formatCurrency(user.wallet_balance_paise) : '₹0'}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col">
            <p className="text-small text-slate mb-2">Proposals Sent</p>
            <p className="text-amount-lg">0</p>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col">
            <p className="text-small text-slate mb-2">Active Contracts</p>
            <p className="text-amount-lg">0</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="card text-center py-6">
        <div className="mb-4" style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-slate-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-slate)' }}>
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
            <line x1="16" y1="8" x2="2" y2="22"/>
            <line x1="17.5" y1="15" x2="9" y2="15"/>
          </svg>
        </div>
        <h2 className="text-h2 mb-2">Start finding work</h2>
        <p className="text-body text-slate mb-4">
          Browse available jobs and send proposals to start earning
        </p>
        <Link to="/worker/browse-jobs" className="btn btn-primary">
          Browse Jobs
        </Link>
      </div>
    </DashboardLayout>
  );
}
