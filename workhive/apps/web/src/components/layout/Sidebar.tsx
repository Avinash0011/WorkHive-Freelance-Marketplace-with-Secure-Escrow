import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface SidebarProps {
  role: 'client' | 'freelancer';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const clientNavItems = [
    { path: '/creator', label: 'Overview', icon: '📊' },
    { path: '/creator/post-job', label: 'Post a Job', icon: '➕' },
    { path: '/creator/my-jobs', label: 'My Jobs', icon: '💼' },
    { path: '/creator/payments', label: 'Payments', icon: '💳' },
  ];

  const workerNavItems = [
    { path: '/worker', label: 'Overview', icon: '📊' },
    { path: '/worker/browse-jobs', label: 'Browse Jobs', icon: '🔍' },
    { path: '/worker/my-proposals', label: 'My Proposals', icon: '📝' },
    { path: '/worker/my-contracts', label: 'My Contracts', icon: '🤝' },
    { path: '/worker/earnings', label: 'Earnings', icon: '💰' },
  ];

  const navItems = role === 'client' ? clientNavItems : workerNavItems;

  return (
    <aside
      className="bg-white border-r flex flex-col"
      style={{
        width: isCollapsed ? '72px' : '260px',
        borderColor: 'var(--color-slate-lighter)',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)',
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--color-slate-lighter)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
          {!isCollapsed && (
            <>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: '#1E2A4A' }}>Work</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: '#4A6CF7' }}>Hive</span>
            </>
          )}
          {isCollapsed && (
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: '#4A6CF7' }}>W</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(74, 108, 247, 0.08)' : 'transparent',
                    color: isActive ? '#4A6CF7' : '#4A5B7E',
                    textDecoration: 'none',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(74, 108, 247, 0.04)';
                      e.currentTarget.style.color = '#4A6CF7';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4A5B7E';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--color-slate-lighter)' }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '8px',
            width: '100%',
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            background: 'transparent',
            color: '#64748B',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(74, 108, 247, 0.04)'; e.currentTarget.style.color = '#4A6CF7'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
        >
          {isCollapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </aside>
  );
}
