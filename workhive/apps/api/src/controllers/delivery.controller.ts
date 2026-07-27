import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/delivery.service';
import { submitDeliverySchema } from '@workhive/shared';

export const deliveryController = {
  async submitDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const input = submitDeliverySchema.parse(req.body);
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const job = await deliveryService.submitDelivery(req.user!.id, jobId, input);
      res.json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyContracts(req: Request, res: Response, next: NextFunction) {
    try {
      const contracts = await deliveryService.getMyContracts(req.user!.id);
      res.json({
        success: true,
        data: { contracts },
      });
    } catch (error) {
      next(error);
    }
  },
};
