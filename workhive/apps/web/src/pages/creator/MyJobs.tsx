import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function MyJobs() {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: true; data: { jobs: Job[] } }>('/jobs/mine');
      return response.data.data.jobs;
    },
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

  if (error) {
    return (
      <DashboardLayout requiredRole="client">
        <div className="card">
          <p className="text-body text-alert-rust">Failed to load jobs</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="client">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-h1 mb-2">My Jobs</h1>
          <p className="text-body text-slate">Manage your posted jobs and track their progress</p>
        </div>
        <Link to="/creator/post-job" className="btn btn-primary">
          Post a Job
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
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
      ) : (
        <div className="grid gap-4">
          {jobs?.map((job) => (
            <Link
              key={job.id}
              to={`/creator/jobs/${job.id}`}
              className="card block hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-h2 mb-2">{job.title}</h3>
                  <p className="text-body text-slate mb-3" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>
                </div>
                <span className={`badge ${statusColors[job.status as JobStatus]}`}>
                  {statusLabels[job.status as JobStatus]}
                </span>
              </div>

              <div className="flex gap-4 text-small text-slate">
                <div>
                  <span className="text-slate">Budget: </span>
                  <span className="text-amount text-amber">{formatCurrency(job.budget_paise)}</span>
                </div>
                <div>
                  <span className="text-slate">Deadline: </span>
                  {formatDate(job.deadline)}
                </div>
                <div>
                  <span className="text-slate">Proposals: </span>
                  {job._count?.proposals || 0}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {job.skills_required.slice(0, 4).map((skill) => (
                  <span key={skill} className="badge" style={{ 
                    backgroundColor: 'var(--bg-slate-light)',
                    color: 'var(--color-slate)'
                  }}>
                    {skill}
                  </span>
                ))}
                {job.skills_required.length > 4 && (
                  <span className="badge" style={{ 
                    backgroundColor: 'var(--bg-slate-light)',
                    color: 'var(--color-slate)'
                  }}>
                    +{job.skills_required.length - 4}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
