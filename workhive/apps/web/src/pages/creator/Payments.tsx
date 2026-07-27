import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import type { Payment, PaymentType, PaymentStatus } from '@workhive/shared';

const typeColors: Record<PaymentType, string> = {
  escrow: 'badge-assigned',
  release: 'badge-paid',
  refund: 'badge-rejected',
};

const typeLabels: Record<PaymentType, string> = {
  escrow: 'Escrow',
  release: 'Release',
  refund: 'Refund',
};

const statusColors: Record<PaymentStatus, string> = {
  pending: 'badge-pending',
  succeeded: 'badge-succeeded',
  failed: 'badge-failed',
};

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'Pending',
  succeeded: 'Succeeded',
  failed: 'Failed',
};

export default function Payments() {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['my-payments'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: true; data: { payments: Payment[] } }>('/payments/mine');
      return response.data.data.payments;
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
      hour: '2-digit',
      minute: '2-digit',
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
          <p className="text-body text-alert-rust">Failed to load payments</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="client">
      <div className="mb-5">
        <h1 className="text-h1 mb-2">Payments</h1>
        <p className="text-body text-slate">View your transaction history</p>
      </div>

      {!payments || payments.length === 0 ? (
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
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h2 className="text-h2 mb-2">No payments yet</h2>
          <p className="text-body text-slate">
            Your payment history will appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments?.map((payment) => (
            <div key={payment.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-h2">{payment.job?.title || 'Unknown Job'}</h3>
                    <span className={`badge ${typeColors[payment.type as PaymentType]}`}>
                      {typeLabels[payment.type as PaymentType]}
                    </span>
                    <span className={`badge ${statusColors[payment.status as PaymentStatus]}`}>
                      {statusLabels[payment.status as PaymentStatus]}
                    </span>
                  </div>
                  <p className="text-small text-slate">
                    {formatDate(payment.created_at)}
                  </p>
                </div>
                <p className="text-amount-lg text-amber">
                  {formatCurrency(payment.amount_paise)}
                </p>
              </div>

              {!!payment.platform_fee_paise && (
                <div className="flex justify-between items-center text-small text-slate" style={{ 
                  borderTop: '1px solid var(--color-slate-light)',
                  paddingTop: '12px'
                }}>
                  <span>Platform Fee</span>
                  <span>{formatCurrency(payment.platform_fee_paise)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
