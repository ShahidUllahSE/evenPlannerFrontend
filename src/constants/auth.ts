// Dummy credentials until the backend auth is ready.
export const DEMO_CREDENTIALS = {
  email: 'admin@eventsphere.com',
  password: 'admin123',
} as const;

export const DEMO_USER = {
  name: 'Admin User',
  email: DEMO_CREDENTIALS.email,
  role: 'Event Administrator',
} as const;
