import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import type { Job, JobStatus } from '@workhive/shared';

const statusColors: Record<JobStatus, string> = {
  draft: 'badge-draft',
  posted: 'badge-posted',
  assigned: 'badge-assigned',
  escrowed: 'badge-escrowed',
  submitted: 'badge-submitted',
  paid: 'badge-paid',
  cancelled: 'badge-cancelled',
};

const statusLabels: Record<JobStatus, string> = {
  draft: 'Draft',
  posted: 'Posted',
  assigned: 'Assigned',
  escrowed: 'Escrowed',
  submitted: 'Submitted',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export default function MyContracts() {
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['my-contracts'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: true; data: { contracts: Job[] } }>('/contracts/mine');
      return response.data.data.contracts;
    },
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="freelancer">
        <div className="text-body text-slate">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout requiredRole="freelancer">
        <div className="card">
          <p className="text-body text-alert-rust">Failed to load contracts</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="freelancer">
      <div className="mb-5">
        <h1 className="text-h1 mb-2">My Contracts</h1>
        <p className="text-body text-slate">Manage your active and completed contracts</p>
      </div>

      {!contracts || contracts.length === 0 ? (
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2 className="text-h2 mb-2">No contracts yet</h2>
          <p className="text-body text-slate mb-4">
            Get hired on jobs to start working on contracts
          </p>
          <Link to="/worker/browse-jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts?.map((contract) => (
            <div key={contract.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-h2">{contract.title}</h3>
                    <span className={`badge ${statusColors[contract.status as JobStatus]}`}>
                      {statusLabels[contract.status as JobStatus]}
                    </span>
                  </div>
                  <p className="text-small text-slate mb-2">
                    Client: {contract.client?.name}
                  </p>
                  <p className="text-body text-slate mb-3" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {contract.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-small text-slate mb-3">
                <div>
                  <span className="text-slate">Agreed Amount: </span>
                  <span className="text-amount text-amber">{formatCurrency(contract.agreed_amount_paise || contract.budget_paise)}</span>
                </div>
                <div>
                  <span className="text-slate">Hired: </span>
                  {formatDate(contract.hired_at)}
                </div>
              </div>

              <div className="flex gap-4">
                {contract.status === 'escrowed' && (
                  <Link to={`/worker/contracts/${contract.id}/submit`} className="btn btn-primary">
                    Submit Delivery
                  </Link>
                )}
                {contract.status === 'submitted' && (
                  <div className="p-3" style={{ 
                    backgroundColor: 'var(--bg-green-tint)', 
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-signal-green)'
                  }}>
                    ✓ Delivery submitted - waiting for client review
                  </div>
                )}
                {contract.status === 'paid' && (
                  <div className="p-3" style={{ 
                    backgroundColor: 'var(--bg-amber-tint)', 
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-amber-deep)'
                  }}>
                    ✓ Payment released
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
