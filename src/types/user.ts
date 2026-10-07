export type Role = 'admin' | 'planner' | 'scanner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  isActive: boolean;
  /** Admin, or the planner who created this scanner (expanded in lists, an id elsewhere). */
  createdBy: (UserRef & { role?: Role }) | string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

/** The short form the API embeds in other records (event owner, who checked a guest in…). */
export interface UserRef {
  id: string;
  name: string;
  email?: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
}

export type UserUpdate = Partial<Omit<UserInput, 'role'>> & { isActive?: boolean };
