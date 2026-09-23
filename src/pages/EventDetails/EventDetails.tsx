import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CircleCheck,
  Clock,
  FileUp,
  MailCheck,
  MapPin,
  Pencil,
  QrCode,
  RefreshCw,
  Send,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable, { type Column } from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import { SearchInput, Select } from '@/components/common/Form';
import Modal from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import {
  CategoryBadge,
  CheckInBadge,
  EmailBadge,
  EventStatusBadge,
  RsvpBadge,
} from '@/components/common/StatusBadges';
import {
  Actions,
  IconAction,
  Mono,
  Muted,
  PersonCell,
  QrButton,
  SelectionBar,
  TableToolbar,
  ToolbarSpacer,
} from '@/components/common/TableParts';
import EventFormModal from '@/components/events/EventFormModal';
import CsvImportModal from '@/components/invitees/CsvImportModal';
import InviteeFormModal from '@/components/invitees/InviteeFormModal';
import QrImage from '@/components/qr/QrImage';
import QrTicketModal from '@/components/qr/QrTicketModal';
import QrTypePicker from '@/components/qr/QrTypePicker';
import { INVITEE_CATEGORIES } from '@/constants/options';
import { ROUTES } from '@/constants/routes';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { EmailLog } from '@/types/email';
import type { Invitee } from '@/types/invitee';
import type { QrType } from '@/types/qr';
import { getTemplate } from '@/utils/emailTemplates';
import { formatDate, formatDateTime, formatTime } from '@/utils/format';
import { QR_TYPES } from '@/utils/qr';
import { InfoGrid, InfoTile, Section, StatsGrid } from './EventDetails.styles';

const EventDetails = () => {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const { events, invitees, emailLogs, deleteInvitees, regenerateQrCodes } = useData();
  const event = events.find((e) => e.id === eventId);
  useDocumentTitle(event?.title ?? 'Event');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const [editingEvent, setEditingEvent] = useState(false);
  const [importing, setImporting] = useState(false);
  const [inviteeForm, setInviteeForm] = useState<{ open: boolean; invitee: Invitee | null }>({
    open: false,
    invitee: null,
  });
  const [qrFor, setQrFor] = useState<Invitee | null>(null);
  const [toDelete, setToDelete] = useState<string[]>([]);
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenType, setRegenType] = useState<QrType | null>(null);

  const eventInvitees = useMemo(
    () => invitees.filter((i) => i.eventId === eventId),
    [invitees, eventId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return eventInvitees
      .filter((i) => !category || i.category === category)
      .filter((i) => !emailFilter || i.emailStatus === emailFilter)
      .filter((i) => !rsvpFilter || i.rsvp === rsvpFilter)
      .filter(
        (i) =>
          !q ||
          [i.name, i.email, i.company, i.ticketCode, i.phone].some((f) => f.toLowerCase().includes(q)),
      );
  }, [eventInvitees, search, category, emailFilter, rsvpFilter]);

  const logs = useMemo(() => emailLogs.filter((l) => l.eventId === eventId), [emailLogs, eventId]);

  if (!event) {
    return (
      <Card>
        <EmptyState
          title="Event not found"
          description="It may have been deleted."
          action={<Button onClick={() => navigate(ROUTES.EVENTS)}>Back to events</Button>}
        />
      </Card>
    );
  }

  const sentCount = eventInvitees.filter((i) => i.emailStatus === 'sent').length;
  const acceptedCount = eventInvitees.filter((i) => i.rsvp === 'accepted').length;
  const checkedInCount = eventInvitees.filter((i) => i.checkIn === 'checked_in').length;

  const goCompose = (ids: string[]) =>
    navigate(`${ROUTES.COMPOSE}?event=${event.id}`, { state: { inviteeIds: ids } });

  const columns: Column<Invitee>[] = [
    {
      key: 'name',
      header: 'Guest',
      sortValue: (i) => i.name,
      render: (i) => <PersonCell name={i.name} email={i.email} />,
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (i) => i.category,
      render: (i) => <CategoryBadge category={i.category} />,
    },
    {
      key: 'qr',
      header: 'QR',
      align: 'center',
      render: (i) => (
        <QrButton
          onClick={(e) => {
            e.stopPropagation();
            setQrFor(i);
          }}
          title="View entry pass"
        >
          <QrImage type={i.qrType} payload={i.qrPayload} size={36} />
        </QrButton>
      ),
    },
    {
      key: 'ticket',
      header: 'Ticket Code',
      sortValue: (i) => i.ticketCode,
      render: (i) => <Mono>{i.ticketCode}</Mono>,
    },
    {
      key: 'email',
      header: 'Invitation',
      sortValue: (i) => i.emailStatus,
      render: (i) => <EmailBadge status={i.emailStatus} />,
    },
    { key: 'rsvp', header: 'RSVP', sortValue: (i) => i.rsvp, render: (i) => <RsvpBadge status={i.rsvp} /> },
    {
      key: 'checkin',
      header: 'Check-in',
      sortValue: (i) => i.checkIn,
      render: (i) => <CheckInBadge status={i.checkIn} />,
    },
    { key: 'phone', header: 'Phone', render: (i) => i.phone || <Muted>—</Muted> },
    { key: 'company', header: 'Company', sortValue: (i) => i.company, render: (i) => i.company || '—' },
    { key: 'designation', header: 'Designation', render: (i) => i.designation || '—' },
    { key: 'city', header: 'City', sortValue: (i) => i.city, render: (i) => i.city || '—' },
    {
      key: 'added',
      header: 'Added',
      sortValue: (i) => i.createdAt,
      render: (i) => <Muted>{formatDate(i.createdAt)}</Muted>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      stickyRight: true,
      render: (i) => (
        <Actions onClick={(e) => e.stopPropagation()}>
          <IconAction onClick={() => goCompose([i.id])} title="Send email" aria-label="Send email">
            <Send />
          </IconAction>
          <IconAction
            onClick={() => setInviteeForm({ open: true, invitee: i })}
            title="Edit"
            aria-label="Edit invitee"
          >
            <Pencil />
          </IconAction>
          <IconAction $danger onClick={() => setToDelete([i.id])} title="Delete" aria-label="Delete invitee">
            <Trash2 />
          </IconAction>
        </Actions>
      ),
    },
  ];

  const logColumns: Column<EmailLog>[] = [
    { key: 'subject', header: 'Subject', render: (l) => <strong>{l.subject}</strong> },
    { key: 'template', header: 'Template', render: (l) => getTemplate(l.templateId).name },
    { key: 'recipients', header: 'Recipients', align: 'center', render: (l) => l.recipientCount },
    {
      key: 'qr',
      header: 'QR Attached',
      render: (l) => (l.includeQr ? <Badge tone="success">Yes</Badge> : <Badge>No</Badge>),
    },
    { key: 'sent', header: 'Sent At', render: (l) => <Muted>{formatDateTime(l.sentAt)}</Muted> },
  ];

  return (
    <>
      <PageHeader
        back={{ to: ROUTES.EVENTS, label: 'All events' }}
        title={event.title}
        badge={<EventStatusBadge status={event.status} />}
        subtitle={`${event.category} · Organized by ${event.organizer}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditingEvent(true)}>
              <Pencil /> Edit
            </Button>
            <Button variant="secondary" onClick={() => setImporting(true)}>
              <FileUp /> Import CSV
            </Button>
            <Button onClick={() => goCompose([])} disabled={eventInvitees.length === 0}>
              <Send /> Send Invitations
            </Button>
          </>
        }
      />

      <InfoGrid>
        <InfoTile>
          <CalendarDays />
          <div>
            <small>Date</small>
            <strong>{formatDate(event.date)}</strong>
          </div>
        </InfoTile>
        <InfoTile>
          <Clock />
          <div>
            <small>Time</small>
            <strong>
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </strong>
          </div>
        </InfoTile>
        <InfoTile>
          <MapPin />
          <div>
            <small>Venue</small>
            <strong>
              {event.venue}, {event.city}
            </strong>
          </div>
        </InfoTile>
        <InfoTile>
          <QrCode />
          <div>
            <small>QR Type</small>
            <strong>{event.qrType ? QR_TYPES[event.qrType].label : 'Chosen at first import'}</strong>
          </div>
          {event.qrType && eventInvitees.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              title="Change QR type & regenerate"
              aria-label="Change QR type"
              onClick={() => {
                setRegenType(event.qrType);
                setRegenOpen(true);
              }}
            >
              <RefreshCw />
            </Button>
          )}
        </InfoTile>
      </InfoGrid>

      <StatsGrid>
        <StatCard
          label="Invitees"
          value={eventInvitees.length}
          hint={`Capacity ${event.capacity}`}
          icon={<Users />}
          tone="primary"
        />
        <StatCard
          label="Invitations Sent"
          value={sentCount}
          hint={`${eventInvitees.length - sentCount} not sent yet`}
          icon={<MailCheck />}
          tone="info"
        />
        <StatCard
          label="Accepted"
          value={acceptedCount}
          hint="Confirmed RSVPs"
          icon={<CircleCheck />}
          tone="success"
        />
        <StatCard
          label="Checked In"
          value={checkedInCount}
          hint="Updated by QR scanner"
          icon={<QrCode />}
          tone="accent"
        />
      </StatsGrid>

      <Section>
        <Card $padded={false}>
          <CardHeader
            title="Invitees"
            subtitle="Every guest has a unique QR entry pass"
            actions={
              <>
                <Button variant="secondary" size="sm" onClick={() => setImporting(true)}>
                  <FileUp /> Import CSV
                </Button>
                <Button size="sm" onClick={() => setInviteeForm({ open: true, invitee: null })}>
                  <UserPlus /> Add Invitee
                </Button>
              </>
            }
          />
          {eventInvitees.length > 0 && (
            <TableToolbar>
              <SearchInput
                placeholder="Search name, email, ticket…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <ToolbarSpacer />
              <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
                <option value="">All categories</option>
                {INVITEE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <Select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                aria-label="Invitation status"
              >
                <option value="">All invitations</option>
                <option value="sent">Sent</option>
                <option value="not_sent">Not sent</option>
              </Select>
              <Select value={rsvpFilter} onChange={(e) => setRsvpFilter(e.target.value)} aria-label="RSVP">
                <option value="">All RSVP</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </Select>
            </TableToolbar>
          )}
          {selected.length > 0 && (
            <SelectionBar>
              {selected.length} selected
              <ToolbarSpacer />
              <Button size="sm" onClick={() => goCompose(selected)}>
                <Send /> Email selected
              </Button>
              <Button size="sm" variant="danger" onClick={() => setToDelete(selected)}>
                <Trash2 /> Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                Clear
              </Button>
            </SelectionBar>
          )}
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(i) => i.id}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            onRowClick={(i) => setQrFor(i)}
            minWidth="1640px"
            empty={
              eventInvitees.length === 0
                ? {
                    icon: <FileUp />,
                    title: 'No invitees yet',
                    description:
                      'Import your guest list from a CSV file. You will choose a QR code style and every guest gets a unique entry pass.',
                    action: (
                      <Button onClick={() => setImporting(true)}>
                        <FileUp /> Import CSV
                      </Button>
                    ),
                  }
                : undefined
            }
          />
        </Card>
      </Section>

      <Card $padded={false}>
        <CardHeader title="Email History" subtitle="Invitation batches sent for this event" />
        <DataTable
          columns={logColumns}
          rows={logs}
          rowKey={(l) => l.id}
          minWidth="760px"
          empty={{ icon: <MailCheck />, title: 'No emails sent yet' }}
        />
      </Card>

      <EventFormModal open={editingEvent} event={event} onClose={() => setEditingEvent(false)} />
      <CsvImportModal open={importing} event={event} onClose={() => setImporting(false)} />
      <InviteeFormModal
        open={inviteeForm.open}
        eventId={event.id}
        invitee={inviteeForm.invitee}
        onClose={() => setInviteeForm({ open: false, invitee: null })}
      />
      <QrTicketModal invitee={qrFor} event={event} onClose={() => setQrFor(null)} />

      <ConfirmDialog
        open={toDelete.length > 0}
        title={toDelete.length > 1 ? `Delete ${toDelete.length} invitees?` : 'Delete invitee?'}
        message="Their QR tickets will stop working. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          deleteInvitees(toDelete);
          setSelected((s) => s.filter((id) => !toDelete.includes(id)));
          toast.success(toDelete.length > 1 ? `${toDelete.length} invitees deleted` : 'Invitee deleted');
        }}
        onClose={() => setToDelete([])}
      />

      <Modal
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        size="xl"
        title="Change QR Type"
        subtitle="All tickets for this event will be regenerated with new unique codes."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRegenOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!regenType}
              onClick={() => {
                if (!regenType) return;
                regenerateQrCodes(event.id, regenType);
                setRegenOpen(false);
                toast.success(`${eventInvitees.length} QR tickets regenerated`);
              }}
            >
              <RefreshCw /> Regenerate {eventInvitees.length} tickets
            </Button>
          </>
        }
      >
        {sentCount > 0 && (
          <p style={{ marginBottom: 16, color: '#B45309', fontWeight: 500 }}>
            ⚠ {sentCount} guests already received their QR by email. Their old codes will no longer be valid, so
            send the invitations again.
          </p>
        )}
        <QrTypePicker value={regenType} onChange={setRegenType} />
      </Modal>
    </>
  );
};

export default EventDetails;
