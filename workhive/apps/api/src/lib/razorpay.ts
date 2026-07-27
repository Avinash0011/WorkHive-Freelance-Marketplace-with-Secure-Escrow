import Razorpay from 'razorpay';
import { env } from './env';
import { logger } from './logger';

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay | null {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    logger.warn('Razorpay credentials not set — payment features will be unavailable');
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}
