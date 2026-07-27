import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/error-handler.middleware';
import type { CreateJobInput } from '@workhive/shared';

export const jobService = {
  async createJob(userId: string, input: CreateJobInput) {
    const job = await prisma.job.create({
      data: {
        client_id: userId,
        title: input.title,
        description: input.description,
        budget_paise: BigInt(input.budget_paise),
        skills_required: input.skills_required,
        deadline: input.deadline ? new Date(input.deadline) : null,
        status: 'posted',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: userId,
        action: 'job.posted',
        entity_type: 'job',
        entity_id: job.id,
        metadata: {
          title: job.title,
          budget_paise: job.budget_paise.toString(),
        },
      },
    });

    return job;
  },

  async getJobsByClient(userId: string) {
    return prisma.job.findMany({
      where: { client_id: userId },
      include: {
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async getJobById(jobId: string, userId: string, userRole: 'client' | 'freelancer') {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            role: true,
            headline: true,
            skills: true,
            rating_avg: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            role: true,
            headline: true,
            skills: true,
            rating_avg: true,
          },
        },
        _count: {
          select: { proposals: true },
        },
      },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    // Ownership check for clients
    if (userRole === 'client' && job.client_id !== userId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    return job;
  },

  async updateJob(jobId: string, userId: string, input: Partial<CreateJobInput>) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.client_id !== userId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    // Can only edit draft or posted jobs
    if (job.status !== 'draft' && job.status !== 'posted') {
      throw new ApiError(400, 'INVALID_STATUS', 'Can only edit draft or posted jobs');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.budget_paise && { budget_paise: BigInt(input.budget_paise) }),
        ...(input.skills_required && { skills_required: input.skills_required }),
        ...(input.deadline !== undefined && { deadline: input.deadline ? new Date(input.deadline) : null }),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: userId,
        action: 'job.updated',
        entity_type: 'job',
        entity_id: jobId,
        metadata: {
          changes: input,
        },
      },
    });

    return updated;
  },

  async deleteJob(jobId: string, userId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.client_id !== userId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    // Can only delete draft or posted jobs
    if (job.status !== 'draft' && job.status !== 'posted') {
      throw new ApiError(400, 'INVALID_STATUS', 'Can only delete draft or posted jobs');
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: userId,
        action: 'job.deleted',
        entity_type: 'job',
        entity_id: jobId,
        metadata: {
          title: job.title,
        },
      },
    });
  },

  async getPostedJobs(filters?: { skills?: string[]; minBudget?: number; maxBudget?: number }) {
    const where: any = {
      status: 'posted',
    };

    if (filters?.skills && filters.skills.length > 0) {
      where.skills_required = {
        hasSome: filters.skills,
      };
    }

    if (filters?.minBudget || filters?.maxBudget) {
      where.budget_paise = {};
      if (filters.minBudget) {
        where.budget_paise.gte = BigInt(filters.minBudget);
      }
      if (filters.maxBudget) {
        where.budget_paise.lte = BigInt(filters.maxBudget);
      }
    }

    return prisma.job.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            role: true,
            rating_avg: true,
          },
        },
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },
};
