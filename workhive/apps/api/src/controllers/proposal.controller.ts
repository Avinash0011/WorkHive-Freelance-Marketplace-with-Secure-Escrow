import { Request, Response, NextFunction } from 'express';
import { proposalService } from '../services/proposal.service';
import { createProposalSchema } from '@workhive/shared';

export const proposalController = {
  async createProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createProposalSchema.parse(req.body);
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const proposal = await proposalService.createProposal(req.user!.id, jobId, input);
      res.status(201).json({
        success: true,
        data: { proposal },
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobProposals(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const proposals = await proposalService.getJobProposals(jobId, req.user!.id);
      res.json({
        success: true,
        data: { proposals },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyProposals(req: Request, res: Response, next: NextFunction) {
    try {
      const proposals = await proposalService.getMyProposals(req.user!.id);
      res.json({
        success: true,
        data: { proposals },
      });
    } catch (error) {
      next(error);
    }
  },

  async acceptProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await proposalService.acceptProposal(proposalId, req.user!.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async withdrawProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const proposal = await proposalService.withdrawProposal(proposalId, req.user!.id);
      res.json({
        success: true,
        data: { proposal },
      });
    } catch (error) {
      next(error);
    }
  },
};
