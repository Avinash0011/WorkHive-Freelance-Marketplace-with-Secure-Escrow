import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: true; data: { job: Job } }>(`/jobs/${id}`);
      return response.data.data.job;
    },
    enabled: !!id,
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="client">
        <div className="text-body text-slate">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout requiredRole="client">
        <div className="card">
          <p className="text-body text-alert-rust">Failed to load job</p>
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

      <div className="card mb-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-h1 mb-2">{job.title}</h1>
            <div className="flex gap-4 text-small text-slate">
              <span>Posted on {new Date(job.created_at).toLocaleDateString('en-IN')}</span>
              <span className={`badge ${statusColors[job.status as JobStatus]}`}>
                {statusLabels[job.status as JobStatus]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">
          <div>
            <p className="text-small text-slate mb-1">Budget</p>
            <p className="text-amount text-amber">{formatCurrency(job.budget_paise)}</p>
          </div>
          <div>
            <p className="text-small text-slate mb-1">Deadline</p>
            <p className="text-body">{formatDate(job.deadline)}</p>
          </div>
          <div>
            <p className="text-small text-slate mb-1">Proposals</p>
            <p className="text-body">{job._count?.proposals || 0}</p>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-h2 mb-3">Description</h2>
          <p className="text-body text-slate" style={{ whiteSpace: 'pre-wrap' }}>
            {job.description}
          </p>
        </div>

        <div className="mb-5">
          <h2 className="text-h2 mb-3">Required Skills</h2>
          <div className="flex gap-2 flex-wrap">
            {job.skills_required.map((skill) => (
              <span key={skill} className="badge" style={{ 
                backgroundColor: 'var(--bg-amber-tint)',
                color: 'var(--color-amber-deep)'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {job.status === 'posted' && (
          <div className="flex gap-4">
            <Link to={`/creator/jobs/${job.id}/proposals`} className="btn btn-primary">
              View Proposals ({job._count?.proposals || 0})
            </Link>
          </div>
        )}

        {job.status === 'assigned' && (
          <div className="p-4" style={{ 
            backgroundColor: 'var(--bg-amber-tint)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <p className="text-body">
              <strong>Assigned to:</strong> {job.freelancer?.name || 'Loading...'}
            </p>
            <Link to={`/creator/jobs/${job.id}/fund-escrow`} className="btn btn-primary mt-3">
              Fund Escrow
            </Link>
          </div>
        )}

        {job.status === 'escrowed' && (
          <div className="p-4" style={{ 
            backgroundColor: 'var(--bg-blue-tint)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <p className="text-body">
              <strong>Escrow funded:</strong> {formatCurrency(job.agreed_amount_paise || job.budget_paise)}
            </p>
            <p className="text-small text-slate mt-2">
              Waiting for freelancer to submit delivery
            </p>
          </div>
        )}

        {job.status === 'submitted' && (
          <div className="p-4" style={{ 
            backgroundColor: 'var(--bg-green-tint)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <p className="text-body">
              <strong>Delivery submitted!</strong>
            </p>
            <p className="text-small text-slate mt-2 mb-3">
              {job.delivery_note}
            </p>
            <Link to={`/creator/jobs/${job.id}/release-payment`} className="btn btn-primary">
              Review & Release Payment
            </Link>
          </div>
        )}

        {(job.status === 'draft' || job.status === 'posted') && (
          <div className="flex gap-4 mt-4">
            <Link to={`/creator/jobs/${job.id}/edit`} className="btn btn-secondary">
              Edit Job
            </Link>
            {job.status === 'posted' && (
              <button 
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this job?')) {
                    try {
                      await apiClient.delete(`/jobs/${job.id}`);
                      navigate('/creator/my-jobs');
                    } catch (error) {
                      console.error('Failed to delete job:', error);
                    }
                  }
                }}
                className="btn btn-danger"
              >
                Delete Job
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
