// === Enums (matching Prisma schema exactly) ===

export type Role = 'client' | 'freelancer';

export type JobStatus = 'draft' | 'posted' | 'assigned' | 'escrowed' | 'submitted' | 'paid' | 'cancelled';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type PaymentType = 'escrow' | 'release' | 'refund';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

// === API Types ===

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  headline: string | null;
  skills: string[];
  wallet_balance_paise: bigint | string; // bigint in backend, string in frontend JSON
  rating_avg: number | null;
  created_at: string;
}

export interface UserPublic {
  id: string;
  name: string;
  role: Role;
  headline: string | null;
  skills: string[];
  rating_avg: number | null;
}

export interface Job {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget_paise: bigint | string;
  skills_required: string[];
  deadline: string | null;
  status: JobStatus;
  freelancer_id: string | null;
  agreed_amount_paise: bigint | string | null;
  delivery_note: string | null;
  hired_at: string | null;
  escrowed_at: string | null;
  submitted_at: string | null;
  paid_at: string | null;
  created_at: string;
  // Joined fields
  client?: UserPublic;
  freelancer?: UserPublic;
  _count?: { proposals: number };
}

export interface Proposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  amount_paise: bigint | string;
  message: string;
  status: ProposalStatus;
  created_at: string;
  // Joined
  job?: Job;
  freelancer?: UserPublic;
}

export interface Payment {
  id: string;
  job_id: string;
  type: PaymentType;
  amount_paise: bigint | string;
  platform_fee_paise: bigint | string | null;
  idempotency_key: string;
  gateway_ref: string | null;
  status: PaymentStatus;
  created_at: string;
  // Joined
  job?: Pick<Job, 'id' | 'title'>;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined
  reviewer?: UserPublic;
  reviewee?: UserPublic;
  job?: Pick<Job, 'id' | 'title'>;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// === API Response Types ===

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'wallet_balance_paise'> & { wallet_balance_paise: string };
}
