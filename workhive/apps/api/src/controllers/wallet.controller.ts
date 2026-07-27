import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/wallet.service';

export const walletController = {
  async createTopupOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount_paise } = req.body;
      const result = await walletService.createTopupOrder(req.user!.id, amount_paise);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyTopupPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentId, signature } = req.body;
      const payment = await walletService.verifyTopupPayment(req.user!.id, orderId, paymentId, signature);
      res.json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  },

  async getWalletBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await walletService.getWalletBalance(req.user!.id);
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};
