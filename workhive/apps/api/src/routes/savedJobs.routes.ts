import { Router } from 'express';
import { savedJobController } from '../controllers/savedJob.controller';
import { authenticate } from '../middleware/auth.middleware';
import { jobsLimiter } from '../middleware/rateLimiter.middleware';

const savedJobsRouter: Router = Router();

// Protected routes
savedJobsRouter.use(authenticate);

// Save a job
savedJobsRouter.post('/jobs/:jobId/save', jobsLimiter, savedJobController.saveJob);

// Unsave a job
savedJobsRouter.delete('/jobs/:jobId/save', jobsLimiter, savedJobController.unsaveJob);

// Get saved jobs
savedJobsRouter.get('/saved-jobs', jobsLimiter, savedJobController.getSavedJobs);

// Check if job is saved
savedJobsRouter.get('/jobs/:jobId/saved', jobsLimiter, savedJobController.isJobSaved);

export { savedJobsRouter };
