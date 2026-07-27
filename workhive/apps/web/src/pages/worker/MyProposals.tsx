import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import type { Proposal, ProposalStatus } from '@workhive/shared';

const statusColors: Record<ProposalStatus, string> = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
  withdrawn: 'badge-withdrawn',
};

const statusLabels: Record<ProposalStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export default function MyProposals() {
  const { data: proposals, isLoading, error } = useQuery({
    queryKey: ['my-proposals'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: true; data: { proposals: Proposal[] } }>('/proposals/mine');
      return response.data.data.proposals;
    },
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleWithdraw = async (proposalId: string) => {
    if (!confirm('Are you sure you want to withdraw this proposal?')) {
      return;
    }

    try {
      await apiClient.post(`/proposals/${proposalId}/withdraw`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to withdraw proposal:', error);
    }
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
          <p className="text-body text-alert-rust">Failed to load proposals</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="freelancer">
      <div className="mb-5">
        <h1 className="text-h1 mb-2">My Proposals</h1>
        <p className="text-body text-slate">Track your submitted proposals</p>
      </div>

      {!proposals || proposals.length === 0 ? (
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 className="text-h2 mb-2">No proposals yet</h2>
          <p className="text-body text-slate mb-4">
            Start browsing jobs and send proposals to get hired
          </p>
          <Link to="/worker/browse-jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {proposals?.map((proposal) => (
            <div key={proposal.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-h2">{proposal.job?.title}</h3>
                    <span className={`badge ${statusColors[proposal.status as ProposalStatus]}`}>
                      {statusLabels[proposal.status as ProposalStatus]}
                    </span>
                  </div>
                  <p className="text-small text-slate mb-2">
                    Posted by {proposal.job?.client?.name}
                  </p>
                  <p className="text-body text-slate mb-3" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {proposal.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-small text-slate mb-3">
                <div>
                  <span className="text-slate">Your Bid: </span>
                  <span className="text-amount text-amber">{formatCurrency(proposal.amount_paise)}</span>
                </div>
                <div>
                  <span className="text-slate">Submitted: </span>
                  {formatDate(proposal.created_at)}
                </div>
              </div>

              <div className="flex gap-4">
                {proposal.status === 'accepted' && (
                  <Link to={`/worker/contracts/${proposal.job_id}`} className="btn btn-primary">
                    View Contract
                  </Link>
                )}
                {proposal.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(proposal.id)}
                    className="btn btn-danger"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
