import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-white)', padding: '48px 0' }}>
      <div className="container">
        <div className="grid grid-cols-4 gap-5">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-display-md" style={{ color: '#FFFFFF' }}>Work</span>
              <span className="text-display-md" style={{ color: 'var(--color-info-blue)' }}>Hive</span>
            </div>
            <p className="text-small" style={{ color: 'var(--color-slate)' }}>
              India's trusted freelance marketplace for creators and workers.
            </p>
          </div>

          {/* For Creators */}
          <div>
            <h3 className="text-h3 mb-4">For Creators</h3>
            <ul className="flex flex-col gap-2">
              <li><Link to="/creator" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>Post a Job</Link></li>
              <li><Link to="/creator/my-jobs" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>My Jobs</Link></li>
              <li><Link to="/creator/payments" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>Payments</Link></li>
            </ul>
          </div>

          {/* For Workers */}
          <div>
            <h3 className="text-h3 mb-4">For Workers</h3>
            <ul className="flex flex-col gap-2">
              <li><Link to="/worker/browse-jobs" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>Browse Jobs</Link></li>
              <li><Link to="/worker/my-proposals" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>My Proposals</Link></li>
              <li><Link to="/worker/earnings" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>Earnings</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-h3 mb-4">Company</h3>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>About Us</a></li>
              <li><a href="#" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li><a href="#" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>Terms of Service</a></li>
              <li><a href="#" className="text-small" style={{ color: 'var(--color-slate)', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center mt-5 pt-5" style={{ borderTop: '1px solid var(--color-slate)' }}>
          <p className="text-small" style={{ color: 'var(--color-slate)' }}>
            © 2026 WorkHive. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" style={{ color: 'var(--color-slate)' }}>Twitter</a>
            <a href="#" style={{ color: 'var(--color-slate)' }}>LinkedIn</a>
            <a href="#" style={{ color: 'var(--color-slate)' }}>GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
