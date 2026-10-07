import type { InviteeCategory } from './invitee';
import type { UserRef } from './user';

export type ScanResult = 'valid' | 'already_used' | 'invalid' | 'wrong_event' | 'event_closed';

export interface ScanResponse {
  valid: boolean;
  result: ScanResult;
  message: string;
  event: { id: string; title: string };
  guest: {
    id: string;
    name: string;
    email: string;
    company: string;
    category: InviteeCategory;
    ticketCode: string;
  } | null;
  checkedInAt: string | null;
  checkedInBy: UserRef | null;
}

export interface ScanLog {
  id: string;
  eventId: { id: string; title: string; date?: string } | null;
  scannerId: UserRef | null;
  inviteeId: { id: string; name: string; email?: string; ticketCode: string; category?: InviteeCategory } | null;
  ticketCode: string | null;
  result: ScanResult;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ScanLogPage {
  items: ScanLog[];
  total: number;
  page: number;
  limit: number;
}

export interface EventStats {
  eventId: string;
  capacity: number;
  guests: {
    total: number;
    emailed: number;
    emailFailed: number;
    checkedIn: number;
    notCheckedIn: number;
    accepted: number;
    declined: number;
  };
  scans: Partial<Record<ScanResult, number>>;
  byScanner: {
    scannerId: string;
    name: string;
    email?: string;
    total: number;
    admitted: number;
    rejected: number;
    lastScanAt: string;
  }[];
}
