import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/error-handler.middleware';

export const savedJobService = {
  async saveJob(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        user_id_job_id: {
          user_id: userId,
          job_id: jobId,
        },
      },
    });

    if (existing) {
      throw new ApiError(400, 'ALREADY_SAVED', 'Job already saved');
    }

    const savedJob = await prisma.savedJob.create({
      data: {
        user_id: userId,
        job_id: jobId,
      },
    });

    return savedJob;
  },

  async unsaveJob(userId: string, jobId: string) {
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        user_id_job_id: {
          user_id: userId,
          job_id: jobId,
        },
      },
    });

    if (!savedJob) {
      throw new ApiError(404, 'NOT_FOUND', 'Saved job not found');
    }

    await prisma.savedJob.delete({
      where: { id: savedJob.id },
    });

    return { message: 'Job unsaved' };
  },

  async getSavedJobs(userId: string) {
    return prisma.savedJob.findMany({
      where: { user_id: userId },
      include: {
        job: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                rating_avg: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async isJobSaved(userId: string, jobId: string) {
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        user_id_job_id: {
          user_id: userId,
          job_id: jobId,
        },
      },
    });

    return !!savedJob;
  },
};
