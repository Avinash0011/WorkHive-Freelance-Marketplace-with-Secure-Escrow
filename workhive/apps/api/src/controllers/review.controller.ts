import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';
import { createReviewSchema } from '@workhive/shared';

export const reviewController = {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createReviewSchema.parse(req.body);
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const review = await reviewService.createReview(req.user!.id, jobId, input);
      res.status(201).json({
        success: true,
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const reviews = await reviewService.getJobReviews(jobId);
      res.json({
        success: true,
        data: { reviews },
      });
    } catch (error) {
      next(error);
    }
  },
};
