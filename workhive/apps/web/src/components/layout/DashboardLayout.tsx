import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole: 'client' | 'freelancer';
}

export default function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Redirect if wrong role
  if (!isLoading && user && user.role !== requiredRole) {
    navigate(user.role === 'client' ? '/creator' : '/worker');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-body)' }}>
        <div className="text-body text-slate">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ backgroundColor: 'var(--color-bg-body)' }}>
      <Sidebar role={requiredRole} />
      <main style={{ marginLeft: '260px', width: 'calc(100% - 260px)', minHeight: '100vh' }}>
        <div className="container py-5">
          {children}
        </div>
      </main>
    </div>
  );
}
