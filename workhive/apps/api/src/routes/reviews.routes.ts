import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '@workhive/shared';

export const reviewsRouter: Router = Router();

// Protected routes
reviewsRouter.use(authenticate);

// Create review
reviewsRouter.post('/jobs/:jobId/reviews', validate(createReviewSchema), reviewController.createReview);

// Get job reviews
reviewsRouter.get('/jobs/:jobId/reviews', reviewController.getJobReviews);
