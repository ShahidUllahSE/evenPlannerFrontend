import { useCallback, useEffect, useMemo, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import DataTable, { type Column } from '@/components/common/DataTable';
import { Select } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import { SCAN_RESULT, ScanResultBadge } from '@/components/common/StatusBadges';
import { Mono, Muted, Stack, TableToolbar, ToolbarSpacer } from '@/components/common/TableParts';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api, errorMessage, qs } from '@/services/api';
import type { ScanLog, ScanLogPage, ScanResult } from '@/types/scan';
import { formatDateTime } from '@/utils/format';

/** The API's maximum page size. */
const PAGE = 200;

const shortDevice = (ua: string | null) => {
  if (!ua) return '—';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS/.test(ua)) return 'Mac';
  return 'Other';
};

const ScanHistory = () => {
  useDocumentTitle('Scan History');
  const { user, isManager } = useAuth();
  const { events, users } = useData();
  const [eventId, setEventId] = useState('');
  const [result, setResult] = useState('');
  const [scannerId, setScannerId] = useState('');
  const [items, setItems] = useState<ScanLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(
    (n: number) =>
      api.get<ScanLogPage>(
        `/scans${qs({ eventId, result, scannerId: isManager ? scannerId : undefined, page: n, limit: PAGE })}`,
      ),
    [eventId, result, scannerId, isManager],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPage(1);
      setItems(res.items);
      setTotal(res.total);
      setPage(1);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetchPage(page + 1);
      setItems((i) => [...i, ...res.items]);
      setTotal(res.total);
      setPage(page + 1);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const scanners = useMemo(() => users.filter((u) => u.role === 'scanner'), [users]);

  const columns: Column<ScanLog>[] = [
    {
      key: 'time',
      header: 'Time',
      sortValue: (s) => s.createdAt,
      render: (s) => <Muted>{formatDateTime(s.createdAt)}</Muted>,
    },
    {
      key: 'result',
      header: 'Result',
      sortValue: (s) => s.result,
      render: (s) => <ScanResultBadge result={s.result} />,
    },
    {
      key: 'guest',
      header: 'Guest',
      sortValue: (s) => s.inviteeId?.name ?? '',
      render: (s) =>
        s.inviteeId ? (
          <Stack>
            <strong>{s.inviteeId.name}</strong>
            <span>{s.inviteeId.email}</span>
          </Stack>
        ) : (
          <Muted>Unknown ticket</Muted>
        ),
    },
    {
      key: 'ticket',
      header: 'Ticket',
      render: (s) => <Mono>{s.inviteeId?.ticketCode ?? s.ticketCode ?? '—'}</Mono>,
    },
    {
      key: 'event',
      header: 'Event',
      sortValue: (s) => s.eventId?.title ?? '',
      render: (s) => s.eventId?.title ?? <Muted>Deleted event</Muted>,
    },
    ...(isManager
      ? [
          {
            key: 'scanner',
            header: 'Scanned by',
            sortValue: (s: ScanLog) => s.scannerId?.name ?? '',
            render: (s: ScanLog) => s.scannerId?.name ?? <Muted>Deleted user</Muted>,
          },
        ]
      : []),
    { key: 'device', header: 'Device', render: (s) => <Muted title={s.userAgent ?? undefined}>{shortDevice(s.userAgent)}</Muted> },
    { key: 'ip', header: 'IP', render: (s) => <Muted>{s.ip ?? '—'}</Muted> },
  ];

  return (
    <>
      <PageHeader
        title="Scan History"
        subtitle={
          user?.role === 'admin'
            ? 'Every scan attempt at every event.'
            : user?.role === 'planner'
              ? 'Every scan attempt at your events, by any scanner.'
              : 'Every ticket you have scanned.'
        }
        actions={
          <Button variant="secondary" onClick={load} loading={loading}>
            <RefreshCw /> Refresh
          </Button>
        }
      />

      <Card $padded={false}>
        <TableToolbar>
          <Muted>
            {total.toLocaleString('en-US')} scan{total === 1 ? '' : 's'}
          </Muted>
          <ToolbarSpacer />
          <Select value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Event">
            <option value="">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
          {isManager && scanners.length > 0 && (
            <Select value={scannerId} onChange={(e) => setScannerId(e.target.value)} aria-label="Scanner">
              <option value="">All scanners</option>
              {scanners.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}
          <Select value={result} onChange={(e) => setResult(e.target.value)} aria-label="Result">
            <option value="">All results</option>
            {(Object.keys(SCAN_RESULT) as ScanResult[]).map((r) => (
              <option key={r} value={r}>
                {SCAN_RESULT[r][1]}
              </option>
            ))}
          </Select>
        </TableToolbar>
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(s) => s.id}
          minWidth="960px"
          pageSize={25}
          empty={
            loading
              ? { title: 'Loading…' }
              : { icon: <History />, title: 'No scans yet', description: 'Scans appear here as guests are checked in.' }
          }
        />
      </Card>
      {items.length < total && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Button variant="secondary" onClick={loadMore} loading={loading}>
            Load older scans ({(total - items.length).toLocaleString('en-US')} more)
          </Button>
        </div>
      )}
    </>
  );
};

export default ScanHistory;
