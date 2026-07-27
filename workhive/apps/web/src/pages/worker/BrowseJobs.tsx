import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import type { Job, JobStatus } from '@workhive/shared';

const statusColors: Record<JobStatus, string> = {
  draft: 'badge-draft',
  posted: 'badge-posted',
  assigned: 'badge-assigned',
  escrowed: 'badge-escrowed',
  submitted: 'badge-submitted',
  paid: 'badge-paid',
  cancelled: 'badge-cancelled',
};

const statusLabels: Record<JobStatus, string> = {
  draft: 'Draft',
  posted: 'Posted',
  assigned: 'Assigned',
  escrowed: 'Escrowed',
  submitted: 'Submitted',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export default function BrowseJobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['posted-jobs', searchTerm, selectedSkill],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSkill) params.append('skills', selectedSkill);
      
      const response = await apiClient.get<{ success: true; data: { jobs: Job[] } }>(
        `/jobs/posted${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data.data.jobs;
    },
  });

  const formatCurrency = (paise: string | number | bigint) => {
    const rupees = Number(paise) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Extract unique skills from jobs for filtering
  const allSkills = jobs?.flatMap(job => job.skills_required) || [];
  const uniqueSkills = Array.from(new Set(allSkills)).sort();

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="freelancer">
        <div className="text-body text-slate">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout requiredRole="freelancer">
        <div className="card">
          <p className="text-body text-alert-rust">Failed to load jobs</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="freelancer">
      <div className="mb-5">
        <h1 className="text-h1 mb-2">Browse Jobs</h1>
        <p className="text-body text-slate">Find work that matches your skills</p>
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              className="input w-full"
              placeholder="Search jobs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {uniqueSkills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="card text-center py-6">
          <div className="mb-4" style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-slate-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-slate)' }}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h2 className="text-h2 mb-2">No jobs found</h2>
          <p className="text-body text-slate">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs?.map((job) => (
            <div key={job.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-h2">{job.title}</h3>
                    <span className={`badge ${statusColors[job.status as JobStatus]}`}>
                      {statusLabels[job.status as JobStatus]}
                    </span>
                  </div>
                  <p className="text-body text-slate mb-3" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-small text-slate mb-3">
                <div>
                  <span className="text-slate">Budget: </span>
                  <span className="text-amount text-amber">{formatCurrency(job.budget_paise)}</span>
                </div>
                <div>
                  <span className="text-slate">Deadline: </span>
                  {formatDate(job.deadline)}
                </div>
                <div>
                  <span className="text-slate">Posted by: </span>
                  {job.client?.name}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {job.skills_required.slice(0, 4).map((skill) => (
                  <span key={skill} className="badge" style={{ 
                    backgroundColor: 'var(--bg-slate-light)',
                    color: 'var(--color-slate)'
                  }}>
                    {skill}
                  </span>
                ))}
                {job.skills_required.length > 4 && (
                  <span className="badge" style={{ 
                    backgroundColor: 'var(--bg-slate-light)',
                    color: 'var(--color-slate)'
                  }}>
                    +{job.skills_required.length - 4}
                  </span>
                )}
              </div>

              <Link
                to={`/worker/jobs/${job.id}/pitch`}
                className="btn btn-primary"
              >
                Send a Pitch
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
