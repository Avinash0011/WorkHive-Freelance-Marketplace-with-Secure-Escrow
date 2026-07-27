import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/error-handler.middleware';
import type { SubmitDeliveryInput } from '@workhive/shared';

export const deliveryService = {
  async submitDelivery(userId: string, jobId: string, input: SubmitDeliveryInput) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.freelancer_id !== userId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    if (job.status !== 'escrowed') {
      throw new ApiError(400, 'INVALID_STATUS', 'Job must be in escrowed status to submit delivery');
    }

    // Update job with delivery
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'submitted',
        delivery_note: input.delivery_note,
        submitted_at: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: userId,
        action: 'delivery.submitted',
        entity_type: 'job',
        entity_id: jobId,
        metadata: {
          note: input.delivery_note,
        },
      },
    });

    return updatedJob;
  },

  async getMyContracts(userId: string) {
    return prisma.job.findMany({
      where: {
        freelancer_id: userId,
        status: {
          in: ['assigned', 'escrowed', 'submitted', 'paid'],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            rating_avg: true,
          },
        },
      },
      orderBy: { hired_at: 'desc' },
    });
  },
};
