import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/error-handler.middleware';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../lib/env';

let razorpay: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export const paymentService = {
  async createEscrowOrder(jobId: string, clientId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.client_id !== clientId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    if (job.status !== 'assigned') {
      throw new ApiError(400, 'INVALID_STATUS', 'Job must be assigned before funding escrow');
    }

    if (!job.agreed_amount_paise) {
      throw new ApiError(400, 'INVALID_STATE', 'Job must have an agreed amount');
    }

    // Check for existing idempotency key
    const idempotencyKey = crypto.randomUUID();
    const existingPayment = await prisma.payment.findUnique({
      where: { idempotency_key: idempotencyKey },
    });

    if (existingPayment) {
      return existingPayment;
    }

    // Create Razorpay order
    if (!razorpay) {
      throw new ApiError(500, 'SERVICE_UNAVAILABLE', 'Razorpay not configured');
    }
    const order: any = await razorpay.orders.create({
      amount: Number(job.agreed_amount_paise),
      currency: 'INR',
      receipt: jobId,
      notes: {
        job_id: jobId,
        client_id: clientId,
        type: 'escrow',
      },
    });

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        job_id: jobId,
        type: 'escrow',
        amount_paise: job.agreed_amount_paise,
        idempotency_key: idempotencyKey,
        gateway_ref: order.id,
        status: 'pending',
        owner_id: clientId,
      },
    });

    return { payment, order };
  },

  async verifyEscrowPayment(orderId: string, paymentId: string, signature: string) {
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new ApiError(400, 'INVALID_SIGNATURE', 'Invalid payment signature');
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        gateway_ref: orderId,
        type: 'escrow',
      },
      include: { job: true },
    });

    if (!payment) {
      throw new ApiError(404, 'NOT_FOUND', 'Payment record not found');
    }

    if (payment.status === 'succeeded') {
      return payment; // Already processed
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'succeeded' },
    });

    // Update job status to escrowed
    await prisma.job.update({
      where: { id: payment.job_id },
      data: {
        status: 'escrowed',
        escrowed_at: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: payment.owner_id,
        action: 'escrow.funded',
        entity_type: 'payment',
        entity_id: payment.id,
        metadata: {
          job_id: payment.job_id,
          amount_paise: payment.amount_paise.toString(),
        },
      },
    });

    return updatedPayment;
  },

  async releasePayment(jobId: string, clientId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, 'NOT_FOUND', 'Job not found');
    }

    if (job.client_id !== clientId) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }

    if (job.status !== 'submitted') {
      throw new ApiError(400, 'INVALID_STATUS', 'Job must be submitted before releasing payment');
    }

    if (!job.agreed_amount_paise) {
      throw new ApiError(400, 'INVALID_STATE', 'Job must have an agreed amount');
    }

    // Calculate platform fee
    const platformFeePercent = env.PLATFORM_FEE_PERCENT || 10;
    const platformFeePaise = (job.agreed_amount_paise * BigInt(platformFeePercent)) / BigInt(100);
    const payoutPaise = job.agreed_amount_paise - platformFeePaise;

    // Create payment record
    const idempotencyKey = crypto.randomUUID();
    const payment = await prisma.payment.create({
      data: {
        job_id: jobId,
        type: 'release',
        amount_paise: payoutPaise,
        platform_fee_paise: platformFeePaise,
        idempotency_key: idempotencyKey,
        status: 'pending',
        owner_id: clientId,
      },
    });

    // Note: In production, this would trigger a RazorpayX payout
    // For now, we'll mark it as succeeded immediately for demo purposes
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'succeeded' },
    });

    // Update job status to paid
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'paid',
        paid_at: new Date(),
      },
    });

    // Update freelancer wallet balance
    await prisma.user.update({
      where: { id: job.freelancer_id! },
      data: {
        wallet_balance_paise: {
          increment: payoutPaise,
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: clientId,
        action: 'payment.released',
        entity_type: 'payment',
        entity_id: payment.id,
        metadata: {
          job_id: jobId,
          amount_paise: payoutPaise.toString(),
          platform_fee_paise: platformFeePaise.toString(),
        },
      },
    });

    return updatedPayment;
  },

  async getMyPayments(userId: string) {
    return prisma.payment.findMany({
      where: { owner_id: userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },
};
