import { Link } from 'react-router-dom';
import { useState } from 'react';

const creatorSteps = [
  { title: 'Post a job', desc: 'Describe what you need, set your budget, and required skills' },
  { title: 'Review proposals', desc: 'Workers pitch with their bid amount and message' },
  { title: 'Hire & fund escrow', desc: 'Choose the best fit, your payment is held securely' },
  { title: 'Approve & release', desc: 'Review the work, release payment, leave a review' },
];

const workerSteps = [
  { title: 'Browse jobs', desc: 'Find projects that match your skills and budget' },
  { title: 'Send a pitch', desc: "Submit your bid amount and why you're the right fit" },
  { title: 'Get hired & deliver', desc: 'Once escrow is funded, start work and submit delivery' },
  { title: 'Get paid', desc: 'Payment released to your wallet on approval' },
];

const categories = [
  { name: 'Development & IT', icon: 'M8 3L2 12l6 9M16 3l6 9-6 9' },
  { name: 'Design & Creative', icon: 'M12 2a10 10 0 100 20c1.5 0 2-1 2-2s-.5-1.5-1-2-.5-1.5 1-2h2a4 4 0 004-4 8 8 0 00-8-10z' },
  { name: 'Sales & Marketing', icon: 'M3 3v18h18M7 15l4-4 3 3 5-6' },
  { name: 'Writing & Translation', icon: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z' },
  { name: 'Admin & Support', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { name: 'Finance & Accounting', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { name: 'Legal', icon: 'M12 3v18M5 8l-3 6a4 4 0 008 0zM19 8l-3 6a4 4 0 008 0zM3 21h18M12 3l7 5H5z' },
  { name: 'HR & Training', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { name: 'Engineering & Architecture', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
  { name: 'AI Services', icon: 'M12 2a5 5 0 015 5c0 1.5-.5 2-1 3l-1 2v2a3 3 0 01-6 0v-2l-1-2c-.5-1-1-1.5-1-3a5 5 0 015-5zM9 21h6' },
];

export default function Home() {
  const [audience, setAudience] = useState('hire');
  const steps = audience === 'hire' ? creatorSteps : workerSteps;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-white)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between p-5 bg-white border-b" style={{ borderColor: 'var(--color-slate-light)' }}>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-display-md" style={{ color: '#1E2A4A' }}>Work</span>
          <span className="text-display-md" style={{ color: 'var(--color-info-blue)' }}>Hive</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/hire-talent" className="text-body text-slate hover:text-amber-deep">Hire talent</Link>
          <Link to="/browse-jobs" className="text-body text-slate hover:text-amber-deep">Find work</Link>
          <Link to="/how-it-works" className="text-body text-slate hover:text-amber-deep">How it works</Link>
          <Link to="/pricing" className="text-body text-slate hover:text-amber-deep">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn btn-secondary">Log in</Link>
          <Link to="/signup" className="btn btn-primary">Sign up</Link>
        </div>
      </nav>

      {/* Promo strip */}
      <div className="flex items-center justify-between px-5" style={{
        background: 'linear-gradient(90deg, #FFE8C2 0%, #FFF6E6 100%)',
        padding: '12px 32px',
      }}>
        <p className="text-small font-semibold" style={{ color: '#1E2A4A', margin: 0 }}>
          New: escrow now settles in under 2 hours. See how WorkHive Pay works.
        </p>
        <Link to="/how-it-works" className="text-small font-semibold" style={{ color: 'var(--color-amber-deep)' }}>
          Learn more &rarr;
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #D6E4FF 0%, #EEF4FF 100%)' }}>
        <div className="container-marketing text-center">
          <h1 className="text-display-lg mb-4" style={{ maxWidth: '820px', margin: '0 auto 20px' }}>
            India's trusted freelance marketplace
          </h1>
          <p className="text-body text-slate mb-5" style={{ maxWidth: '600px', margin: '0 auto 32px', fontSize: '18px' }}>
            Connect with talented freelancers for your projects. Escrow-protected payments, transparent fees, and INR-native transactions.
          </p>

          {/* Pill toggle, Upwork-style */}
          <div className="flex justify-center mb-5">
            <div className="flex" style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: 'var(--radius-full)',
              padding: '4px',
              border: '1px solid rgba(30,42,74,0.12)',
            }}>
              <button
                onClick={() => setAudience('hire')}
                className="text-body font-semibold"
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: audience === 'hire' ? '#1E2A4A' : 'transparent',
                  color: audience === 'hire' ? '#FFFFFF' : '#1E2A4A',
                  transition: 'background-color 0.15s ease',
                }}
              >
                I want to hire
              </button>
              <button
                onClick={() => setAudience('work')}
                className="text-body font-semibold"
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: audience === 'work' ? '#1E2A4A' : 'transparent',
                  color: audience === 'work' ? '#FFFFFF' : '#1E2A4A',
                  transition: 'background-color 0.15s ease',
                }}
              >
                I want to work
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex justify-center">
            <div className="flex items-center" style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 6px 6px 24px',
              boxShadow: '0 8px 24px rgba(30,42,74,0.12)',
            }}>
              <input
                type="text"
                placeholder={audience === 'hire' ? 'Describe what you need done…' : 'Search jobs by skill or keyword…'}
                className="text-body"
                style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent' }}
              />
              <Link
                to={audience === 'hire' ? '/signup?role=client' : '/browse-jobs'}
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {audience === 'hire' ? 'Get started' : 'Search'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by strip */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container-marketing text-center">
          <p className="text-small font-semibold" style={{ color: 'var(--color-slate)', letterSpacing: '1px', marginBottom: '24px' }}>
            TRUSTED BY 12,000+ BUSINESSES ACROSS INDIA
          </p>
          <div className="flex items-center justify-center gap-5 flex-wrap" style={{ opacity: 0.6 }}>
            {['Northgate Retail', 'Bluepeak Studio', 'Vantara Foods', 'Crestline Labs', 'Orbit Logistics', 'Marigold Media'].map((name) => (
              <span key={name} className="text-h3" style={{ color: 'var(--color-slate)' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container-marketing">
          <h2 className="text-display-md mb-5">Find freelancers for every type of work</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
          }}>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/browse-jobs?category=${encodeURIComponent(cat.name)}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-slate-light)',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,42,74,0.08)';
                  e.currentTarget.style.borderColor = 'var(--color-amber)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-slate-light)';
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber-deep)" strokeWidth="1.75" style={{ marginBottom: '20px' }}>
                  <path d={cat.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-h2" style={{ color: '#1E2A4A', margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - tabbed like Upwork */}
      <section className="py-5">
        <div className="container-marketing">
          <div className="flex items-center justify-between mb-5" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="text-display-md" style={{ margin: 0 }}>How it works</h2>
            <div className="flex" style={{
              backgroundColor: 'var(--bg-slate-light)',
              borderRadius: 'var(--radius-full)',
              padding: '4px',
            }}>
              <button
                onClick={() => setAudience('hire')}
                className="text-small font-semibold"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: audience === 'hire' ? 'var(--color-white)' : 'transparent',
                  color: '#1E2A4A',
                  boxShadow: audience === 'hire' ? '0 1px 4px rgba(30,42,74,0.15)' : 'none',
                }}
              >
                For hiring
              </button>
              <button
                onClick={() => setAudience('work')}
                className="text-small font-semibold"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: audience === 'work' ? 'var(--color-white)' : 'transparent',
                  color: '#1E2A4A',
                  boxShadow: audience === 'work' ? '0 1px 4px rgba(30,42,74,0.15)' : 'none',
                }}
              >
                For finding work
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {steps.map((step, i) => (
              <div key={step.title} className="card">
                <div className="flex items-center justify-center" style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: audience === 'hire' ? 'var(--color-amber)' : 'var(--color-info-blue)',
                  color: 'var(--color-white)',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}>
                  {i + 1}
                </div>
                <p className="text-body font-semibold" style={{ marginBottom: '6px' }}>{step.title}</p>
                <p className="text-small text-slate">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark insights panel, Upwork cost-estimate style */}
      <section className="py-5">
        <div className="container-marketing">
          <div className="grid grid-cols-2 gap-5" style={{
            backgroundColor: '#1E2A4A',
            borderRadius: 'var(--radius-lg, 16px)',
            overflow: 'hidden',
            alignItems: 'center',
          }}>
            <div style={{ padding: '48px' }}>
              <h2 className="text-display-md mb-3" style={{ color: 'var(--color-white)' }}>
                Know your budget before you post
              </h2>
              <p className="text-body mb-4" style={{ color: 'var(--color-slate-light)' }}>
                We'll estimate the typical rate for the skills you need, based on real bids on WorkHive.
              </p>
              <div className="flex items-center" style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 6px 6px 20px',
                maxWidth: '420px',
              }}>
                <input
                  type="text"
                  placeholder="To start, describe what you need done"
                  className="text-body"
                  style={{ flex: 1, border: 'none', outline: 'none' }}
                />
                <button className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Next</button>
              </div>
            </div>
            <div style={{ padding: '48px' }}>
              <div className="flex justify-center gap-3 mb-3">
                <span className="text-small font-semibold" style={{
                  backgroundColor: 'var(--color-amber)',
                  color: 'var(--color-white)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  ₹800/hr
                </span>
                <span className="text-small font-semibold" style={{
                  backgroundColor: 'var(--color-info-blue)',
                  color: 'var(--color-white)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  ₹1,800/hr
                </span>
              </div>
              <p className="text-small text-center" style={{ color: 'var(--color-slate-light)' }}>
                Affordable &nbsp;·&nbsp; Typical &nbsp;·&nbsp; Expert
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-5" style={{ backgroundColor: 'var(--bg-slate-light)' }}>
        <div className="container-marketing">
          <h2 className="text-display-md text-center mb-5">Why WorkHive?</h2>
          <div className="grid grid-cols-3 gap-5">
            {[
              { title: 'Escrow Protection', desc: 'Your money is held securely until you approve the work. No risk of payment without delivery.', bg: 'var(--bg-green-tint)', color: 'var(--color-signal-green)', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
              { title: 'Fair Hiring', desc: 'Single-hire guarantee ensures no double-booking. One worker, one job, guaranteed.', bg: 'var(--bg-amber-tint)', color: 'var(--color-amber-deep)', path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
              { title: 'Transparent Fees', desc: 'Platform fee is shown upfront before you commit. No surprises, no hidden charges.', bg: 'var(--bg-blue-tint)', color: 'var(--color-info-blue)', path: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
              { title: 'INR-Native', desc: 'Built for India. No currency conversion, no international transaction fees.', bg: 'var(--bg-slate-light)', color: 'var(--color-slate)', path: 'M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z' },
              { title: 'Verified Payments', desc: 'Powered by Razorpay. Secure, reliable, and trusted payment gateway.', bg: 'var(--bg-green-tint)', color: 'var(--color-signal-green)', path: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01 9 11.01' },
              { title: 'Build Trust', desc: 'Two-way reviews after every project. Build your reputation over time.', bg: 'var(--bg-amber-tint)', color: 'var(--color-amber-deep)', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
            ].map((f) => (
              <div key={f.title} className="card" style={{ backgroundColor: 'var(--color-white)' }}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex items-center justify-center" style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-full)', backgroundColor: f.bg,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2">
                      <path d={f.path} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-h2 mb-2">{f.title}</h3>
                  <p className="text-body text-slate">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-center">
        <div className="container-marketing">
          <h2 className="text-display-md mb-4">Ready to get started?</h2>
          <p className="text-body text-slate mb-5" style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
            Join thousands of Creators and Workers already using WorkHive
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup?role=client" className="btn btn-primary btn-large">Post your first job</Link>
            <Link to="/signup?role=freelancer" className="btn btn-secondary btn-large">Find work</Link>
          </div>
        </div>
      </section>

      {/* Footer - expanded, Upwork-style column layout */}
      <footer className="py-5" style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-white)' }}>
        <div className="container-marketing">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <div>
              <h4 className="text-h3 mb-3">For Creators</h4>
              <ul className="flex flex-col gap-2">
                <li><Link to="/signup?role=client" className="text-small text-slate-light hover:text-white">Post a job</Link></li>
                <li><Link to="/browse-jobs" className="text-small text-slate-light hover:text-white">Browse freelancers</Link></li>
                <li><Link to="/how-it-works" className="text-small text-slate-light hover:text-white">Escrow & payments</Link></li>
                <li><Link to="/pricing" className="text-small text-slate-light hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-h3 mb-3">For Workers</h4>
              <ul className="flex flex-col gap-2">
                <li><Link to="/signup?role=freelancer" className="text-small text-slate-light hover:text-white">Find work</Link></li>
                <li><Link to="/browse-jobs" className="text-small text-slate-light hover:text-white">Browse jobs</Link></li>
                <li><Link to="/how-it-works" className="text-small text-slate-light hover:text-white">How it works</Link></li>
                <li><Link to="/wallet" className="text-small text-slate-light hover:text-white">Getting paid</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-h3 mb-3">Resources</h4>
              <ul className="flex flex-col gap-2">
                <li><Link to="/help" className="text-small text-slate-light hover:text-white">Help & support</Link></li>
                <li><Link to="/blog" className="text-small text-slate-light hover:text-white">Blog</Link></li>
                <li><Link to="/success-stories" className="text-small text-slate-light hover:text-white">Success stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-h3 mb-3">Company</h4>
              <ul className="flex flex-col gap-2">
                <li><Link to="/about" className="text-small text-slate-light hover:text-white">About us</Link></li>
                <li><Link to="/careers" className="text-small text-slate-light hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="text-small text-slate-light hover:text-white">Contact us</Link></li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-h2" style={{ color: '#FFFFFF' }}>Work</span>
                <span className="text-h2" style={{ color: 'var(--color-info-blue)' }}>Hive</span>
              </div>
              <p className="text-small" style={{ color: 'var(--color-slate-light)' }}>
                India's trusted freelance marketplace with escrow-protected payments.
              </p>
            </div>
          </div>
          <div className="pt-4" style={{ borderTop: '1px solid var(--color-slate-light)' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <p className="text-small" style={{ color: 'var(--color-slate-light)', margin: 0 }}>
                © 2026 WorkHive. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link to="/privacy" className="text-small text-slate-light hover:text-white">Privacy policy</Link>
                <Link to="/terms" className="text-small text-slate-light hover:text-white">Terms of service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}