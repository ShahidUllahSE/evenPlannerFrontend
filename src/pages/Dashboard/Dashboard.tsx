import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, MailCheck, MapPin, Plus, ScanLine, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import StatCard from '@/components/common/StatCard';
import { EventStatusBadge, ScanResultBadge } from '@/components/common/StatusBadges';
import { Meter, Mono } from '@/components/common/TableParts';
import EventFormModal from '@/components/events/EventFormModal';
import { eventDetailsPath, ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/services/api';
import type { ScanLog } from '@/types/scan';
import { daysUntil, formatDate, formatDateTime, formatNumber, formatTime } from '@/utils/format';
import {
  ActivityMain,
  ActivityMeta,
  ActivityRow,
  Avatar,
  DateTile,
  EmptyPad,
  EventInfo,
  EventLink,
  Hero,
  HeroCopy,
  List,
  MainGrid,
  Page,
  Panel,
  PanelHeader,
  ProgressMeta,
  ProgressRow,
  RowEnd,
  ScansList,
  SideStack,
  StatsGrid,
  TeamCell,
  TeamGrid,
  ViewAll,
} from './Dashboard.styles';

interface DashboardSummary {
  scansToday: number;
  recentScans: ScanLog[];
  users?: Partial<Record<'admin' | 'planner' | 'scanner', number>>;
}

const initials = (name?: string | null) => {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

const Dashboard = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { events, invitees } = useData();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let active = true;
    api
      .get<DashboardSummary>('/dashboard')
      .then((res) => active && setSummary(res))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const sent = invitees.filter((i) => i.emailStatus === 'sent').length;
    const checkedIn = invitees.filter((i) => i.checkIn === 'checked_in').length;
    const activeEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').length;
    return { sent, checkedIn, activeEvents, pending: Math.max(0, invitees.length - sent) };
  }, [events, invitees]);

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => (e.status === 'upcoming' || e.status === 'ongoing') && daysUntil(e.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 10),
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
        .sort((a, b) => a.event.date.localeCompare(b.event.date))
        .slice(0, 10),
    [events, invitees],
  );

  const recentScans = summary?.recentScans?.slice(0, 12) ?? [];
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <Page>
      <Hero>
        <HeroCopy>
          <small>EvenPlanner</small>
          <h1>Good day, {firstName}</h1>
          <p>
            {isAdmin
              ? 'Overview of every planner, event, and door scan across the platform.'
              : 'A clear view of your events, invitations, and check-ins.'}
          </p>
        </HeroCopy>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus /> Create Event
        </Button>
      </Hero>

      <StatsGrid>
        <StatCard
          compact
          label="Events"
          value={formatNumber(events.length)}
          hint={`${stats.activeEvents} upcoming or ongoing`}
          icon={<CalendarDays />}
          tone="primary"
        />
        <StatCard
          compact
          label="Guests"
          value={formatNumber(invitees.length)}
          hint="QR tickets issued"
          icon={<Users />}
          tone="info"
        />
        <StatCard
          compact
          label="Invites sent"
          value={formatNumber(stats.sent)}
          hint={`${formatNumber(stats.pending)} still pending`}
          icon={<MailCheck />}
          tone="success"
        />
        <StatCard
          compact
          label="Checked in"
          value={formatNumber(stats.checkedIn)}
          hint={`${formatNumber(summary?.scansToday ?? 0)} scans today`}
          icon={<ScanLine />}
          tone="accent"
        />
      </StatsGrid>

      <MainGrid>
        <Panel>
          <PanelHeader>
            <div>
              <h3>Upcoming events</h3>
              <p>Next on the calendar</p>
            </div>
            <ViewAll to={ROUTES.EVENTS}>
              All events <ArrowRight />
            </ViewAll>
          </PanelHeader>
          {upcoming.length === 0 ? (
            <EmptyPad>
              <EmptyState title="No upcoming events" description="Create an event to get started." />
            </EmptyPad>
          ) : (
            <List>
              {upcoming.map((e) => {
                const d = new Date(`${e.date}T00:00:00`);
                const days = daysUntil(e.date);
                return (
                  <EventLink key={e.id} to={eventDetailsPath(e.id)}>
                    <DateTile>
                      <small>{d.toLocaleDateString('en-US', { month: 'short' })}</small>
                      <strong>{d.getDate()}</strong>
                    </DateTile>
                    <EventInfo>
                      <strong>{e.title}</strong>
                      <span>
                        <MapPin />
                        {e.address || 'Address TBD'} · {formatTime(e.startTime)}
                      </span>
                    </EventInfo>
                    <RowEnd>
                      <EventStatusBadge status={e.status} />
                      <span>{days === 0 ? 'Today' : `In ${days} day${days === 1 ? '' : 's'}`}</span>
                    </RowEnd>
                  </EventLink>
                );
              })}
            </List>
          )}
        </Panel>

        <SideStack>
          {isAdmin && summary?.users && (
            <Panel>
              <PanelHeader>
                <div>
                  <h3>Team</h3>
                  <p>Accounts on the platform</p>
                </div>
                <ViewAll to={ROUTES.TEAM}>
                  Manage <ArrowRight />
                </ViewAll>
              </PanelHeader>
              <TeamGrid>
                <TeamCell $tone="primary">
                  <strong>{summary.users.admin ?? 0}</strong>
                  <span>Admins</span>
                </TeamCell>
                <TeamCell $tone="info">
                  <strong>{summary.users.planner ?? 0}</strong>
                  <span>Planners</span>
                </TeamCell>
                <TeamCell $tone="accent">
                  <strong>{summary.users.scanner ?? 0}</strong>
                  <span>Scanners</span>
                </TeamCell>
              </TeamGrid>
            </Panel>
          )}

          <Panel>
            <PanelHeader>
              <div>
                <h3>Invitation progress</h3>
                <p>Emails sent vs guests</p>
              </div>
            </PanelHeader>
            {invitationProgress.length === 0 ? (
              <EmptyPad>
                <EmptyState title="No invitees yet" description="Import a guest list on an event." />
              </EmptyPad>
            ) : (
              <List>
                {invitationProgress.map(({ event, total, sent }) => (
                  <ProgressRow key={event.id}>
                    <div>
                      <strong>{event.title}</strong>
                      <small>{formatDate(event.date)}</small>
                    </div>
                    <ProgressMeta>
                      <Meter value={sent} max={total} />
                    </ProgressMeta>
                  </ProgressRow>
                ))}
              </List>
            )}
          </Panel>
        </SideStack>
      </MainGrid>

      <Panel>
        <PanelHeader>
          <div>
            <h3>Recent door scans</h3>
            <p>Latest check-in activity</p>
          </div>
          <ViewAll to={ROUTES.SCAN_HISTORY}>
            Full history <ArrowRight />
          </ViewAll>
        </PanelHeader>
        {recentScans.length === 0 ? (
          <EmptyPad>
            <EmptyState
              icon={<ScanLine />}
              title="No scans yet"
              description="Check-ins appear here as guests arrive."
            />
          </EmptyPad>
        ) : (
          <ScansList>
            {recentScans.map((s) => {
              const name = s.inviteeId?.name;
              return (
                <ActivityRow key={s.id}>
                  <Avatar aria-hidden>{initials(name)}</Avatar>
                  <ActivityMain>
                    <strong>
                      {name ?? (s.ticketCode ? <Mono>{s.ticketCode}</Mono> : 'Unreadable code')}
                    </strong>
                    <span>{s.inviteeId?.ticketCode ?? s.ticketCode ?? '—'}</span>
                  </ActivityMain>
                  <ActivityMeta title={`${s.eventId?.title ?? '—'} · ${formatDateTime(s.createdAt)}`}>
                    {s.eventId?.title ?? '—'} · {formatDateTime(s.createdAt)}
                  </ActivityMeta>
                  <ScanResultBadge result={s.result} />
                </ActivityRow>
              );
            })}
          </ScansList>
        )}
      </Panel>

      <EventFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(e) => navigate(eventDetailsPath(e.id))}
      />
    </Page>
  );
};

export default Dashboard;
