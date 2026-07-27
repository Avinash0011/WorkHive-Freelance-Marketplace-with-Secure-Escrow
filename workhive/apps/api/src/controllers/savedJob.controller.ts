import { Request, Response, NextFunction } from 'express';
import { savedJobService } from '../services/savedJob.service';

export const savedJobController = {
  async saveJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const savedJob = await savedJobService.saveJob(req.user!.id, jobId as string);
      res.json({
        success: true,
        data: { savedJob },
      });
    } catch (error) {
      next(error);
    }
  },

  async unsaveJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const result = await savedJobService.unsaveJob(req.user!.id, jobId as string);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSavedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const savedJobs = await savedJobService.getSavedJobs(req.user!.id);
      res.json({
        success: true,
        data: { savedJobs },
      });
    } catch (error) {
      next(error);
    }
  },

  async isJobSaved(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const isSaved = await savedJobService.isJobSaved(req.user!.id, jobId as string);
      res.json({
        success: true,
        data: { isSaved },
      });
    } catch (error) {
      next(error);
    }
  },
};
