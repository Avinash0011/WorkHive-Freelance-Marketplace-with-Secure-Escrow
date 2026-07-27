import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { submitDeliverySchema } from '@workhive/shared';

export const deliveryRouter: Router = Router();

// Protected routes
deliveryRouter.use(authenticate);

// Submit delivery (worker only)
deliveryRouter.post('/jobs/:jobId/delivery', requireRole('freelancer'), validate(submitDeliverySchema), deliveryController.submitDelivery);

// Get my contracts (worker only)
deliveryRouter.get('/contracts/mine', requireRole('freelancer'), deliveryController.getMyContracts);
