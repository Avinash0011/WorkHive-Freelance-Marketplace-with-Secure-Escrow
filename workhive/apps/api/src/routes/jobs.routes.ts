import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { jobsLimiter } from '../middleware/rateLimiter.middleware';
import { createJobSchema, updateJobSchema } from '@workhive/shared';

const jobsRouter: Router = Router();

// Public routes
jobsRouter.get('/posted', jobsLimiter, jobController.getPostedJobs);

// Protected routes
jobsRouter.use(authenticate);

// Client-only routes
jobsRouter.post('/', jobsLimiter, requireRole('client'), validate(createJobSchema), jobController.createJob);
jobsRouter.get('/mine', jobsLimiter, requireRole('client'), jobController.getMyJobs);
jobsRouter.get('/:id', jobsLimiter, jobController.getJobById);
jobsRouter.patch('/:id', jobsLimiter, requireRole('client'), validate(updateJobSchema), jobController.updateJob);
jobsRouter.delete('/:id', jobsLimiter, requireRole('client'), jobController.deleteJob);

export { jobsRouter };
