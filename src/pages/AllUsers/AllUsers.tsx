import { useMemo, useState } from 'react';
import { Download, MailCheck, QrCode, UserCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import DataTable, { type Column } from '@/components/common/DataTable';
import { SearchInput, Select } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import {
  CategoryBadge,
  CheckInBadge,
  EmailBadge,
  RsvpBadge,
} from '@/components/common/StatusBadges';
import {
  Mono,
  Muted,
  PersonCell,
  QrButton,
  Stack,
  TableToolbar,
  ToolbarSpacer,
} from '@/components/common/TableParts';
import QrImage from '@/components/qr/QrImage';
import QrTicketModal from '@/components/qr/QrTicketModal';
import { INVITEE_CATEGORIES } from '@/constants/options';
import { eventDetailsPath } from '@/constants/routes';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { Invitee } from '@/types/invitee';
import { invitesToCsv } from '@/utils/csv';
import { downloadText } from '@/utils/download';
import { formatDate } from '@/utils/format';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const EventLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }
`;

type Row = Invitee & { eventTitle: string; eventDate: string };

const AllUsers = () => {
  useDocumentTitle('All Users');
  const { events, invitees } = useData();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [category, setCategory] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [checkInFilter, setCheckInFilter] = useState('');
  const [qrFor, setQrFor] = useState<Row | null>(null);

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

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Guest',
      sortValue: (r) => r.name,
      render: (r) => <PersonCell name={r.name} email={r.email} />,
    },
    {
      key: 'event',
      header: 'Event',
      sortValue: (r) => r.eventTitle,
      render: (r) => (
        <Stack onClick={(e) => e.stopPropagation()}>
          <EventLink to={eventDetailsPath(r.eventId)}>{r.eventTitle}</EventLink>
          <span>{r.eventDate && formatDate(r.eventDate)}</span>
        </Stack>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (r) => r.category,
      render: (r) => <CategoryBadge category={r.category} />,
    },
    {
      key: 'qr',
      header: 'QR',
      align: 'center',
      render: (r) => (
        <QrButton
          onClick={(e) => {
            e.stopPropagation();
            setQrFor(r);
          }}
          title="View entry pass"
        >
          <QrImage type={r.qrType} payload={r.qrPayload} size={36} />
        </QrButton>
      ),
    },
    {
      key: 'ticket',
      header: 'Ticket Code',
      sortValue: (r) => r.ticketCode,
      render: (r) => <Mono>{r.ticketCode}</Mono>,
    },
    {
      key: 'email',
      header: 'Invitation',
      sortValue: (r) => r.emailStatus,
      render: (r) => <EmailBadge status={r.emailStatus} />,
    },
    { key: 'rsvp', header: 'RSVP', sortValue: (r) => r.rsvp, render: (r) => <RsvpBadge status={r.rsvp} /> },
    {
      key: 'checkin',
      header: 'Check-in',
      sortValue: (r) => r.checkIn,
      render: (r) => <CheckInBadge status={r.checkIn} />,
    },
    { key: 'phone', header: 'Phone', render: (r) => r.phone || <Muted>—</Muted> },
    { key: 'company', header: 'Company', sortValue: (r) => r.company, render: (r) => r.company || '—' },
    { key: 'designation', header: 'Designation', render: (r) => r.designation || '—' },
    { key: 'city', header: 'City', sortValue: (r) => r.city, render: (r) => r.city || '—' },
    {
      key: 'added',
      header: 'Added',
      sortValue: (r) => r.createdAt,
      render: (r) => <Muted>{formatDate(r.createdAt)}</Muted>,
    },
  ];

  return (
    <>
      <PageHeader
        title="All Users"
        subtitle="Every guest across all of your events."
        actions={
          <Button
            variant="secondary"
            onClick={() => downloadText(invitesToCsv(rows), `all_users_${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={rows.length === 0}
          >
            <Download /> Export CSV
          </Button>
        }
      />

      <StatsGrid>
        <StatCard label="Total Invitations" value={invitees.length} icon={<Users />} tone="primary" />
        <StatCard
          label="Unique People"
          value={uniquePeople}
          hint="Counted by email address"
          icon={<UserCheck />}
          tone="info"
        />
        <StatCard label="Invitations Sent" value={sent} icon={<MailCheck />} tone="success" />
        <StatCard label="Checked In" value={checkedIn} icon={<QrCode />} tone="accent" />
      </StatsGrid>

      <Card $padded={false}>
        <TableToolbar>
          <SearchInput
            placeholder="Search name, email, company, ticket…"
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
            <option value="">All categories</option>
            {INVITEE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} aria-label="Invitation">
            <option value="">All invitations</option>
            <option value="sent">Sent</option>
            <option value="not_sent">Not sent</option>
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
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={setQrFor}
          minWidth="1680px"
          pageSize={25}
          empty={
            invitees.length === 0
              ? {
                  icon: <Users />,
                  title: 'No users yet',
                  description: 'Guests imported into any event will show up here.',
                }
              : undefined
          }
        />
      </Card>

      <QrTicketModal
        invitee={qrFor}
        event={qrFor ? eventById.get(qrFor.eventId) : undefined}
        onClose={() => setQrFor(null)}
      />
    </>
  );
};

export default AllUsers;
