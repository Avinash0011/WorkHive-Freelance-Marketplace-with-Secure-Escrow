import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

export default function Proposals() {
  const { id } = useParams<{ id: string }>();

  const { data: proposals, isLoading, error } = useQuery({
    queryKey: ['job-proposals', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: true; data: { proposals: Proposal[] } }>(`/jobs/${id}/proposals`);
      return response.data.data.proposals;
    },
    enabled: !!id,
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const handleHire = async (proposalId: string) => {
    if (!confirm('Are you sure you want to hire this freelancer? This will reject all other proposals.')) {
      return;
    }

    try {
      await apiClient.post(`/proposals/${proposalId}/accept`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to accept proposal:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="client">
        <div className="text-body text-slate">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout requiredRole="client">
        <div className="card">
          <p className="text-body text-alert-rust">Failed to load proposals</p>
          <Link to="/creator/my-jobs" className="btn btn-secondary mt-4">
            Back to My Jobs
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="client">
      <div className="mb-4">
        <Link to="/creator/my-jobs" className="btn btn-ghost" style={{ padding: 0 }}>
          ← Back to My Jobs
        </Link>
      </div>

      <div className="mb-5">
        <h1 className="text-h1 mb-2">Proposals</h1>
        <p className="text-body text-slate">
          {proposals?.length || 0} proposal{proposals?.length !== 1 ? 's' : ''} received
        </p>
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
            Share your job with freelancers to start receiving proposals
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {proposals?.map((proposal) => (
            <div key={proposal.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-h2">{proposal.freelancer?.name}</h3>
                    {proposal.freelancer?.rating_avg && (
                      <span className="badge" style={{ 
                        backgroundColor: 'var(--bg-amber-tint)',
                        color: 'var(--color-amber-deep)'
                      }}>
                        ⭐ {Number(proposal.freelancer.rating_avg).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {proposal.freelancer?.headline && (
                    <p className="text-small text-slate mb-2">{proposal.freelancer.headline}</p>
                  )}
                  {proposal.freelancer?.skills && proposal.freelancer.skills.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {proposal.freelancer.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="badge" style={{ 
                          backgroundColor: 'var(--bg-slate-light)',
                          color: 'var(--color-slate)'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`badge ${statusColors[proposal.status as ProposalStatus]}`}>
                  {statusLabels[proposal.status as ProposalStatus]}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-body" style={{ whiteSpace: 'pre-wrap' }}>
                  {proposal.message}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-amount text-amber">
                  Bid: {formatCurrency(proposal.amount_paise)}
                </p>
                {proposal.status === 'pending' && (
                  <button
                    onClick={() => handleHire(proposal.id)}
                    className="btn btn-primary"
                  >
                    Hire
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
