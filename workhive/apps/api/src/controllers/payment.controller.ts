import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

export const paymentController = {
  async createEscrowOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const result = await paymentService.createEscrowOrder(jobId, req.user!.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyEscrowPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentId, signature } = req.body;
      const payment = await paymentService.verifyEscrowPayment(orderId, paymentId, signature);
      res.json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  },

  async releasePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const payment = await paymentService.releasePayment(jobId, req.user!.id);
      res.json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getMyPayments(req.user!.id);
      res.json({
        success: true,
        data: { payments },
      });
    } catch (error) {
      next(error);
    }
  },
};
