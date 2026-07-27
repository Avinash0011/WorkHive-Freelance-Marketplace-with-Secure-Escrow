import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, BUDGET_MIN_PAISE, BUDGET_MAX_PAISE } from './constants';

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address').max(254).transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(1, 'Name is required').max(100).trim(),
  role: z.enum(['client', 'freelancer']),
  headline: z.string().max(200).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform(v => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less').trim(),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be 5000 characters or less').trim(),
  budget_paise: z.coerce.number().int().min(BUDGET_MIN_PAISE, `Budget must be at least ₹${BUDGET_MIN_PAISE / 100}`).max(BUDGET_MAX_PAISE, `Budget must be at most ₹${(BUDGET_MAX_PAISE / 100).toLocaleString('en-IN')}`),
  skills_required: z.array(z.string().max(50)).min(1, 'At least one skill is required').max(10),
  deadline: z.string().datetime().optional().nullable(),
});

export const updateJobSchema = createJobSchema.partial();

// Proposal schemas
export const createProposalSchema = z.object({
  amount_paise: z.coerce.number().int().min(BUDGET_MIN_PAISE, `Bid must be at least ₹${BUDGET_MIN_PAISE / 100}`),
  message: z.string().min(1, 'A pitch message is required').max(2000, 'Pitch must be 2000 characters or less').trim(),
});

// Review schemas
export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  comment: z.string().max(2000).optional().nullable(),
});

// Delivery schema
export const submitDeliverySchema = z.object({
  delivery_note: z.string().min(1, 'Delivery note is required').max(5000).trim(),
});

export const createDeliverySchema = submitDeliverySchema;

// Withdrawal schema
export const withdrawalSchema = z.object({
  amount_paise: z.coerce.number().int().min(10000, 'Minimum withdrawal is ₹100'),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Export types inferred from schemas
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SubmitDeliveryInput = z.infer<typeof submitDeliverySchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
