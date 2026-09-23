import type { EventCategory, EventStatus } from '@/types/event';
import type { InviteeCategory } from '@/types/invitee';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Conference',
  'Wedding',
  'Corporate',
  'Concert',
  'Exhibition',
  'Seminar',
  'Gala',
  'Workshop',
];

export const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const INVITEE_CATEGORIES: InviteeCategory[] = [
  'VIP',
  'Guest',
  'Speaker',
  'Sponsor',
  'Media',
  'Staff',
];
