import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, Camera, CameraOff as CameraOffIcon, CheckCircle2, Keyboard, ScanLine, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import { Field, Input, Select } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import { ScanResultBadge } from '@/components/common/StatusBadges';
import { Stack } from '@/components/common/TableParts';
import { EVENT_STATUSES } from '@/constants/options';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useQrCamera } from '@/hooks/useQrCamera';
import { api, errorMessage } from '@/services/api';
import type { EventItem } from '@/types/event';
import type { ScanResponse, ScanResult } from '@/types/scan';
import { formatDate, formatDateTime, formatTime } from '@/utils/format';
import {
  CameraOff,
  Column,
  Counters,
  Frame,
  Layout,
  ManualForm,
  RecentList,
  ResultPanel,
  Viewport,
  Waiting,
  type Verdict,
} from './Scanner.styles';

const LAST_EVENT_KEY = 'eventsphere_scanner_event';
/** How long a result stays on screen before the scanner is ready again. */
const RESULT_MS = 3500;
/** The same code held in front of the camera is ignored for this long. */
const REPEAT_MS = 5000;
const OPEN_STATUSES = new Set(['upcoming', 'ongoing']);

const VERDICT: Record<ScanResult, Verdict> = {
  valid: 'ok',
  already_used: 'warn',
  invalid: 'bad',
  wrong_event: 'bad',
  event_closed: 'bad',
};

const HEADLINE: Record<ScanResult, string> = {
  valid: 'Admit guest',
  already_used: 'Already checked in',
  invalid: 'Invalid ticket',
  wrong_event: 'Wrong event',
  event_closed: 'Check-in closed',
};

interface SessionScan extends ScanResponse {
  at: string;
  key: number;
  /** The request itself failed (offline, server down), so no ticket was checked. */
  failed?: boolean;
}

const readLastEvent = () => {
  try {
    return localStorage.getItem(LAST_EVENT_KEY) ?? '';
  } catch {
    return '';
  }
};

// Short beep + vibration so door staff don't have to look at the screen.
const feedback = (verdict: Verdict) => {
  try {
    navigator.vibrate?.(verdict === 'ok' ? 120 : [80, 60, 80, 60, 80]);
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = verdict === 'ok' ? 880 : 220;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (verdict === 'ok' ? 0.15 : 0.35));
    osc.onended = () => ctx.close();
  } catch {
    // no audio or vibration available
  }
};

const eventLabel = (e: EventItem) => `${e.title} · ${formatDate(e.date)}`;

const Scanner = () => {
  useDocumentTitle('QR Scanner');
  const { events, loading } = useData();
  const [params, setParams] = useSearchParams();
  const [eventId, setEventId] = useState(() => params.get('event') ?? readLastEvent());
  const [current, setCurrent] = useState<SessionScan | null>(null);
  const [history, setHistory] = useState<SessionScan[]>([]);
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);

  const busyRef = useRef(false);
  const lastRef = useRef({ text: '', at: 0 });
  const clearTimer = useRef<number>(0);

  // Open events first; closed ones can still be picked but will be refused by the server.
  const sorted = [...events].sort(
    (a, b) =>
      Number(OPEN_STATUSES.has(b.status)) - Number(OPEN_STATUSES.has(a.status)) || a.date.localeCompare(b.date),
  );
  const event = events.find((e) => e.id === eventId) ?? (sorted.length === 1 ? sorted[0] : undefined);

  useEffect(() => {
    if (!event) return;
    try {
      localStorage.setItem(LAST_EVENT_KEY, event.id);
    } catch {
      // storage blocked
    }
  }, [event]);

  useEffect(() => () => window.clearTimeout(clearTimer.current), []);

  const submit = useCallback(
    async (payload: string) => {
      if (!event || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      try {
        const res = await api.post<ScanResponse>('/scans', { eventId: event.id, payload });
        const scan = { ...res, at: new Date().toISOString(), key: Date.now() };
        feedback(VERDICT[res.result]);
        setCurrent(scan);
        setHistory((h) => [scan, ...h].slice(0, 30));
        window.clearTimeout(clearTimer.current);
        clearTimer.current = window.setTimeout(() => setCurrent(null), RESULT_MS);
      } catch (err) {
        feedback('bad');
        window.clearTimeout(clearTimer.current);
        setCurrent({
          failed: true,
          valid: false,
          result: 'invalid',
          message: errorMessage(err, 'Scan failed'),
          event: { id: event.id, title: event.title },
          guest: null,
          checkedInAt: null,
          checkedInBy: null,
          at: new Date().toISOString(),
          key: Date.now(),
        });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [event],
  );

  const onDetect = useCallback(
    (text: string) => {
      const now = Date.now();
      if (text === lastRef.current.text && now - lastRef.current.at < REPEAT_MS) return;
      lastRef.current = { text, at: now };
      submit(text);
    },
    [submit],
  );

  const { videoRef, state: cameraState, error: cameraError, start: startCamera, stop: stopCamera } =
    useQrCamera(onDetect);

  // Auto-start camera when an event is first selected.
  useEffect(() => {
    if (!event) return;
    void startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when event id changes
  }, [event?.id]);

  const pickEvent = (id: string) => {
    setEventId(id);
    setCurrent(null);
    setParams(id ? { event: id } : {}, { replace: true });
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    const code = manual.trim();
    if (!code) return;
    lastRef.current = { text: code, at: Date.now() };
    submit(code).then(() => setManual(''));
  };

  const admitted = history.filter((h) => h.result === 'valid').length;

  if (!loading && events.length === 0) {
    return (
      <>
        <PageHeader title="QR Scanner" subtitle="Check guests in at the door." />
        <Card>
          <EmptyState
            icon={<ScanLine />}
            title="No events to scan for"
            description="You haven't been assigned to any event yet. Ask your event planner to add you as a scanner."
          />
        </Card>
      </>
    );
  }

  const closed = event && !OPEN_STATUSES.has(event.status);
  const statusLabel = EVENT_STATUSES.find((s) => s.value === event?.status)?.label;

  return (
    <>
      <PageHeader
        title="QR Scanner"
        subtitle={
          event
            ? `${event.address} · ${formatTime(event.startTime)} – ${formatTime(event.endTime)}`
            : 'Choose the event you are checking guests in for.'
        }
      />

      <Layout>
        <Column>
          <Card>
            <Field label="Event" required>
              <Select value={event?.id ?? ''} onChange={(e) => pickEvent(e.target.value)}>
                {!event && <option value="">Select an event…</option>}
                {sorted.map((e) => (
                  <option key={e.id} value={e.id}>
                    {eventLabel(e)}
                    {OPEN_STATUSES.has(e.status) ? '' : ' (closed)'}
                  </option>
                ))}
              </Select>
            </Field>
            {closed && (
              <p style={{ marginTop: 12, color: '#B45309', fontSize: 13, fontWeight: 500 }}>
                ⚠ This event is {statusLabel?.toLowerCase()}. Tickets will be refused until the planner sets it to
                Upcoming or Ongoing.
              </p>
            )}
          </Card>

          <Viewport>
            <video ref={videoRef} muted playsInline autoPlay disablePictureInPicture />
            {cameraState === 'running' ? (
              <Frame />
            ) : (
              <CameraOff>
                {cameraState === 'error' ? <CameraOffIcon /> : <Camera />}
                <p>
                  {cameraError ||
                    'Select an event, then point at the QR. Hold steady. On phones use https://event.gwbdemo.xyz — or type the ticket code below.'}
                </p>
                <Button onClick={startCamera} loading={cameraState === 'starting'} disabled={!event}>
                  <Camera /> {cameraState === 'error' ? 'Try again' : 'Start camera'}
                </Button>
              </CameraOff>
            )}
          </Viewport>
          {cameraState === 'running' && (
            <Button variant="secondary" onClick={stopCamera}>
              <CameraOffIcon /> Stop camera
            </Button>
          )}

          <Card>
            <ManualForm onSubmit={submitManual}>
              <Input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Or type the ticket code, e.g. EP-7K3F-9QX2"
                aria-label="Ticket code"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={!event}
              />
              <Button type="submit" disabled={!event || !manual.trim()} loading={busy}>
                <Keyboard /> Check
              </Button>
            </ManualForm>
          </Card>
        </Column>

        <Column>
          {current ? (
            <ResultPanel key={current.key} $verdict={VERDICT[current.result]} role="status" aria-live="assertive">
              {current.result === 'valid' ? (
                <CheckCircle2 />
              ) : current.result === 'already_used' ? (
                <AlertTriangle />
              ) : (
                <XCircle />
              )}
              <h2>{current.failed ? 'Scan failed' : HEADLINE[current.result]}</h2>
              {current.guest && (
                <>
                  <h3>{current.guest.name}</h3>
                  <small>
                    {current.guest.category}
                    {current.guest.company && ` · ${current.guest.company}`} · {current.guest.ticketCode}
                  </small>
                </>
              )}
              <p>{current.message}</p>
              {current.result === 'already_used' && current.checkedInAt && (
                <p>
                  <strong>
                    First scanned {formatDateTime(current.checkedInAt)}
                    {current.checkedInBy && ` by ${current.checkedInBy.name}`}
                  </strong>
                </p>
              )}
              <Button variant="secondary" size="sm" onClick={() => setCurrent(null)}>
                Scan next
              </Button>
            </ResultPanel>
          ) : (
            <Waiting>
              <ScanLine />
              <strong>{busy ? 'Checking ticket…' : 'Ready to scan'}</strong>
              <span>Each ticket can be used once. The result appears here.</span>
            </Waiting>
          )}

          <Counters>
            <div>
              <strong>{history.length}</strong>
              <span>Scanned</span>
            </div>
            <div>
              <strong style={{ color: '#15803D' }}>{admitted}</strong>
              <span>Admitted</span>
            </div>
            <div>
              <strong style={{ color: '#DC2626' }}>{history.length - admitted}</strong>
              <span>Rejected</span>
            </div>
          </Counters>

          <Card $padded={false}>
            <CardHeader title="This Session" subtitle="Scans from this device since the page was opened" />
            {history.length === 0 ? (
              <EmptyState title="No scans yet" />
            ) : (
              <RecentList>
                {history.map((h) => (
                  <li key={h.key}>
                    <Stack>
                      <strong>{h.guest?.name ?? 'Unknown ticket'}</strong>
                      <span>{new Date(h.at).toLocaleTimeString()}</span>
                    </Stack>
                    <ScanResultBadge result={h.result} />
                  </li>
                ))}
              </RecentList>
            )}
          </Card>
        </Column>
      </Layout>
    </>
  );
};

export default Scanner;
