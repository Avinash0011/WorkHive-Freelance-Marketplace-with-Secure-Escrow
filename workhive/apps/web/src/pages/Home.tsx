import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-5 bg-white border-b" style={{ borderColor: 'var(--color-slate-light)' }}>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-display-md" style={{ color: '#1E2A4A' }}>Work</span>
          <span className="text-display-md" style={{ color: 'var(--color-info-blue)' }}>Hive</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/browse-jobs" className="text-body text-slate hover:text-amber-deep">
            Browse jobs
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Log in
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #D6E4FF 0%, #EEF4FF 100%)' }}>
        <div className="container-marketing text-center">
          <h1 className="text-display-lg mb-4" style={{ maxWidth: '800px', margin: '0 auto 24px' }}>
            India's trusted freelance marketplace
          </h1>
          <p className="text-body text-slate mb-5" style={{ maxWidth: '600px', margin: '0 auto 48px', fontSize: '18px' }}>
            Connect with talented freelancers for your projects. Escrow-protected payments, transparent fees, and INR-native transactions.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup?role=client" className="btn btn-primary btn-large">
              I want to hire
            </Link>
            <Link to="/signup?role=freelancer" className="btn btn-secondary btn-large">
              I want to work
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container-marketing">
          <h2 className="text-display-md text-center mb-5">How it works</h2>
          <div className="grid grid-cols-2 gap-5">
            {/* Creator Track */}
            <div className="card">
              <h3 className="text-h2 mb-4 text-amber">For Creators</h3>
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-amber)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <div>
                    <p className="text-body font-semibold">Post a job</p>
                    <p className="text-small text-slate">Describe what you need, set your budget, and required skills</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-amber)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <div>
                    <p className="text-body font-semibold">Review proposals</p>
                    <p className="text-small text-slate">Workers pitch with their bid amount and message</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-amber)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    3
                  </div>
                  <div>
                    <p className="text-body font-semibold">Hire & fund escrow</p>
                    <p className="text-small text-slate">Choose the best fit, your payment is held securely</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-amber)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    4
                  </div>
                  <div>
                    <p className="text-body font-semibold">Approve & release</p>
                    <p className="text-small text-slate">Review the work, release payment, leave a review</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Track */}
            <div className="card">
              <h3 className="text-h2 mb-4" style={{ color: 'var(--color-info-blue)' }}>For Workers</h3>
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-info-blue)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <div>
                    <p className="text-body font-semibold">Browse jobs</p>
                    <p className="text-small text-slate">Find projects that match your skills and budget</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-info-blue)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <div>
                    <p className="text-body font-semibold">Send a pitch</p>
                    <p className="text-small text-slate">Submit your bid amount and why you're the right fit</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-info-blue)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    3
                  </div>
                  <div>
                    <p className="text-body font-semibold">Get hired & deliver</p>
                    <p className="text-small text-slate">Once escrow is funded, start work and submit delivery</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center" style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-info-blue)',
                    color: 'var(--color-white)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    4
                  </div>
                  <div>
                    <p className="text-body font-semibold">Get paid</p>
                    <p className="text-small text-slate">Payment released to your wallet on approval</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container-marketing">
          <h2 className="text-display-md text-center mb-5">Why WorkHive?</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="card">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4" style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-green-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-signal-green)' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 className="text-h2 mb-2">Escrow Protection</h3>
                <p className="text-body text-slate">Your money is held securely until you approve thework. No risk of payment without delivery.</p>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4" style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-amber-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-amber-deep)' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="text-h2 mb-2">Fair Hiring</h3>
                <p className="text-body text-slate">Single-hire guarantee ensures no double-booking. One Worker, one job, guaranteed.</p>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4" style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-blue-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-info-blue)' }}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h3 className="text-h2 mb-2">Transparent Fees</h3>
                <p className="text-body text-slate">Platform fee is shown upfront before you commit. No surprises, no hidden charges.</p>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4" style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-slate-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-slate)' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <h3 className="text-h2 mb-2">INR-Native</h3>
                <p className="text-body text-slate">Built for India. No currency conversion, no international transaction fees.</p>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4" style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-green-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-signal-green)' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 className="text-h2 mb-2">Verified Payments</h3>
                <p className="text-body text-slate">Powered by Razorpay. Secure, reliable, and trusted payment gateway.</p>
              </div>
            </div>

            <div className="card">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4" style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-amber-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-amber-deep)' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <h3 className="text-h2 mb-2">Build Trust</h3>
                <p className="text-body text-slate">Two-way reviews after every project. Build your reputation over time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-center">
        <div className="container-marketing">
          <h2 className="text-display-md mb-4">Ready to get started?</h2>
          <p className="text-body text-slate mb-5" style={{ maxWidth: '500px', margin: '0 auto 48px' }}>
            Join thousands of Creators and Workers already using WorkHive
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup?role=client" className="btn btn-primary btn-large">
              Post your first job
            </Link>
            <Link to="/signup?role=freelancer" className="btn btn-secondary btn-large">
              Find work
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5" style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-white)' }}>
        <div className="container-marketing">
          <div className="grid grid-cols-4 gap-5">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-h2" style={{ color: '#FFFFFF' }}>Work</span>
                <span className="text-h2" style={{ color: 'var(--color-info-blue)' }}>Hive</span>
              </div>
              <p className="text-small" style={{ color: 'var(--color-slate-light)' }}>
                India's trusted freelance marketplace with escrow-protected payments.
              </p>
            </div>
            <div>
              <h4 className="text-h3 mb-3">For Creators</h4>
              <ul className="flex flex-col gap-2">
                <li><Link to="/signup?role=client" className="text-small text-slate-light hover:text-white">Post a job</Link></li>
                <li><Link to="/browse-jobs" className="text-small text-slate-light hover:text-white">Browse freelancers</Link></li>
                <li><Link to="/how-it-works" className="text-small text-slate-light hover:text-white">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-h3 mb-3">For Workers</h4>
              <ul className="flex flex-col gap-2">
                <li><Link to="/signup?role=freelancer" className="text-small text-slate-light hover:text-white">Find work</Link></li>
                <li><Link to="/browse-jobs" className="text-small text-slate-light hover:text-white">Browse jobs</Link></li>
                <li><Link to="/how-it-works" className="text-small text-slate-light hover:text-white">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-h3 mb-3">Company</h4>
              <ul className="flex flex-col gap-2">
                <li><Link to="/about" className="text-small text-slate-light hover:text-white">About us</Link></li>
                <li><Link to="/privacy" className="text-small text-slate-light hover:text-white">Privacy policy</Link></li>
                <li><Link to="/terms" className="text-small text-slate-light hover:text-white">Terms of service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-slate-light)' }}>
            <p className="text-small text-center" style={{ color: 'var(--color-slate-light)' }}>
              © 2026 WorkHive. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
