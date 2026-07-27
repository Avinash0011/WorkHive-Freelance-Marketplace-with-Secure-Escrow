import { Router } from 'express';
import { proposalController } from '../controllers/proposal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { proposalsLimiter } from '../middleware/rateLimiter.middleware';
import { createProposalSchema } from '@workhive/shared';

const proposalsRouter: Router = Router();

// Protected routes
proposalsRouter.use(authenticate);

// Create proposal (worker only)
proposalsRouter.post('/jobs/:jobId/proposals', proposalsLimiter, requireRole('freelancer'), validate(createProposalSchema), proposalController.createProposal);

// Get job proposals (client only - job owner)
proposalsRouter.get('/jobs/:jobId/proposals', proposalsLimiter, requireRole('client'), proposalController.getJobProposals);

// Get my proposals (worker only)
proposalsRouter.get('/proposals/mine', proposalsLimiter, requireRole('freelancer'), proposalController.getMyProposals);

// Accept proposal (client only)
proposalsRouter.post('/proposals/:id/accept', proposalsLimiter, requireRole('client'), proposalController.acceptProposal);

// Withdraw proposal (worker only)
proposalsRouter.post('/proposals/:id/withdraw', proposalsLimiter, requireRole('freelancer'), proposalController.withdrawProposal);

export { proposalsRouter };
