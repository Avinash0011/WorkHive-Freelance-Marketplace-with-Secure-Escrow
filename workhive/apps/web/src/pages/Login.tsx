import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@workhive/shared';
import type { LoginInput } from '@workhive/shared';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'client' ? '/creator' : '/worker');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-5" style={{ backgroundColor: 'var(--color-bg-body)' }}>
      <div className="container" style={{ maxWidth: '400px' }}>
        <div className="card">
          <div className="text-center mb-5">
            <Link to="/" className="flex items-center justify-center gap-2 mb-4">
              <span className="text-display-md" style={{ color: '#1E2A4A' }}>Work</span>
              <span className="text-display-md" style={{ color: '#4A6CF7' }}>Hive</span>
            </Link>
            <h1 className="text-h1 mb-2">Welcome back</h1>
            <p className="text-body text-slate">Log in to your account</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="text-small text-slate mb-2 block">Email</label>
              <input
                {...register('email')}
                type="email"
                className="input w-full"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-small text-alert-rust mt-2">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-small text-slate mb-2 block">Password</label>
              <input
                {...register('password')}
                type="password"
                className="input w-full"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-small text-alert-rust mt-2">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-large mt-4">
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-body text-center mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-deep" style={{ color: '#4A6CF7' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
