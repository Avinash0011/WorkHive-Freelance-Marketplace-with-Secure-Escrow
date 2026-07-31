import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobSchema } from '@workhive/shared';
import type { CreateJobInput } from '@workhive/shared';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

// ---- tiny inline icons (no extra dependency needed) ----
const Icon = {
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  Upload: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3M7 8l5-5 5 5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  ),
  File: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Coins: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </svg>
  ),
  Clock: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
};

const SUGGESTED_SKILLS = ['Database Design', 'User Interface / IA', 'User Research', 'Accessibility', 'Documentation'];

type PaymentType = 'fixed' | 'hourly';

export default function PostJob() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // UI-only selection for now — not part of createJobSchema yet.
  // Wire this to the API once the backend supports it.
  const [paymentType, setPaymentType] = useState<PaymentType>('fixed');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
  });

  const addSkill = (value: string) => {
    const clean = value.trim();
    if (clean && !skills.includes(clean) && skills.length < 10) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits ? Number(digits).toLocaleString('en-IN') : '';
  };

  const parseCurrency = (value: string) => value.replace(/,/g, '');

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 5));
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const onSubmit = async (data: CreateJobInput) => {
    try {
      setError(null);
      const finalData = {
        ...data,
        skills_required: skills,
        payment_type: paymentType,
      };
      await apiClient.post('/jobs', finalData);
      navigate('/creator/my-jobs');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create job. Please try again.');
    }
  };

  return (
    <DashboardLayout requiredRole="client">
      <div className="mb-6" style={{ maxWidth: '100%' }}>
        <h1 className="text-h1 mb-2">Post a Job</h1>
        <p className="text-body text-slate">
          Fill in the details to find the perfect freelancer for your project
        </p>
      </div>

      {error && (
        <div
          className="p-4 mb-5 flex items-start gap-3"
          style={{
            backgroundColor: 'var(--bg-rust-tint)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-alert-rust)',
            maxWidth: '100%',
          }}
        >
          <span style={{ color: 'var(--color-alert-rust)', flexShrink: 0, marginTop: '1px' }}>
            <Icon.Alert />
          </span>
          <p className="text-small text-alert-rust">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '100%' }}>
        <div className="flex flex-col gap-5">
          {/* ---------------- Project name ---------------- */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              className="text-small text-slate mb-2"
              style={{ fontWeight: 600, display: 'block', width: '100%' }}
            >
              Project name
            </label>
            <input
              {...register('title')}
              type="text"
              className="input w-full"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                ...(errors.title ? { borderColor: 'var(--color-alert-rust)' } : {}),
              }}
              placeholder="e.g., Full-Stack Social Platform Development"
            />
            {errors.title && <p className="text-small text-alert-rust mt-2">{errors.title.message}</p>}
          </div>

          {/* ---------------- Project description ---------------- */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              className="text-small text-slate mb-2"
              style={{ fontWeight: 600, display: 'block', width: '100%' }}
            >
              Project description
            </label>
            <textarea
              {...register('description')}
              className="input w-full"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                minHeight: '150px',
                resize: 'vertical',
                display: 'block',
                ...(errors.description ? { borderColor: 'var(--color-alert-rust)' } : {}),
              }}
              placeholder={
                'Deliverables I need to see before we go live:\n' +
                '- Responsive front-end with intuitive navigation and modern UI/UX\n' +
                '- Back-end APIs and database configured for user profiles, messaging, and feed updates\n' +
                '- Two-factor auth fully implemented and tested (time-based OTP or SMS)\n' +
                '- Deployment scripts or instructions so I can replicate the environment in production\n' +
                '- Brief hand-off documentation covering setup, key architectural decisions, and future scalability notes'
              }
            />
            {errors.description && (
              <p className="text-small text-alert-rust mt-2">{errors.description.message}</p>
            )}

            {/* Drag & drop upload — local only, not yet wired to an upload endpoint */}
            <div
              className="mt-4 flex flex-col items-center justify-center text-center p-5"
              style={{
                border: `1.5px dashed ${isDragging ? 'var(--color-amber-deep)' : 'var(--border-light, #d8dce3)'}`,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isDragging ? 'var(--bg-amber-tint)' : 'transparent',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => document.getElementById('job-file-input')?.click()}
            >
              <span className="text-slate mb-2" style={{ opacity: 0.7 }}>
                <Icon.Upload />
              </span>
              <p className="text-small text-slate">
                Drag &amp; drop or{' '}
                <span style={{ color: 'var(--color-amber-deep)', fontWeight: 600 }}>click to upload</span>{' '}
                any images or documents that might be helpful in explaining your brief.
              </p>
              <p className="text-small text-slate mt-1" style={{ opacity: 0.7 }}>
                (Max 25 MB)
              </p>
              <input
                id="job-file-input"
                type="file"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between p-2"
                    style={{ backgroundColor: 'var(--bg-amber-tint)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <span className="flex items-center gap-2 text-small" style={{ color: 'var(--color-amber-deep)' }}>
                      <Icon.File />
                      {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(f.name)}
                      className="text-slate"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                    >
                      <Icon.Close />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------------- Skills ---------------- */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              className="text-small text-slate mb-2"
              style={{ fontWeight: 600, display: 'block', width: '100%' }}
            >
              What skills are required?
            </label>
            <p className="text-small text-slate mb-3">
              We detected the following skills to suit your project. Feel free to modify these choices to best suit
              your needs. You can add up to 10 skills.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="input flex-1"
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="btn btn-secondary"
                disabled={!skillInput.trim() || skills.length >= 10}
              >
                Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge flex items-center gap-1"
                    style={{
                      backgroundColor: 'var(--bg-amber-tint)',
                      color: 'var(--color-amber-deep)',
                      cursor: 'pointer',
                      paddingRight: '8px',
                    }}
                    onClick={() => removeSkill(skill)}
                  >
                    {skill}
                    <span style={{ opacity: 0.6, fontSize: '0.85em' }}>✕</span>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="text-small text-slate">{skills.length}/10 selected</span>
            </div>

            <p className="text-small text-slate mb-2">Suggested skills:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => addSkill(s)}
                  className="text-small"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-amber-deep)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        

          {/* ---------------- How do you want to pay ---------------- */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              className="text-small text-slate mb-3"
              style={{ fontWeight: 600, display: 'block', width: '100%' }}
            >
              How do you want to pay?
            </label>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <SelectCard
                selected={paymentType === 'fixed'}
                onClick={() => setPaymentType('fixed')}
                icon={<Icon.Coins />}
                title="Pay fixed price"
                description="Agree on a price and release payment when the job is done. Best for one-off tasks."
              />
              <SelectCard
                selected={paymentType === 'hourly'}
                onClick={() => setPaymentType('hourly')}
                icon={<Icon.Clock />}
                title="Pay by the hour"
                description="Hire based on an hourly rate and pay for hours worked. Best for ongoing projects."
              />
            </div>
          </div>

          {/* ---------------- Budget & deadline ---------------- */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              className="text-small text-slate mb-3"
              style={{ fontWeight: 600, display: 'block', width: '100%' }}
            >
              What is your estimated budget?
            </label>
            <div className="flex gap-3 mb-1">
              <select
                className="input"
                style={{ width: 100, flexShrink: 0 }}
                defaultValue="INR"
                disabled
                title="INR only for now"
              >
                <option value="INR">₹ INR</option>
              </select>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" style={{ pointerEvents: 'none' }}>
                  ₹
                </span>
                <input
                  {...register('budget_paise', {
                    setValueAs: (v) => {
                      const num = Number(String(v).replace(/,/g, ''));
                      return Number.isNaN(num) ? undefined : num * 100;
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  className="input w-full"
                  style={{
                    paddingLeft: '32px',
                    ...(errors.budget_paise ? { borderColor: 'var(--color-alert-rust)' } : {}),
                  }}
                  placeholder="50,000"
                  onChange={(e) => {
                    e.target.value = formatCurrency(e.target.value);
                  }}
                />
              </div>
            </div>
            {errors.budget_paise && (
              <p className="text-small text-alert-rust mt-2">{errors.budget_paise.message}</p>
            )}

            <div className="mt-4" style={{ display: 'flex', flexDirection: 'column' }}>
              <label className="text-small text-slate mb-2" style={{ display: 'block' }}>
                Deadline (optional)
              </label>
              <input
                {...register('deadline', {
                  setValueAs: (v) => (v ? new Date(v).toISOString() : undefined),
                })}
                type="date"
                className="input"
                style={{ maxWidth: 220 }}
              />
              {errors.deadline && (
                <p className="text-small text-alert-rust mt-2">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          
             

          <div className="flex gap-4 justify-end mt-1">
            <button type="button" onClick={() => navigate('/creator')} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || skills.length === 0}
              className="btn btn-primary btn-large"
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

// ---------------- Reusable selectable card ----------------
function SelectCard({
  selected,
  onClick,
  icon,
  title,
  description,
  badge,
  badgeVariant = 'accent',
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: 'accent' | 'neutral';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative text-left p-4"
      style={{
        borderRadius: 'var(--radius-sm)',
        border: `1.5px solid ${selected ? 'var(--color-amber-deep)' : 'var(--border-light, #e2e5ea)'}`,
        backgroundColor: selected ? 'var(--bg-amber-tint)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {badge && (
        <span
          className="absolute"
          style={{
            top: -10,
            right: 10,
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            backgroundColor: badgeVariant === 'accent' ? 'var(--color-amber-deep)' : 'var(--border-light, #e2e5ea)',
            color: badgeVariant === 'accent' ? '#fff' : 'var(--text-slate, #475569)',
          }}
        >
          {badge}
        </span>
      )}
      <span
        className="flex items-center justify-center mb-3"
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: selected ? 'rgba(255,255,255,0.6)' : 'var(--bg-amber-tint)',
          color: 'var(--color-amber-deep)',
        }}
      >
        {icon}
      </span>
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</span>
        {selected && (
          <span
            className="flex items-center justify-center"
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: 'var(--color-amber-deep)',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Icon.Check />
          </span>
        )}
      </div>
      <p className="text-small text-slate" style={{ lineHeight: 1.4 }}>
        {description}
      </p>
    </button>
  );
}