import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="flex items-center justify-between p-5 bg-white border-b" style={{ borderColor: 'var(--color-slate-light)' }}>
      <Link to="/" className="flex items-center gap-2">
        <span className="text-display-md" style={{ color: '#1E2A4A' }}>Work</span>
        <span className="text-display-md" style={{ color: 'var(--color-info-blue)' }}>Hive</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        <Link to="/worker/browse-jobs" className="text-body text-slate hover:text-amber-deep">
          Browse jobs
        </Link>
        {isAuthenticated ? (
          <>
            {user?.role === 'client' && (
              <Link to="/creator" className="text-body text-slate hover:text-amber-deep">
                Dashboard
              </Link>
            )}
            {user?.role === 'freelancer' && (
              <Link to="/worker" className="text-body text-slate hover:text-amber-deep">
                Dashboard
              </Link>
            )}
            <button onClick={logout} className="btn btn-secondary btn-compact">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-body text-slate hover:text-amber-deep">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary btn-compact">
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden btn btn-ghost btn-compact"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isMobileMenuOpen ? (
            <line x1="18" y1="6" x2="6" y2="18" />
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b p-5" style={{ borderColor: 'var(--color-slate-light)' }}>
          <div className="flex flex-col gap-4">
            <Link to="/worker/browse-jobs" className="text-body text-slate" onClick={() => setIsMobileMenuOpen(false)}>
              Browse jobs
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'client' && (
                  <Link to="/creator" className="text-body text-slate" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                {user?.role === 'freelancer' && (
                  <Link to="/worker" className="text-body text-slate" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-body text-slate" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
