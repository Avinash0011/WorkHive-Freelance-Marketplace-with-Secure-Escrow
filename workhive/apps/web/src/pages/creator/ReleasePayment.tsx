import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReviewSchema } from '@workhive/shared';
import type { CreateReviewInput, Job } from '@workhive/shared';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ReleasePayment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isReleasing, setIsReleasing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: job, isLoading, error } = useQuery({
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
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const handleReleasePayment = async () => {
    if (!id) return;

    if (!confirm('Are you sure you want to release the payment? This action cannot be undone.')) {
      return;
    }

    try {
      setIsReleasing(true);
      await apiClient.post(`/jobs/${id}/release-payment`);
      setShowReviewForm(true);
    } catch (error: any) {
      console.error('Failed to release payment:', error);
      alert(error.response?.data?.error?.message || 'Failed to release payment');
      setIsReleasing(false);
    }
  };

  const onSubmitReview = async (data: CreateReviewInput) => {
    if (!id) return;

    try {
      await apiClient.post(`/jobs/${id}/reviews`, data);
      navigate(`/creator/jobs/${id}`);
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      alert(error.response?.data?.error?.message || 'Failed to submit review');
    }
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
        <Link to={`/creator/jobs/${id}`} className="btn btn-ghost" style={{ padding: 0 }}>
          ← Back to Job
        </Link>
      </div>

      {!showReviewForm ? (
        <div className="card">
          <h1 className="text-h1 mb-4">Review Delivery</h1>

          <div className="mb-5">
            <h2 className="text-h2 mb-2">{job.title}</h2>
            <p className="text-body text-slate mb-4">
              Freelancer: {job.freelancer?.name}
            </p>
          </div>

          <div className="p-5 mb-5" style={{ 
            backgroundColor: 'var(--bg-green-tint)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <h3 className="text-h3 mb-3">Delivery Note</h3>
            <p className="text-body" style={{ whiteSpace: 'pre-wrap' }}>
              {job.delivery_note || 'No delivery note provided'}
            </p>
          </div>

          <div className="p-5 mb-5" style={{ 
            backgroundColor: 'var(--bg-amber-tint)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-body">Agreed Amount</span>
              <span className="text-amount-lg text-amber">
                {formatCurrency(job.agreed_amount_paise || job.budget_paise)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body text-slate">Platform Fee (10%)</span>
              <span className="text-amount text-slate">
                {formatCurrency(Number(job.agreed_amount_paise || job.budget_paise) * 0.1)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-3" style={{ 
              borderTop: '1px solid var(--color-amber-deep)',
              paddingTop: '12px'
            }}>
              <span className="text-h2">Freelancer Receives</span>
              <span className="text-amount-lg text-amber-deep">
                {formatCurrency(Number(job.agreed_amount_paise || job.budget_paise) * 0.9)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReleasePayment}
              disabled={isReleasing}
              className="btn btn-primary btn-large flex-1"
            >
              {isReleasing ? 'Releasing...' : 'Release Payment'}
            </button>
            <Link to={`/creator/jobs/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
          </div>

          <p className="text-small text-slate mt-4 text-center">
            By releasing payment, you confirm that you're satisfied with the delivery.
            This action cannot be undone.
          </p>
        </div>
      ) : (
        <div className="card">
          <h1 className="text-h1 mb-4">Leave a Review</h1>

          <div className="p-5 mb-5" style={{ 
            backgroundColor: 'var(--bg-green-tint)', 
            borderRadius: 'var(--radius-sm)'
          }}>
            <p className="text-body text-signal-green">
              ✓ Payment released successfully!
            </p>
          </div>

          <p className="text-body text-slate mb-5">
            Would you like to leave a review for {job.freelancer?.name}?
          </p>

          <form onSubmit={handleSubmit(onSubmitReview)} className="flex flex-col gap-4">
            <div>
              <label className="text-small text-slate mb-2 block">Rating (1-5)</label>
              <select
                {...register('rating', { valueAsNumber: true })}
                className="input w-full"
              >
                <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                <option value="4">⭐⭐⭐⭐ - Good</option>
                <option value="3">⭐⭐⭐ - Average</option>
                <option value="2">⭐⭐ - Below Average</option>
                <option value="1">⭐ - Poor</option>
              </select>
              {errors.rating && (
                <p className="text-small text-alert-rust mt-2">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label className="text-small text-slate mb-2 block">Comment (optional)</label>
              <textarea
                {...register('comment')}
                className="input w-full"
                style={{ minHeight: '100px', resize: 'vertical' }}
                placeholder="Share your experience working with this freelancer..."
              />
              {errors.comment && (
                <p className="text-small text-alert-rust mt-2">{errors.comment.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-large flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/creator/jobs/${id}`)}
                className="btn btn-secondary"
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
