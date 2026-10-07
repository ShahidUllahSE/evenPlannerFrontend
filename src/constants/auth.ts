import type { Role } from '@/types/user';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  planner: 'Event Planner',
  scanner: 'Door Scanner',
};

export const MIN_PASSWORD_LENGTH = 8;
