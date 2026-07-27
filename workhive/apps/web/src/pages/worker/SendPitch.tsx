import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProposalSchema } from '@workhive/shared';
import type { CreateProposalInput, Job } from '@workhive/shared';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SendPitch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: job, isLoading, error: jobError } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: true; data: { job: Job } }>(`/jobs/${id}`);
      return response.data.data.job;
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProposalInput>({
    resolver: zodResolver(createProposalSchema),
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const onSubmit = async (data: CreateProposalInput) => {
    if (!id) return;

    try {
      setError(null);
      await apiClient.post(`/jobs/${id}/proposals`, data);
      navigate('/worker/my-proposals');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit proposal');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="freelancer">
        <div className="text-body text-slate">Loading...</div>
      </DashboardLayout>
    );
  }

  if (jobError || !job) {
    return (
      <DashboardLayout requiredRole="freelancer">
        <div className="card">
          <p className="text-body text-alert-rust">Failed to load job</p>
          <Link to="/worker/browse-jobs" className="btn btn-secondary mt-4">
            Back to Browse Jobs
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="freelancer">
      <div className="mb-4">
        <Link to="/worker/browse-jobs" className="btn btn-ghost" style={{ padding: 0 }}>
          ← Back to Browse Jobs
        </Link>
      </div>

      <div className="mb-5">
        <h1 className="text-h1 mb-2">Send a Pitch</h1>
        <p className="text-body text-slate">Submit your proposal for this job</p>
      </div>

      {error && (
        <div className="p-4 mb-4" style={{ 
          backgroundColor: 'var(--bg-rust-tint)', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-alert-rust)'
        }}>
          <p className="text-small text-alert-rust">{error}</p>
        </div>
      )}

      <div className="card mb-5">
        <h2 className="text-h2 mb-3">{job.title}</h2>
        <p className="text-body text-slate mb-4" style={{ whiteSpace: 'pre-wrap' }}>
          {job.description}
        </p>
        <div className="flex gap-4 text-small text-slate">
          <div>
            <span className="text-slate">Budget: </span>
            <span className="text-amount text-amber">{formatCurrency(job.budget_paise)}</span>
          </div>
          <div>
            <span className="text-slate">Posted by: </span>
            {job.client?.name}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
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

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-small text-slate mb-2 block">Your Bid Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate">₹</span>
              <input
                {...register('amount_paise')}
                type="number"
                className="input w-full"
                style={{ paddingLeft: '32px' }}
                placeholder="Enter your bid"
                min={100}
              />
            </div>
            {errors.amount_paise && (
              <p className="text-small text-alert-rust mt-2">{errors.amount_paise.message}</p>
            )}
            <p className="text-small text-slate mt-2">
              Minimum bid: ₹100
            </p>
          </div>

          <div>
            <label className="text-small text-slate mb-2 block">Why are you the right fit?</label>
            <textarea
              {...register('message')}
              className="input w-full"
              style={{ minHeight: '150px', resize: 'vertical' }}
              placeholder="Explain why you're perfect for this job, your relevant experience, and how you'll deliver quality work..."
            />
            {errors.message && (
              <p className="text-small text-alert-rust mt-2">{errors.message.message}</p>
            )}
          </div>

          <div className="flex gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={() => navigate('/worker/browse-jobs')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-large"
            >
              {isSubmitting ? 'Submitting...' : 'Send Pitch'}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
