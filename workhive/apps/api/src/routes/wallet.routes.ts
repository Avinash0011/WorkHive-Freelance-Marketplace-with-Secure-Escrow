import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { paymentsLimiter } from '../middleware/rateLimiter.middleware';

const walletRouter: Router = Router();

// Protected routes
walletRouter.use(authenticate);

// Create top-up order
walletRouter.post('/wallet/topup', paymentsLimiter, walletController.createTopupOrder);

// Verify top-up payment
walletRouter.post('/wallet/topup/verify', paymentsLimiter, walletController.verifyTopupPayment);

// Get wallet balance
walletRouter.get('/wallet/balance', paymentsLimiter, walletController.getWalletBalance);

export { walletRouter };
