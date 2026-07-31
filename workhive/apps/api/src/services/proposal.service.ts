import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/error-handler.middleware';
import { emitToUser } from '../config/socket';
import { sendEmail, getProposalCreatedEmail, getProposalAcceptedEmail } from '../config/resend';
import type { CreateProposalInput } from '@workhive/shared';

export const proposalService = {
  async createProposal(userId: string, jobId: string, input: CreateProposalInput) {
    // Check if job exists and is posted
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.status !== 'posted') {
      throw new ApiError(400, 'INVALID_STATUS', 'This job is no longer open for proposals');
    }

    // Check if user already proposed
    const existing = await prisma.proposal.findUnique({
      where: {
        job_id_freelancer_id: {
          job_id: jobId,
          freelancer_id: userId,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, 'ALREADY_PROPOSED', 'You have already submitted a proposal for this job');
    }

    const proposal = await prisma.proposal.create({
      data: {
        job_id: jobId,
        freelancer_id: userId,
        amount_paise: BigInt(input.amount_paise),
        message: input.message,
        status: 'pending',
      },
    });

    // Emit socket event to job owner
    emitToUser(job.client_id, 'proposal:created', {
      proposalId: proposal.id,
      jobId,
      freelancerId: userId,
    });

    // Send email notification
    const client = await prisma.user.findUnique({
      where: { id: job.client_id },
      select: { email: true },
    });
    const freelancer = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    if (client && freelancer) {
      sendEmail(client.email, 'New Proposal Received', getProposalCreatedEmail(job.title, freelancer.name));
    }

    return proposal;
  },

  async getJobProposals(jobId: string, userId: string) {
    // Verify user owns the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.client_id !== userId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    return prisma.proposal.findMany({
      where: { job_id: jobId },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            role: true,
            headline: true,
            skills: true,
            rating_avg: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async getMyProposals(userId: string) {
    return prisma.proposal.findMany({
      where: { freelancer_id: userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            budget_paise: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                rating_avg: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async acceptProposal(proposalId: string, clientId: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true },
    });

    if (!proposal) {
      throw new ApiError(404, 'NOT_FOUND', 'Proposal not found');
    }

    if (proposal.job.client_id !== clientId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    if (proposal.job.status !== 'posted') {
      throw new ApiError(400, 'INVALID_STATUS', 'This job is no longer open');
    }

    // Prevent self-hire
    if (proposal.freelancer_id === clientId) {
      throw new ApiError(400, 'SELF_HIRE', 'You cannot hire yourself');
    }

    // Use transaction for hire-lock
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Lock the job row
      const lockedJob = await tx.job.findUnique({
        where: { id: proposal.job_id },
      });

      if (!lockedJob || lockedJob.status !== 'posted') {
        throw new ApiError(400, 'INVALID_STATUS', 'This job is no longer open');
      }

      // Update job to assigned
      const updatedJob = await tx.job.update({
        where: { id: proposal.job_id },
        data: {
          status: 'assigned',
          freelancer_id: proposal.freelancer_id,
          agreed_amount_paise: proposal.amount_paise,
          hired_at: new Date(),
        },
      });

      // Accept the proposal
      const acceptedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: 'accepted' },
      });

      // Reject all other proposals
      await tx.proposal.updateMany({
        where: {
          job_id: proposal.job_id,
          id: { not: proposalId },
        },
        data: { status: 'rejected' },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actor_id: clientId,
          action: 'job.hired',
          entity_type: 'job',
          entity_id: proposal.job_id,
          metadata: {
            freelancer_id: proposal.freelancer_id,
            agreed_amount_paise: proposal.amount_paise.toString(),
          },
        },
      });

      return { updatedJob, acceptedProposal };
    });

    // Emit socket event to freelancer
    emitToUser(proposal.freelancer_id, 'proposal:accepted', {
      proposalId,
      jobId: proposal.job_id,
    });

    // Send email notification
    const freelancer = await prisma.user.findUnique({
      where: { id: proposal.freelancer_id },
      select: { email: true },
    });
    if (freelancer) {
      sendEmail(freelancer.email, 'Proposal Accepted!', getProposalAcceptedEmail(proposal.job.title));
    }

    return result;
  },

  async withdrawProposal(proposalId: string, userId: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new ApiError(404, 'NOT_FOUND', 'Proposal not found');
    }

    if (proposal.freelancer_id !== userId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    if (proposal.status !== 'pending') {
      throw new ApiError(400, 'INVALID_STATUS', 'Can only withdraw pending proposals');
    }

    const updated = await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'withdrawn' },
    });

    return updated;
  },
};
