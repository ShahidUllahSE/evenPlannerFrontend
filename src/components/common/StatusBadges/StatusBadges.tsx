import Badge, { type BadgeTone } from '../Badge';
import type { EventStatus } from '@/types/event';
import type { CheckInStatus, EmailStatus, InviteeCategory, RsvpStatus } from '@/types/invitee';

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
};

const CHECK_IN: Record<CheckInStatus, [BadgeTone, string]> = {
  not_checked_in: ['neutral', 'Not arrived'],
  checked_in: ['success', 'Checked in'],
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
