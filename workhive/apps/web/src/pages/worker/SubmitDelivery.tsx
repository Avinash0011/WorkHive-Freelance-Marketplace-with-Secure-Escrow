import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDeliverySchema } from '@workhive/shared';
import type { CreateDeliveryInput, Job } from '@workhive/shared';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SubmitDelivery() {
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
  } = useForm<CreateDeliveryInput>({
    resolver: zodResolver(createDeliverySchema),
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const onSubmit = async (data: CreateDeliveryInput) => {
    if (!id) return;

    try {
      setError(null);
      await apiClient.post(`/jobs/${id}/delivery`, data);
      navigate('/worker/my-contracts');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit delivery');
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
          <Link to="/worker/my-contracts" className="btn btn-secondary mt-4">
            Back to My Contracts
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="freelancer">
      <div className="mb-4">
        <Link to="/worker/my-contracts" className="btn btn-ghost" style={{ padding: 0 }}>
          ← Back to My Contracts
        </Link>
      </div>

      <div className="mb-5">
        <h1 className="text-h1 mb-2">Submit Delivery</h1>
        <p className="text-body text-slate">Submit your work for review</p>
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
            <span className="text-slate">Agreed Amount: </span>
            <span className="text-amount text-amber">{formatCurrency(job.agreed_amount_paise || job.budget_paise)}</span>
          </div>
          <div>
            <span className="text-slate">Client: </span>
            {job.client?.name}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-small text-slate mb-2 block">Delivery Note</label>
            <textarea
              {...register('delivery_note')}
              className="input w-full"
              style={{ minHeight: '150px', resize: 'vertical' }}
              placeholder="Describe what you've delivered, any important notes, and links to your work..."
            />
            {errors.delivery_note && (
              <p className="text-small text-alert-rust mt-2">{errors.delivery_note.message}</p>
            )}
          </div>

          <div className="p-4" style={{ 
            backgroundColor: 'var(--bg-blue-tint)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <h3 className="text-h3 mb-2">What happens next?</h3>
            <ul className="flex flex-col gap-2 text-small text-slate">
              <li>• Client will review your delivery</li>
              <li>• If satisfied, they'll release payment</li>
              <li>• Payment will be added to your wallet (minus platform fee)</li>
              <li>• You can then withdraw your earnings</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={() => navigate('/worker/my-contracts')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-large"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Delivery'}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
