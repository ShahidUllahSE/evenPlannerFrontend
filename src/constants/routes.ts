import type { Role } from '@/types/user';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  EVENT_DETAILS: '/events/:eventId',
  /** Guests across every event. */
  USERS: '/users',
  COMPOSE: '/compose',
  /** Login accounts: planners and scanners. */
  TEAM: '/team',
  /** Admin-only SMTP account override. */
  EMAIL_SETTINGS: '/settings/email',
  /** Admin-only Twilio credentials override. */
  TWILIO_SETTINGS: '/settings/twilio',
  SCAN: '/scan',
  SCAN_HISTORY: '/scans',
} as const;

export const eventDetailsPath = (eventId: string) => `/events/${eventId}`;
export const scanPath = (eventId: string) => `/scan?event=${eventId}`;

/** Where each role lands after login and when opening a page it cannot use. */
export const homeFor = (role: Role) => (role === 'scanner' ? ROUTES.SCAN : ROUTES.DASHBOARD);
