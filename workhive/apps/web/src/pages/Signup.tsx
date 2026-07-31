import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@workhive/shared';
import type { SignupInput, Role } from '@workhive/shared';
import { useAuthStore } from '../stores/authStore';

export default function Signup() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: undefined,
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim()) && skills.length < 20) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const onSubmit = async (data: SignupInput) => {
    try {
      const finalData = {
        ...data,
        skills: data.role === 'freelancer' ? skills : [],
      };
      await registerUser(finalData);
      navigate(data.role === 'client' ? '/creator' : '/worker');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center py-5" style={{ backgroundColor: 'var(--color-bg-body)' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card">
            <h1 className="text-display-md text-center mb-5">Join <span style={{ color: '#1E2A4A' }}>Work</span><span style={{ color: '#4A6CF7' }}>Hive</span></h1>
            <p className="text-body text-center text-slate mb-5">Choose your role to get started</p>
            <div className="grid grid-cols-2 gap-5">
              <button
                onClick={() => setSelectedRole('client')}
                className="card flex flex-col items-center justify-center p-6 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ minHeight: '200px' }}
              >
                <div className="mb-4" style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-amber-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-amber-deep)' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h2 className="text-h2 mb-2">I'm a Creator</h2>
                <p className="text-body text-slate text-center">Post jobs and hire talented freelancers</p>
              </button>

              <button
                onClick={() => setSelectedRole('freelancer')}
                className="card flex flex-col items-center justify-center p-6 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ minHeight: '200px' }}
              >
                <div className="mb-4" style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-blue-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-info-blue)' }}>
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                    <line x1="16" y1="8" x2="2" y2="22"/>
                    <line x1="17.5" y1="15" x2="9" y2="15"/>
                  </svg>
                </div>
                <h2 className="text-h2 mb-2">I'm a Worker</h2>
                <p className="text-body text-slate text-center">Find work and build your freelance career</p>
              </button>
            </div>
            <p className="text-body text-center mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-deep" style={{ color: '#4A6CF7' }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-5" style={{ backgroundColor: 'var(--color-bg-body)' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card">
          <button
            onClick={() => setSelectedRole(null)}
            className="btn btn-ghost mb-4"
            style={{ padding: 0 }}
          >
            ← Back to role selection
          </button>
          <h1 className="text-display-md mb-2">
            Sign up as {selectedRole === 'client' ? 'a Creator' : 'a Worker'}
          </h1>
          <p className="text-body text-slate mb-5">
            {selectedRole === 'client' 
              ? 'Start posting jobs and hiring freelancers'
              : 'Start finding work and building your career'
            }
          </p>

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

            <div>
              <label className="text-small text-slate mb-2 block">Full name</label>
              <input
                {...register('name')}
                type="text"
                className="input w-full"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-small text-alert-rust mt-2">{errors.name.message}</p>
              )}
            </div>

            {selectedRole === 'freelancer' && (
              <>
                <div>
                  <label className="text-small text-slate mb-2 block">Headline</label>
                  <input
                    {...register('headline')}
                    type="text"
                    className="input w-full"
                    placeholder="e.g., React Developer"
                  />
                  {errors.headline && (
                    <p className="text-small text-alert-rust mt-2">{errors.headline.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-small text-slate mb-2 block">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <button type="button" onClick={addSkill} className="btn btn-secondary">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="badge"
                        style={{
                          backgroundColor: 'var(--bg-amber-tint)',
                          color: 'var(--color-amber-deep)',
                          cursor: 'pointer'
                        }}
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <input type="hidden" {...register('role')} value={selectedRole} />

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-large mt-4">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-body text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-deep" style={{ color: '#4A6CF7' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
