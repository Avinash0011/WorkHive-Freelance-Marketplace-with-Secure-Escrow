import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobSchema } from '@workhive/shared';
import type { CreateJobInput } from '@workhive/shared';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function PostJob() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim()) && skills.length < 10) {
      setSkills([...skills, skillInput.trim()]);
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

  const parseCurrency = (value: string) => {
    return value.replace(/,/g, '');
  };

  const onSubmit = async (data: CreateJobInput) => {
    try {
      setError(null);
      const finalData = {
        ...data,
        skills_required: skills,
        budget_paise: Number(parseCurrency(data.budget_paise.toString())) * 100,
      };
      await apiClient.post('/jobs', finalData);
      navigate('/creator/my-jobs');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create job. Please try again.');
    }
  };

  return (
    <DashboardLayout requiredRole="client">
      <div className="mb-5">
        <h1 className="text-h1 mb-2">Post a Job</h1>
        <p className="text-body text-slate">Fill in the details to find the perfect freelancer for your project</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-small text-slate mb-2 block">Job Title</label>
            <input
              {...register('title')}
              type="text"
              className="input w-full"
              placeholder="e.g., Build a responsive landing page"
            />
            {errors.title && (
              <p className="text-small text-alert-rust mt-2">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-small text-slate mb-2 block">Description</label>
            <textarea
              {...register('description')}
              className="input w-full"
              style={{ minHeight: '150px', resize: 'vertical' }}
              placeholder="Describe what you need done, deliverables, timeline, and any other requirements..."
            />
            {errors.description && (
              <p className="text-small text-alert-rust mt-2">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="text-small text-slate mb-2 block">Budget (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate">₹</span>
              <input
                {...register('budget_paise')}
                type="text"
                className="input w-full"
                style={{ paddingLeft: '32px' }}
                placeholder="50,000"
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  e.target.value = formatted;
                }}
              />
            </div>
            {errors.budget_paise && (
              <p className="text-small text-alert-rust mt-2">{errors.budget_paise.message}</p>
            )}
          </div>

          <div>
            <label className="text-small text-slate mb-2 block">Deadline (optional)</label>
            <input
              {...register('deadline')}
              type="date"
              className="input w-full"
            />
            {errors.deadline && (
              <p className="text-small text-alert-rust mt-2">{errors.deadline.message}</p>
            )}
          </div>

          <div>
            <label className="text-small text-slate mb-2 block">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Add a skill (e.g., React, Design)"
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
            {skills.length === 0 && (
              <p className="text-small text-slate mt-2">Add at least one skill</p>
            )}
          </div>

          <div className="flex gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={() => navigate('/creator')}
              className="btn btn-secondary"
            >
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
