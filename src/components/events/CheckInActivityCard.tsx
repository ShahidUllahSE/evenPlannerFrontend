import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import styled from 'styled-components';
import Button from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import DataTable, { type Column } from '@/components/common/DataTable';
import { ScanResultBadge } from '@/components/common/StatusBadges';
import { Mono, Muted, Stack } from '@/components/common/TableParts';
import { api, qs } from '@/services/api';
import type { EventStats, ScanLog, ScanLogPage } from '@/types/scan';
import { formatDateTime } from '@/utils/format';

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

type ScannerRow = EventStats['byScanner'][number];

const scannerColumns: Column<ScannerRow>[] = [
  {
    key: 'name',
    header: 'Scanner',
    render: (r) => (
      <Stack>
        <strong>{r.name}</strong>
        <span>{r.email ?? ''}</span>
      </Stack>
    ),
  },
  { key: 'admitted', header: 'Admitted', align: 'center', sortValue: (r) => r.admitted, render: (r) => <strong>{r.admitted}</strong> },
  { key: 'rejected', header: 'Rejected', align: 'center', sortValue: (r) => r.rejected, render: (r) => r.rejected },
  { key: 'last', header: 'Last scan', render: (r) => <Muted>{formatDateTime(r.lastScanAt)}</Muted> },
];

const scanColumns: Column<ScanLog>[] = [
  { key: 'time', header: 'Time', render: (s) => <Muted>{formatDateTime(s.createdAt)}</Muted> },
  {
    key: 'guest',
    header: 'Guest',
    render: (s) =>
      s.inviteeId ? (
        <Stack>
          <strong>{s.inviteeId.name}</strong>
          <span>{s.inviteeId.ticketCode}</span>
        </Stack>
      ) : (
        <Mono>{s.ticketCode ?? 'Unreadable code'}</Mono>
      ),
  },
  { key: 'result', header: 'Result', render: (s) => <ScanResultBadge result={s.result} /> },
  { key: 'by', header: 'Scanned by', render: (s) => s.scannerId?.name ?? <Muted>Deleted user</Muted> },
];

interface CheckInActivityCardProps {
  eventId: string;
  /** Called after a manual refresh so the page can reload guest check-in states too. */
  onRefresh?: () => Promise<void>;
}

const CheckInActivityCard = ({ eventId, onRefresh }: CheckInActivityCardProps) => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [recent, setRecent] = useState<ScanLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [s, logs] = await Promise.all([
      api.get<{ stats: EventStats }>(`/events/${eventId}/stats`),
      api.get<ScanLogPage>(`/scans${qs({ eventId, limit: 15 })}`),
    ]);
    setStats(s.stats);
    setRecent(logs.items);
  }, [eventId]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([load(), onRefresh?.()]);
    } finally {
      setRefreshing(false);
    }
  };

  const rejected =
    (stats?.scans.already_used ?? 0) +
    (stats?.scans.invalid ?? 0) +
    (stats?.scans.wrong_event ?? 0) +
    (stats?.scans.event_closed ?? 0);

  return (
    <Grid>
      <Card $padded={false}>
        <CardHeader
          title="Admissions by Scanner"
          subtitle={
            stats
              ? `${stats.guests.checkedIn} of ${stats.guests.total} guests checked in · ${rejected} rejected scans`
              : 'Loading…'
          }
          actions={
            <Button variant="ghost" size="sm" onClick={refresh} loading={refreshing} title="Refresh">
              <RefreshCw /> Refresh
            </Button>
          }
        />
        <DataTable
          columns={scannerColumns}
          rows={stats?.byScanner ?? []}
          rowKey={(r) => r.scannerId}
          minWidth="440px"
          empty={{ title: 'No scans yet', description: 'Scanner activity appears here on the event day.' }}
        />
      </Card>
      <Card $padded={false}>
        <CardHeader title="Recent Scans" subtitle="Every attempt at the door, valid or not" />
        <DataTable
          columns={scanColumns}
          rows={recent}
          rowKey={(s) => s.id}
          minWidth="560px"
          pageSize={15}
          empty={{ title: 'No scans yet' }}
        />
      </Card>
    </Grid>
  );
};

export default CheckInActivityCard;
