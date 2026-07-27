import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';
import { createJobSchema, updateJobSchema } from '@workhive/shared';

export const jobController = {
  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createJobSchema.parse(req.body);
      const job = await jobService.createJob(req.user!.id, input);
      res.status(201).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobService.getJobsByClient(req.user!.id);
      res.json({
        success: true,
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getJobById(
        req.params.id as string,
        req.user!.id,
        req.user!.role
      );
      res.json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateJobSchema.parse(req.body);
      const job = await jobService.updateJob(req.params.id as string, req.user!.id, input);
      res.json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      await jobService.deleteJob(req.params.id as string, req.user!.id);
      res.json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getPostedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        skills: req.query.skills as string[] | undefined,
        minBudget: req.query.minBudget ? Number(req.query.minBudget) : undefined,
        maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : undefined,
      };
      const jobs = await jobService.getPostedJobs(filters);
      res.json({
        success: true,
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  },
};
