import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CircleCheck, MailCheck, MapPin, Plus, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import DataTable, { type Column } from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import {
  CategoryBadge,
  EmailBadge,
  EventStatusBadge,
  RsvpBadge,
} from '@/components/common/StatusBadges';
import { Meter, Mono, Muted, PersonCell } from '@/components/common/TableParts';
import EventFormModal from '@/components/events/EventFormModal';
import { eventDetailsPath, ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { Invitee } from '@/types/invitee';
import { daysUntil, formatDate, formatNumber, formatTime } from '@/utils/format';

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

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const List = styled.ul`
  list-style: none;
`;

const EventRow = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `14px ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  a {
    display: contents;
  }
`;

const DateTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 56px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryHover};

  small {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  strong {
    font-size: 1.25rem;
    line-height: 1.1;
  }
`;

const EventInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }

  svg {
    width: 13px;
    height: 13px;
  }
`;

const RowEnd = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ProgressRow = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 160px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => `14px ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  strong {
    display: block;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ViewAll = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Dashboard = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { events, invitees } = useData();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const eventById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const stats = useMemo(() => {
    const sent = invitees.filter((i) => i.emailStatus === 'sent').length;
    const accepted = invitees.filter((i) => i.rsvp === 'accepted').length;
    const activeEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').length;
    return { sent, accepted, activeEvents };
  }, [events, invitees]);

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => (e.status === 'upcoming' || e.status === 'ongoing') && daysUntil(e.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [events],
  );

  const invitationProgress = useMemo(
    () =>
      events
        .map((e) => {
          const list = invitees.filter((i) => i.eventId === e.id);
          return {
            event: e,
            total: list.length,
            sent: list.filter((i) => i.emailStatus === 'sent').length,
          };
        })
        .filter((row) => row.total > 0)
        .slice(0, 5),
    [events, invitees],
  );

  const recentInvitees = useMemo(
    () => [...invitees].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [invitees],
  );

  const columns: Column<Invitee>[] = [
    { key: 'person', header: 'Guest', render: (i) => <PersonCell name={i.name} email={i.email} /> },
    {
      key: 'event',
      header: 'Event',
      render: (i) => <Muted>{eventById.get(i.eventId)?.title ?? '—'}</Muted>,
    },
    { key: 'company', header: 'Company', render: (i) => i.company || '—' },
    { key: 'category', header: 'Category', render: (i) => <CategoryBadge category={i.category} /> },
    { key: 'ticket', header: 'Ticket', render: (i) => <Mono>{i.ticketCode}</Mono> },
    { key: 'email', header: 'Invitation', render: (i) => <EmailBadge status={i.emailStatus} /> },
    { key: 'rsvp', header: 'RSVP', render: (i) => <RsvpBadge status={i.rsvp} /> },
  ];

  return (
    <>
      <PageHeader
        title={`Good day, ${user?.name.split(' ')[0] ?? 'there'}`}
        subtitle="Here's what's happening across your events."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> Create Event
          </Button>
        }
      />

      <StatsGrid>
        <StatCard
          label="Total Events"
          value={formatNumber(events.length)}
          hint={`${stats.activeEvents} active or upcoming`}
          icon={<CalendarDays />}
          tone="primary"
        />
        <StatCard
          label="Total Invitees"
          value={formatNumber(invitees.length)}
          hint={`${formatNumber(invitees.length)} unique QR tickets issued`}
          icon={<Users />}
          tone="info"
        />
        <StatCard
          label="Invitations Sent"
          value={formatNumber(stats.sent)}
          hint={`${invitees.length - stats.sent} still pending`}
          icon={<MailCheck />}
          tone="success"
        />
        <StatCard
          label="Accepted RSVPs"
          value={formatNumber(stats.accepted)}
          hint={
            stats.sent > 0
              ? `${Math.round((stats.accepted / stats.sent) * 100)}% of invited guests`
              : 'No invitations sent yet'
          }
          icon={<CircleCheck />}
          tone="accent"
        />
      </StatsGrid>

      <TwoCol>
        <Card $padded={false}>
          <CardHeader
            title="Upcoming Events"
            subtitle="Next events on your calendar"
            actions={
              <ViewAll to={ROUTES.EVENTS}>
                View all <ArrowRight />
              </ViewAll>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState title="No upcoming events" description="Create an event to get started." />
          ) : (
            <List>
              {upcoming.map((e) => {
                const d = new Date(`${e.date}T00:00:00`);
                const days = daysUntil(e.date);
                return (
                  <EventRow key={e.id}>
                    <Link to={eventDetailsPath(e.id)}>
                      <DateTile>
                        <small>{d.toLocaleDateString('en-US', { month: 'short' })}</small>
                        <strong>{d.getDate()}</strong>
                      </DateTile>
                      <EventInfo>
                        <strong>{e.title}</strong>
                        <span>
                          <MapPin /> {e.venue}, {e.city} · {formatTime(e.startTime)}
                        </span>
                      </EventInfo>
                      <RowEnd>
                        <EventStatusBadge status={e.status} />
                        {days === 0 ? 'Today' : `in ${days} day${days === 1 ? '' : 's'}`}
                      </RowEnd>
                    </Link>
                  </EventRow>
                );
              })}
            </List>
          )}
        </Card>

        <Card $padded={false}>
          <CardHeader title="Invitation Progress" subtitle="Emails sent vs. total guests per event" />
          {invitationProgress.length === 0 ? (
            <EmptyState title="No invitees yet" description="Import a CSV to an event to see progress." />
          ) : (
            <List>
              {invitationProgress.map(({ event, total, sent }) => (
                <ProgressRow key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <small>{formatDate(event.date)}</small>
                  </div>
                  <Meter value={sent} max={total} />
                </ProgressRow>
              ))}
            </List>
          )}
        </Card>
      </TwoCol>

      <Card $padded={false}>
        <CardHeader
          title="Recently Added Guests"
          subtitle="Latest invitees across all events"
          actions={
            <ViewAll to={ROUTES.USERS}>
              View all users <ArrowRight />
            </ViewAll>
          }
        />
        <DataTable
          columns={columns}
          rows={recentInvitees}
          rowKey={(i) => i.id}
          onRowClick={(i) => navigate(eventDetailsPath(i.eventId))}
          pageSize={10}
          empty={{ title: 'No guests yet', description: 'Imported guests will appear here.' }}
        />
      </Card>

      <EventFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(e) => navigate(eventDetailsPath(e.id))}
      />
    </>
  );
};

export default Dashboard;
