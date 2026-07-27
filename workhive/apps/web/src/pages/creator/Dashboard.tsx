import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function CreatorDashboard() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  return (
    <DashboardLayout requiredRole="client">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-h1 mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-body text-slate">Here's what's happening with your jobs</p>
        </div>
        <Link to="/creator/post-job" className="btn btn-primary btn-large">
          Post a Job
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
            <p className="text-small text-slate mb-2">Jobs Posted</p>
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
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <h2 className="text-h2 mb-2">No jobs yet</h2>
        <p className="text-body text-slate mb-4">
          Get started by posting your first job to find talented freelancers
        </p>
        <Link to="/creator/post-job" className="btn btn-primary">
          Post your first job
        </Link>
      </div>
    </DashboardLayout>
  );
}
