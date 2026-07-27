export const JOB_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Content Writing',
  'Data Analysis',
  'Digital Marketing',
  'Video Editing',
  'DevOps',
  'Blockchain',
  'AI/ML',
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

export const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'Go', 'Rust', 'PostgreSQL', 'MongoDB',
  'AWS', 'Docker', 'Kubernetes', 'Figma', 'Adobe XD',
  'SEO', 'Content Strategy', 'Video Production', 'Data Science', 'Machine Learning',
  'Flutter', 'React Native', 'Swift', 'Kotlin', 'Solidity',
  'Next.js', 'Vue.js', 'Angular', 'GraphQL', 'REST API',
] as const;

// Platform economics
export const PLATFORM_FEE_DEFAULT_PERCENT = 10;

// Budget limits (in paise)
export const BUDGET_MIN_PAISE = 50000;     // ₹500
export const BUDGET_MAX_PAISE = 10000000;  // ₹1,00,000

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Status labels for UI
export const JOB_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  posted: 'Open',
  assigned: 'Assigned',
  escrowed: 'Escrowed',
  submitted: 'Delivered',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  escrow: 'Escrow',
  release: 'Release',
  refund: 'Refund',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  succeeded: 'Succeeded',
  failed: 'Failed',
};
