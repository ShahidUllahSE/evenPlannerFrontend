import { useMemo, useState, type FormEvent } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import { Field, FormGrid, Textarea, Select } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import QrImage from '@/components/qr/QrImage';
import { eventDetailsPath, ROUTES } from '@/constants/routes';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api';
import { formatDate, formatTime } from '@/utils/format';
import {
  Divider,
  Layout,
  MainCard,
  MetaLine,
  Page,
  PlaceholderRow,
  PreviewBubble,
  PreviewLabel,
  PreviewQr,
  SectionLabel,
  SideCard,
  Toggle,
} from './ComposeSms.styles';

const DEFAULT_MESSAGE =
  'Hi {{name}}, you are invited to {{eventTitle}} on {{eventDate}} at {{eventTime}}. Venue: {{address}}. Ticket: {{ticketCode}}';

const PLACEHOLDERS = ['name', 'eventTitle', 'eventDate', 'eventTime', 'address', 'ticketCode'] as const;

const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key: string) => (vars[key] !== undefined ? vars[key]! : m));

const hasPhone = (phone: string) => {
  let digits = phone.trim().replace(/[^\d+]/g, '');
  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  return /^\+[1-9]\d{6,14}$/.test(digits);
};

const ComposeSms = () => {
  useDocumentTitle('Send SMS');
  const [params] = useSearchParams();
  const fromEventId = params.get('event');
  const { events, invitees, sendSms } = useData();

  const [eventId, setEventId] = useState(fromEventId ?? events[0]?.id ?? '');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [includeQr, setIncludeQr] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  const event = events.find((e) => e.id === eventId) ?? null;
  const eventInvitees = useMemo(
    () => invitees.filter((i) => i.eventId === eventId),
    [invitees, eventId],
  );
  const recipients = useMemo(() => eventInvitees.filter((i) => hasPhone(i.phone)), [eventInvitees]);
  const skipped = eventInvitees.length - recipients.length;
  const previewGuest = recipients[0] ?? null;

  const previewVars = useMemo(() => {
    if (!event || !previewGuest) return null;
    return {
      name: previewGuest.name,
      eventTitle: event.title,
      eventDate: formatDate(event.date),
      eventTime: `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`,
      address: event.address || 'TBD',
      ticketCode: previewGuest.ticketCode,
    };
  }, [event, previewGuest]);

  const previewText = previewVars ? fill(message, previewVars) : message;
  const segments = Math.max(1, Math.ceil(previewText.length / 160));

  const insertPlaceholder = (key: string) => {
    setMessage((m) => `${m}${m.endsWith(' ') || m.length === 0 ? '' : ' '}{{${key}}}`);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!recipients.length) {
      toast.error('No guests with a valid phone number (+… E.164)');
      return;
    }
    if (!message.trim()) {
      toast.error('Write an SMS message first');
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await sendSms(event.id, {
        inviteeIds: recipients.map((r) => r.id),
        message: message.trim(),
        includeQr,
      });
      setResult({ sent: res.sent, failed: res.failed.length });
      if (res.failed.length) toast.error(`${res.failed.length} SMS could not be delivered`);
      else toast.success(`SMS sent to ${res.sent} guests${includeQr ? ' with QR' : ''}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send SMS'));
    } finally {
      setSending(false);
    }
  };

  if (events.length === 0) {
    return (
      <Page>
        <PageHeader title="Send SMS" subtitle="Text invitations to guests via Twilio." />
        <Card>
          <EmptyState
            icon={<MessageSquare />}
            title="No events yet"
            description="Create an event and add guests with E.164 phones (e.g. +923001234567), then come back."
          />
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Send SMS"
        subtitle="Twilio SMS/MMS — optional QR image attached like email. Phones need +country code."
        back={
          fromEventId
            ? { to: eventDetailsPath(fromEventId), label: 'Event details' }
            : undefined
        }
      />

      <form onSubmit={submit}>
        <Layout>
          <MainCard>
            <div>
              <SectionLabel>Recipients</SectionLabel>
              <FormGrid $columns={1}>
                <Field label="Event" required>
                  <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </Select>
                </Field>
              </FormGrid>
              <MetaLine>
                {recipients.length === 0
                  ? 'No guests with a valid +phone on this event — add numbers on invitees first.'
                  : `Sending to ${recipients.length} guest${recipients.length === 1 ? '' : 's'} with a valid phone${
                      skipped > 0 ? ` · ${skipped} without +phone skipped` : ''
                    }.`}
              </MetaLine>
            </div>

            <Divider />

            <div>
              <SectionLabel>Message</SectionLabel>
              <PlaceholderRow>
                {PLACEHOLDERS.map((key) => (
                  <button key={key} type="button" onClick={() => insertPlaceholder(key)}>
                    {`{{${key}}}`}
                  </button>
                ))}
              </PlaceholderRow>
              <Field label="SMS text" required>
                <Textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi {{name}}, …"
                />
              </Field>
              <Toggle>
                <input
                  type="checkbox"
                  checked={includeQr}
                  onChange={(e) => setIncludeQr(e.target.checked)}
                />
                <div>
                  <strong>Attach personal QR entry pass</strong>
                  <span>
                    Each guest gets their unique QR as an MMS image (same as email). Your Twilio number must
                    support MMS.
                  </span>
                </div>
              </Toggle>
              <MetaLine>
                {previewText.length} characters · ~{segments} SMS segment
                {segments === 1 ? '' : 's'}
                {includeQr ? ' · + QR image (MMS)' : ''}
              </MetaLine>
            </div>
          </MainCard>

          <SideCard>
            <PreviewLabel>
              Preview
              <span>{previewGuest ? `As ${previewGuest.name}` : 'Sample guest'}</span>
            </PreviewLabel>
            <PreviewBubble>{previewText || 'Your message will appear here.'}</PreviewBubble>
            {includeQr && previewGuest && (
              <PreviewQr>
                <QrImage type={previewGuest.qrType} payload={previewGuest.qrPayload} size={120} />
                <small>{previewGuest.ticketCode}</small>
              </PreviewQr>
            )}

            <Button type="submit" fullWidth size="sm" loading={sending} disabled={!recipients.length}>
              <Send size={15} /> Send to {recipients.length} guest{recipients.length === 1 ? '' : 's'}
            </Button>

            {result && (
              <MetaLine>
                Done — sent {result.sent}
                {result.failed ? ` · failed ${result.failed}` : ''}
              </MetaLine>
            )}

            <MetaLine>
              Credentials: <Link to={ROUTES.TWILIO_SETTINGS}>Twilio Settings</Link>
            </MetaLine>
          </SideCard>
        </Layout>
      </form>
    </Page>
  );
};

export default ComposeSms;
