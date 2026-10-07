import { useMemo, useState } from 'react';
import { CalendarPlus, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable, { type Column } from '@/components/common/DataTable';
import { Select, SearchInput } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import { EventStatusBadge } from '@/components/common/StatusBadges';
import {
  Actions,
  IconAction,
  Clamp,
  Meter,
  Muted,
  Stack,
  TableToolbar,
  ToolbarSpacer,
} from '@/components/common/TableParts';
import EventFormModal from '@/components/events/EventFormModal';
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/constants/options';
import { eventDetailsPath } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api';
import type { EventItem } from '@/types/event';
import { formatDate, formatTime } from '@/utils/format';
import { QR_TYPES } from '@/utils/qr';

interface EventRow extends EventItem {
  inviteeCount: number;
  sentCount: number;
  acceptedCount: number;
}

const Events = () => {
  useDocumentTitle('Events');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, invitees, loading, deleteEvent } = useData();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState<EventRow | null>(null);

  const rows = useMemo<EventRow[]>(() => {
    const counts = new Map<string, { total: number; sent: number; accepted: number }>();
    for (const i of invitees) {
      const c = counts.get(i.eventId) ?? { total: 0, sent: 0, accepted: 0 };
      c.total++;
      if (i.emailStatus === 'sent') c.sent++;
      if (i.rsvp === 'accepted') c.accepted++;
      counts.set(i.eventId, c);
    }
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => !status || e.status === status)
      .filter((e) => !category || e.category === category)
      .filter(
        (e) =>
          !q ||
          [e.title, e.address, e.organizer, e.createdBy?.name ?? ''].some((field) =>
            field.toLowerCase().includes(q),
          ),
      )
      .map((e) => {
        const c = counts.get(e.id);
        return {
          ...e,
          inviteeCount: c?.total ?? 0,
          sentCount: c?.sent ?? 0,
          acceptedCount: c?.accepted ?? 0,
        };
      });
  }, [events, invitees, search, status, category]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const columns: Column<EventRow>[] = [
    {
      key: 'title',
      header: 'Event',
      sortValue: (e) => e.title,
      render: (e) => (
        <Stack>
          <strong title={e.title}>{e.title}</strong>
          <span>{e.category}</span>
        </Stack>
      ),
    },
    {
      key: 'date',
      header: 'When',
      sortValue: (e) => e.date,
      render: (e) => (
        <Stack>
          <strong>{formatDate(e.date)}</strong>
          <span>
            {formatTime(e.startTime)} – {formatTime(e.endTime)}
          </span>
        </Stack>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      sortValue: (e) => e.address,
      render: (e) => (e.address ? <Clamp title={e.address}>{e.address}</Clamp> : <Muted>—</Muted>),
    },
    ...(isAdmin
      ? [
          {
            key: 'owner',
            header: 'Planner',
            sortValue: (e: EventRow) => e.createdBy?.name ?? '',
            render: (e: EventRow) => <Muted>{e.createdBy?.name ?? '—'}</Muted>,
          },
        ]
      : [
          {
            key: 'organizer',
            header: 'Organizer',
            sortValue: (e: EventRow) => e.organizer,
            render: (e: EventRow) =>
              e.organizer ? <Clamp title={e.organizer}>{e.organizer}</Clamp> : <Muted>—</Muted>,
          },
        ]),
    {
      key: 'invitees',
      header: 'Guests',
      sortValue: (e) => e.inviteeCount,
      render: (e) => <Meter value={e.inviteeCount} max={e.capacity} />,
    },
    {
      key: 'sent',
      header: 'Sent',
      sortValue: (e) => e.sentCount,
      render: (e) => (
        <span>
          <strong>{e.sentCount}</strong>
          <Muted>/{e.inviteeCount}</Muted>
        </span>
      ),
    },
    {
      key: 'qr',
      header: 'QR',
      render: (e) =>
        e.qrType ? (
          <Badge tone="primary">{QR_TYPES[e.qrType].label}</Badge>
        ) : (
          <Muted>—</Muted>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (e) => e.status,
      render: (e) => <EventStatusBadge status={e.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '96px',
      render: (e) => (
        <Actions onClick={(ev) => ev.stopPropagation()}>
          <IconAction onClick={() => navigate(eventDetailsPath(e.id))} title="View" aria-label="View event">
            <Eye />
          </IconAction>
          <IconAction
            onClick={() => {
              setEditing(e);
              setFormOpen(true);
            }}
            title="Edit"
            aria-label="Edit event"
          >
            <Pencil />
          </IconAction>
          <IconAction $danger onClick={() => setDeleting(e)} title="Delete" aria-label="Delete event">
            <Trash2 />
          </IconAction>
        </Actions>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Events"
        subtitle={isAdmin ? 'Every event, across all planners.' : 'Create and manage your events in one place.'}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus /> Create Event
          </Button>
        }
      />

      <Card $padded={false}>
        <TableToolbar>
          <SearchInput
            placeholder="Search by title, address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ToolbarSpacer />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </TableToolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(e) => e.id}
          onRowClick={(e) => navigate(eventDetailsPath(e.id))}
          pageSize={25}
          minWidth={isAdmin ? '980px' : '920px'}
          empty={
            events.length === 0 && !loading
              ? {
                  icon: <CalendarPlus />,
                  title: 'No events yet',
                  description: 'Create your first event to start inviting guests.',
                  action: (
                    <Button size="sm" onClick={openCreate}>
                      <Plus /> Create Event
                    </Button>
                  ),
                }
              : undefined
          }
        />
      </Card>

      <EventFormModal
        open={formOpen}
        event={editing}
        onClose={() => setFormOpen(false)}
        onCreated={(e) => navigate(eventDetailsPath(e.id))}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete event?"
        message={
          <>
            <strong>{deleting?.title}</strong> and its {deleting?.inviteeCount ?? 0} invitees (with their QR
            tickets) will be permanently removed.
          </>
        }
        confirmLabel="Delete event"
        onConfirm={() => {
          if (!deleting) return;
          deleteEvent(deleting.id)
            .then(() => toast.success('Event deleted'))
            .catch((err) => toast.error(errorMessage(err)));
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  );
};

export default Events;
