import type { QrType } from './qr';
import type { UserRef } from './user';

export type InviteeCategory = 'VIP' | 'Guest' | 'Speaker' | 'Sponsor' | 'Media' | 'Staff';
export type RsvpStatus = 'pending' | 'accepted' | 'declined';
export type EmailStatus = 'not_sent' | 'sent' | 'failed';
export type CheckInStatus = 'not_checked_in' | 'checked_in';

export interface Invitee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  city: string;
  category: InviteeCategory;
  /** Human-readable unique ticket id, e.g. EP-7K3F-9QX2 */
  ticketCode: string;
  qrType: QrType;
  /** Exact string encoded in the QR, signed by the server. */
  qrPayload: string;
  rsvp: RsvpStatus;
  emailStatus: EmailStatus;
  emailSentAt: string | null;
  /** Why the last invitation could not be delivered. */
  emailError: string | null;
  checkIn: CheckInStatus;
  checkedInAt: string | null;
  /** Scanner (or planner/admin) who admitted the guest. */
  checkedInBy: UserRef | null;
  createdAt: string;
}

export type InviteeInput = Pick<
  Invitee,
  'name' | 'email' | 'phone' | 'company' | 'designation' | 'city' | 'category'
>;
