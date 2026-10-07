import { useMemo, useState } from 'react';
import { Download, Eye, MailCheck, Pencil, QrCode, Trash2, UserCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable, { type Column } from '@/components/common/DataTable';
import { SearchInput, Select } from '@/components/common/Form';
import Modal from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import {
  CategoryBadge,
  CheckInBadge,
  EmailBadge,
  RsvpBadge,
} from '@/components/common/StatusBadges';
import { Mono, SelectionBar, TableToolbar, ToolbarSpacer } from '@/components/common/TableParts';
import InviteeFormModal from '@/components/invitees/InviteeFormModal';
import QrImage from '@/components/qr/QrImage';
import QrTicketModal from '@/components/qr/QrTicketModal';
import { INVITEE_CATEGORIES } from '@/constants/options';
import { eventDetailsPath } from '@/constants/routes';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api';
import type { Invitee } from '@/types/invitee';
import { invitesToCsv } from '@/utils/csv';
import { downloadText } from '@/utils/download';
import { formatDate, formatDateTime } from '@/utils/format';
import {
  ActionBtn,
  DetailActions,
  DetailGrid,
  DetailItem,
  DetailMeta,
  DetailTop,
  EventCell,
  GuestCell,
  Page,
  RowActions,
  StatsGrid,
  TableCard,
} from './AllUsers.styles';

type Row = Invitee & { eventTitle: string; eventDate: string };

const AllUsers = () => {
  useDocumentTitle('All Guests');
  const { events, invitees, loading, deleteInvitees } = useData();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [category, setCategory] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [checkInFilter, setCheckInFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string[]>([]);
  const [detailFor, setDetailFor] = useState<Row | null>(null);
  const [qrFor, setQrFor] = useState<Row | null>(null);
  const [inviteeForm, setInviteeForm] = useState<{ open: boolean; invitee: Invitee | null }>({
    open: false,
    invitee: null,
  });

  const eventById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const allRows = useMemo<Row[]>(
    () =>
      invitees.map((i) => {
        const e = eventById.get(i.eventId);
        return { ...i, eventTitle: e?.title ?? 'Deleted event', eventDate: e?.date ?? '' };
      }),
    [invitees, eventById],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows
      .filter((r) => !eventFilter || r.eventId === eventFilter)
      .filter((r) => !category || r.category === category)
      .filter((r) => !emailFilter || r.emailStatus === emailFilter)
      .filter((r) => !checkInFilter || r.checkIn === checkInFilter)
      .filter(
        (r) =>
          !q ||
          [r.name, r.email, r.phone, r.company, r.city, r.ticketCode, r.eventTitle].some((f) =>
            f.toLowerCase().includes(q),
          ),
      );
  }, [allRows, search, eventFilter, category, emailFilter, checkInFilter]);

  const uniquePeople = useMemo(() => new Set(invitees.map((i) => i.email)).size, [invitees]);
  const sent = invitees.filter((i) => i.emailStatus === 'sent').length;
  const checkedIn = invitees.filter((i) => i.checkIn === 'checked_in').length;
  const editingEventId = inviteeForm.invitee?.eventId ?? '';

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Guest',
      sortValue: (r) => r.name,
      render: (r) => (
        <GuestCell>
          <strong>{r.name}</strong>
          <span>{r.email}</span>
        </GuestCell>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      sortValue: (r) => r.eventTitle,
      render: (r) => (
        <EventCell to={eventDetailsPath(r.eventId)} onClick={(e) => e.stopPropagation()} title={r.eventTitle}>
          {r.eventTitle}
        </EventCell>
      ),
    },
    {
      key: 'category',
      header: 'Type',
      sortValue: (r) => r.category,
      render: (r) => <CategoryBadge category={r.category} />,
    },
    {
      key: 'checkin',
      header: 'Check-in',
      sortValue: (r) => r.checkIn,
      render: (r) => <CheckInBadge status={r.checkIn} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      stickyRight: true,
      render: (r) => (
        <RowActions onClick={(e) => e.stopPropagation()}>
          <ActionBtn $primary onClick={() => setDetailFor(r)} title="View details" aria-label="View details">
            <Eye />
            View
          </ActionBtn>
          <ActionBtn onClick={() => setInviteeForm({ open: true, invitee: r })} title="Edit" aria-label="Edit">
            <Pencil />
          </ActionBtn>
          <ActionBtn $danger onClick={() => setToDelete([r.id])} title="Delete" aria-label="Delete">
            <Trash2 />
          </ActionBtn>
        </RowActions>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        title="All Guests"
        subtitle="Compact list — open View for full guest details."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              downloadText(invitesToCsv(rows), `all_guests_${new Date().toISOString().slice(0, 10)}.csv`)
            }
            disabled={rows.length === 0}
          >
            <Download /> Export CSV
          </Button>
        }
      />

      <StatsGrid>
        <StatCard compact label="Invitations" value={invitees.length} icon={<Users />} tone="primary" />
        <StatCard
          compact
          label="Unique people"
          value={uniquePeople}
          hint="By email"
          icon={<UserCheck />}
          tone="info"
        />
        <StatCard compact label="Sent" value={sent} icon={<MailCheck />} tone="success" />
        <StatCard compact label="Checked in" value={checkedIn} icon={<QrCode />} tone="accent" />
      </StatsGrid>

      <TableCard>
        <TableToolbar>
          <SearchInput
            placeholder="Search guests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ToolbarSpacer />
          <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} aria-label="Event">
            <option value="">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="">All types</option>
            {INVITEE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} aria-label="Invitation">
            <option value="">All invites</option>
            <option value="sent">Sent</option>
            <option value="not_sent">Not sent</option>
            <option value="failed">Failed</option>
          </Select>
          <Select
            value={checkInFilter}
            onChange={(e) => setCheckInFilter(e.target.value)}
            aria-label="Check-in"
          >
            <option value="">All check-in</option>
            <option value="checked_in">Checked in</option>
            <option value="not_checked_in">Not arrived</option>
          </Select>
        </TableToolbar>

        {selected.length > 0 && (
          <SelectionBar>
            {selected.length} selected
            <ToolbarSpacer />
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
          rows={rows}
          rowKey={(r) => r.id}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          onRowClick={setDetailFor}
          minWidth="720px"
          pageSize={25}
          empty={
            invitees.length === 0 && !loading
              ? {
                  icon: <Users />,
                  title: 'No guests yet',
                  description: 'Guests imported into any event will show up here.',
                }
              : undefined
          }
        />
      </TableCard>

      <Modal
        open={!!detailFor}
        onClose={() => setDetailFor(null)}
        title="Guest details"
        subtitle={detailFor ? detailFor.eventTitle : undefined}
        size="md"
      >
        {detailFor && (
          <>
            <DetailTop>
              <QrImage type={detailFor.qrType} payload={detailFor.qrPayload} size={96} />
              <DetailMeta>
                <h4>{detailFor.name}</h4>
                <div className="badges">
                  <CategoryBadge category={detailFor.category} />
                  <EmailBadge status={detailFor.emailStatus} />
                  <RsvpBadge status={detailFor.rsvp} />
                  <CheckInBadge status={detailFor.checkIn} />
                </div>
                <Mono>{detailFor.ticketCode}</Mono>
              </DetailMeta>
            </DetailTop>

            <DetailGrid>
              <DetailItem>
                <dt>Email</dt>
                <dd>{detailFor.email}</dd>
              </DetailItem>
              <DetailItem>
                <dt>Phone</dt>
                <dd>{detailFor.phone || '—'}</dd>
              </DetailItem>
              <DetailItem>
                <dt>Company</dt>
                <dd>{detailFor.company || '—'}</dd>
              </DetailItem>
              <DetailItem>
                <dt>Designation</dt>
                <dd>{detailFor.designation || '—'}</dd>
              </DetailItem>
              <DetailItem>
                <dt>City</dt>
                <dd>{detailFor.city || '—'}</dd>
              </DetailItem>
              <DetailItem>
                <dt>Event date</dt>
                <dd>{detailFor.eventDate ? formatDate(detailFor.eventDate) : '—'}</dd>
              </DetailItem>
              <DetailItem>
                <dt>Added</dt>
                <dd>{formatDateTime(detailFor.createdAt)}</dd>
              </DetailItem>
              <DetailItem>
                <dt>Checked in by</dt>
                <dd>{detailFor.checkedInBy?.name || '—'}</dd>
              </DetailItem>
            </DetailGrid>

            <DetailActions>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQrFor(detailFor);
                }}
              >
                <QrCode size={14} /> Open QR pass
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setInviteeForm({ open: true, invitee: detailFor });
                  setDetailFor(null);
                }}
              >
                <Pencil size={14} /> Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setToDelete([detailFor.id]);
                  setDetailFor(null);
                }}
              >
                <Trash2 size={14} /> Delete
              </Button>
            </DetailActions>
          </>
        )}
      </Modal>

      <QrTicketModal
        invitee={qrFor}
        event={qrFor ? eventById.get(qrFor.eventId) : undefined}
        onClose={() => setQrFor(null)}
      />

      <InviteeFormModal
        open={inviteeForm.open}
        eventId={editingEventId}
        invitee={inviteeForm.invitee}
        onClose={() => setInviteeForm({ open: false, invitee: null })}
      />

      <ConfirmDialog
        open={toDelete.length > 0}
        title={toDelete.length > 1 ? `Delete ${toDelete.length} guests?` : 'Delete guest?'}
        message="Their QR tickets will stop working. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          const ids = toDelete;
          deleteInvitees(ids)
            .then((n) => {
              setSelected((s) => s.filter((id) => !ids.includes(id)));
              if (detailFor && ids.includes(detailFor.id)) setDetailFor(null);
              toast.success(n === 1 ? 'Guest deleted' : `${n} guests deleted`);
            })
            .catch((err) => toast.error(errorMessage(err)));
        }}
        onClose={() => setToDelete([])}
      />
    </Page>
  );
};

export default AllUsers;
