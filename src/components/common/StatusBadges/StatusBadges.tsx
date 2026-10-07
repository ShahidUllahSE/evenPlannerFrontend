import Badge, { type BadgeTone } from '../Badge';
import type { EventStatus } from '@/types/event';
import type { CheckInStatus, EmailStatus, InviteeCategory, RsvpStatus } from '@/types/invitee';
import type { ScanResult } from '@/types/scan';
import type { Role } from '@/types/user';

const EVENT_STATUS: Record<EventStatus, [BadgeTone, string]> = {
  draft: ['neutral', 'Draft'],
  upcoming: ['info', 'Upcoming'],
  ongoing: ['success', 'Ongoing'],
  completed: ['primary', 'Completed'],
  cancelled: ['danger', 'Cancelled'],
};

const RSVP: Record<RsvpStatus, [BadgeTone, string]> = {
  pending: ['warning', 'Pending'],
  accepted: ['success', 'Accepted'],
  declined: ['danger', 'Declined'],
};

const EMAIL: Record<EmailStatus, [BadgeTone, string]> = {
  not_sent: ['neutral', 'Not sent'],
  sent: ['info', 'Sent'],
  failed: ['danger', 'Failed'],
};

const CHECK_IN: Record<CheckInStatus, [BadgeTone, string]> = {
  not_checked_in: ['neutral', 'Not arrived'],
  checked_in: ['success', 'Checked in'],
};

export const SCAN_RESULT: Record<ScanResult, [BadgeTone, string]> = {
  valid: ['success', 'Admitted'],
  already_used: ['warning', 'Already used'],
  invalid: ['danger', 'Invalid'],
  wrong_event: ['danger', 'Wrong event'],
  event_closed: ['neutral', 'Event closed'],
};

const ROLE: Record<Role, [BadgeTone, string]> = {
  admin: ['accent', 'Admin'],
  planner: ['primary', 'Planner'],
  scanner: ['info', 'Scanner'],
};

const CATEGORY: Record<InviteeCategory, BadgeTone> = {
  VIP: 'accent',
  Speaker: 'primary',
  Sponsor: 'info',
  Guest: 'neutral',
  Media: 'neutral',
  Staff: 'neutral',
};

const StatusBadge = ({ entry: [tone, label] }: { entry: [BadgeTone, string] }) => (
  <Badge tone={tone} dot>
    {label}
  </Badge>
);

export const EventStatusBadge = ({ status }: { status: EventStatus }) => (
  <StatusBadge entry={EVENT_STATUS[status]} />
);
export const RsvpBadge = ({ status }: { status: RsvpStatus }) => <StatusBadge entry={RSVP[status]} />;
export const EmailBadge = ({ status }: { status: EmailStatus }) => <StatusBadge entry={EMAIL[status]} />;
export const CheckInBadge = ({ status }: { status: CheckInStatus }) => (
  <StatusBadge entry={CHECK_IN[status]} />
);

export const CategoryBadge = ({ category }: { category: InviteeCategory }) => (
  <Badge tone={CATEGORY[category]}>{category}</Badge>
);

export const ScanResultBadge = ({ result }: { result: ScanResult }) => (
  <StatusBadge entry={SCAN_RESULT[result]} />
);

export const RoleBadge = ({ role }: { role: Role }) => <StatusBadge entry={ROLE[role]} />;
