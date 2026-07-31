import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/error-handler.middleware';
import type { Review } from '@prisma/client';
import type { CreateReviewInput } from '@workhive/shared';

export const reviewService = {
  async createReview(userId: string, jobId: string, input: CreateReviewInput) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.client_id !== userId && job.freelancer_id !== userId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    if (job.status !== 'paid') {
      throw new ApiError(400, 'INVALID_STATUS', 'Job must be paid before reviewing');
    }

    // Determine who is reviewing whom
    const reviewerId = userId;
    const revieweeId = userId === job.client_id ? job.freelancer_id! : job.client_id;

    // Check if review already exists
    const existing = await prisma.review.findUnique({
      where: {
        job_id_reviewer_id: {
          job_id: jobId,
          reviewer_id: reviewerId,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, 'ALREADY_REVIEWED', 'You have already reviewed this job');
    }

    const review = await prisma.review.create({
      data: {
        job_id: jobId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating: input.rating,
        comment: input.comment || null,
      },
    });

    // Update reviewee's average rating
    const allReviews = await prisma.review.findMany({
      where: { reviewee_id: revieweeId }
    });

    const avgRating = allReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / allReviews.length;

    await prisma.user.update({
      where: { id: revieweeId },
      data: { rating_avg: avgRating },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: userId,
        action: 'review.created',
        entity_type: 'review',
        entity_id: review.id,
        metadata: {
          job_id: jobId,
          reviewee_id: revieweeId,
          rating: input.rating,
        },
      },
    });

    return review;
  },

  async getJobReviews(jobId: string) {
    return prisma.review.findMany({
      where: { job_id: jobId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  },
};
