export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  EVENT_DETAILS: '/events/:eventId',
  USERS: '/users',
  COMPOSE: '/compose',
} as const;

export const eventDetailsPath = (eventId: string) => `/events/${eventId}`;
