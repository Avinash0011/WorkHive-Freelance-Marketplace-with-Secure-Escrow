import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { paymentsLimiter } from '../middleware/rateLimiter.middleware';

const paymentsRouter: Router = Router();

// Protected routes
paymentsRouter.use(authenticate);

// Create escrow order (client only)
paymentsRouter.post('/jobs/:jobId/fund-escrow', paymentsLimiter, requireRole('client'), paymentController.createEscrowOrder);

// Verify escrow payment
paymentsRouter.post('/verify-escrow', paymentsLimiter, paymentController.verifyEscrowPayment);

// Release payment (client only)
paymentsRouter.post('/jobs/:jobId/release-payment', paymentsLimiter, requireRole('client'), paymentController.releasePayment);

// Get my payments
paymentsRouter.get('/payments/mine', paymentsLimiter, paymentController.getMyPayments);

export { paymentsRouter };
