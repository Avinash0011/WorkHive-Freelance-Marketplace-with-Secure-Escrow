import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/error-handler.middleware';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../lib/env';

let razorpay: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export const walletService = {
  async createTopupOrder(userId: string, amountPaise: number) {
    if (amountPaise < 10000) { // Minimum ₹100
      throw new ApiError(400, 'INVALID_AMOUNT', 'Minimum top-up amount is ₹100');
    }

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
      amount: amountPaise,
      currency: 'INR',
      receipt: `wallet-topup-${userId}`,
      notes: {
        user_id: userId,
        type: 'wallet_topup',
      },
    });

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        job_id: userId, // Using userId as job_id for wallet topups (this is a workaround, ideally wallet topups should be separate)
        type: 'escrow',
        amount_paise: BigInt(amountPaise),
        idempotency_key: idempotencyKey,
        gateway_ref: order.id,
        status: 'pending',
        owner_id: userId,
      },
    });

    return { payment, order };
  },

  async verifyTopupPayment(userId: string, orderId: string, paymentId: string, signature: string) {
    const payment = await prisma.payment.findFirst({
      where: { gateway_ref: orderId, owner_id: userId },
    });

    if (!payment) {
      throw new ApiError(404, 'NOT_FOUND', 'Payment not found');
    }

    if (payment.status === 'succeeded') {
      return payment;
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new ApiError(400, 'INVALID_SIGNATURE', 'Invalid payment signature');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'succeeded' },
    });

    // Credit user wallet
    await prisma.user.update({
      where: { id: userId },
      data: {
        wallet_balance_paise: {
          increment: payment.amount_paise,
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actor_id: userId,
        action: 'wallet.topup',
        entity_type: 'payment',
        entity_id: payment.id,
        metadata: {
          amount_paise: payment.amount_paise.toString(),
        },
      },
    });

    return updatedPayment;
  },

  async getWalletBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wallet_balance_paise: true },
    });

    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'User not found');
    }

    return user;
  },
};
