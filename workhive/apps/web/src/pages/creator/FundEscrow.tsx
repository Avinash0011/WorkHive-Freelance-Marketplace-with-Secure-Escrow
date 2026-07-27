import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import type { Job } from '@workhive/shared';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function FundEscrow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleFundEscrow = async () => {
    if (!id) return;

    try {
      setIsProcessing(true);
      const response = await apiClient.post<{ success: true; data: { order: any } }>(`/jobs/${id}/fund-escrow`);
      const { order } = response.data.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: order.amount,
          currency: order.currency,
          name: 'WorkHive',
          description: 'Fund Escrow',
          order_id: order.id,
          handler: async (response: any) => {
            try {
              await apiClient.post('/verify-escrow', {
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              navigate(`/creator/jobs/${id}`);
            } catch (error) {
              console.error('Payment verification failed:', error);
              alert('Payment verification failed. Please try again.');
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error: any) {
      console.error('Failed to create escrow order:', error);
      alert(error.response?.data?.error?.message || 'Failed to create escrow order');
      setIsProcessing(false);
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

      <div className="card">
        <h1 className="text-h1 mb-4">Fund Escrow</h1>

        <div className="mb-5">
          <h2 className="text-h2 mb-2">{job.title}</h2>
          <p className="text-body text-slate">
            You're about to fund the escrow for this job. The amount will be held securely until you approve the delivery.
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
          <div className="flex justify-between items-center mb-3">
            <span className="text-body text-slate">Platform Fee (10%)</span>
            <span className="text-amount text-slate">
              {formatCurrency(Number(job.agreed_amount_paise || job.budget_paise) * 0.1)}
            </span>
          </div>
          <div className="flex justify-between items-center" style={{ 
            borderTop: '1px solid var(--color-amber-deep)',
            paddingTop: '12px'
          }}>
            <span className="text-h2">Total to Pay</span>
            <span className="text-amount-lg text-amber-deep">
              {formatCurrency(job.agreed_amount_paise || job.budget_paise)}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-h3 mb-3">What happens next?</h3>
          <ul className="flex flex-col gap-2">
            <li className="flex gap-2 items-start">
              <span className="text-amber">1.</span>
              <span className="text-body">Your payment is held securely in escrow</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-amber">2.</span>
              <span className="text-body">Freelancer submits their delivery</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-amber">3.</span>
              <span className="text-body">You review the work</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-amber">4.</span>
              <span className="text-body">Payment is released to the freelancer (minus platform fee)</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleFundEscrow}
            disabled={isProcessing}
            className="btn btn-primary btn-large flex-1"
          >
            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(job.agreed_amount_paise || job.budget_paise)}`}
          </button>
          <Link to={`/creator/jobs/${id}`} className="btn btn-secondary">
            Cancel
          </Link>
        </div>

        <p className="text-small text-slate mt-4 text-center">
          Payments are processed securely via Razorpay
        </p>
      </div>
    </DashboardLayout>
  );
}
