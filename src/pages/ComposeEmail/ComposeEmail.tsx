import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import { Field, FormGrid, Input, Select } from '@/components/common/Form';
import Modal from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import RichTextEditor from '@/components/email/RichTextEditor';
import TemplatePicker from '@/components/email/TemplatePicker';
import { INVITEE_CATEGORIES } from '@/constants/options';
import { eventDetailsPath } from '@/constants/routes';
import { useData, type SendEmailResult } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api';
import type { EmailTemplateId } from '@/types/email';
import type { EventItem } from '@/types/event';
import type { Invitee } from '@/types/invitee';
import {
  fillPlaceholders,
  getTemplate,
  renderEmail,
  type TemplateVars,
} from '@/utils/emailTemplates';
import { formatDate, formatTime } from '@/utils/format';
import { renderQrDataUrl } from '@/utils/qr';
import {
  CountPill,
  Layout,
  PreviewCard,
  PreviewFrame,
  PreviewMeta,
  ProgressBar,
  SectionTitle,
  SendPanel,
  Stack,
  Toggle,
} from './ComposeEmail.styles';

type RecipientMode = 'all' | 'not_sent' | 'selected' | 'category';

const SAMPLE_GUEST: Pick<Invitee, 'name' | 'email' | 'company' | 'designation' | 'ticketCode'> = {
  name: 'Guest Name',
  email: 'guest@example.com',
  company: 'Company',
  designation: 'Designation',
  ticketCode: 'EP-XXXX-XXXX',
};

const buildVars = (event: EventItem, guest: typeof SAMPLE_GUEST): TemplateVars => ({
  name: guest.name ?? '',
  email: guest.email ?? '',
  company: guest.company ?? '',
  designation: guest.designation ?? '',
  ticketCode: guest.ticketCode ?? '',
  eventTitle: event.title ?? '',
  eventDate: formatDate(event.date),
  eventTime: `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`,
  address: event.address ?? '',
  organizer: event.organizer ?? '',
});

/** Load HTML via blob URL — more reliable than srcDoc inside sticky/overflow layouts. */
const useEmailPreviewFrame = (html: string) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    const blob = new Blob([html || '<!doctype html><html><body></body></html>'], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    return () => {
      URL.revokeObjectURL(url);
      iframe.removeAttribute('src');
    };
  }, [html]);

  return frameRef;
};

const ComposeEmail = () => {
  useDocumentTitle('Send Email');
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { events, invitees, sendEmails } = useData();

  const presetIds = (location.state as { inviteeIds?: string[] } | null)?.inviteeIds ?? [];
  const eventsWithGuests = events.filter((e) => invitees.some((i) => i.eventId === e.id));

  const [eventId, setEventId] = useState(params.get('event') ?? eventsWithGuests[0]?.id ?? '');
  const [mode, setMode] = useState<RecipientMode>(presetIds.length ? 'selected' : 'all');
  const [selectedIds] = useState<string[]>(presetIds);
  const [category, setCategory] = useState<string>('VIP');
  const [templateId, setTemplateId] = useState<EmailTemplateId>('elegant');
  const [subject, setSubject] = useState(getTemplate('elegant').subject);
  const [body, setBody] = useState(getTemplate('elegant').body);
  const [editorKey, setEditorKey] = useState(0);
  const [includeQr, setIncludeQr] = useState(true);
  const [previewId, setPreviewId] = useState('');
  const [qr, setQr] = useState<{ key: string; url: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState<{ progress: number; done: boolean } | null>(null);
  const [result, setResult] = useState<SendEmailResult | null>(null);

  const event = events.find((e) => e.id === eventId);
  const eventInvitees = useMemo(() => invitees.filter((i) => i.eventId === eventId), [invitees, eventId]);

  const recipients = useMemo(() => {
    switch (mode) {
      case 'not_sent':
        return eventInvitees.filter((i) => i.emailStatus !== 'sent');
      case 'selected':
        return eventInvitees.filter((i) => selectedIds.includes(i.id));
      case 'category':
        return eventInvitees.filter((i) => i.category === category);
      default:
        return eventInvitees;
    }
  }, [mode, eventInvitees, selectedIds, category]);

  const previewGuest = recipients.find((r) => r.id === previewId) ?? recipients[0];

  const qrKey = includeQr && previewGuest ? `${previewGuest.qrType}:${previewGuest.qrPayload}` : null;
  useEffect(() => {
    if (!qrKey || !previewGuest) return;
    let active = true;
    renderQrDataUrl(previewGuest.qrType, previewGuest.qrPayload, 336).then((url) => {
      if (active) setQr({ key: qrKey, url });
    });
    return () => {
      active = false;
    };
  }, [qrKey, previewGuest]);
  const qrUrl = qr && qr.key === qrKey ? qr.url : null;

  const vars = event ? buildVars(event, previewGuest ?? SAMPLE_GUEST) : null;
  const previewHtml = vars ? renderEmail(templateId, { bodyHtml: body, vars, qrDataUrl: qrUrl }) : '';
  const previewSubject = vars ? fillPlaceholders(subject, vars, false) : subject;
  const previewFrameRef = useEmailPreviewFrame(previewHtml);

  const changeEvent = (id: string) => {
    setEventId(id);
    setPreviewId('');
    if (mode === 'selected') setMode('all');
    setParams({ event: id }, { replace: true });
  };

  const applyTemplate = (id: EmailTemplateId) => {
    const t = getTemplate(id);
    setTemplateId(id);
    setSubject(t.subject);
    setBody(t.body);
    setEditorKey((k) => k + 1);
  };

  const canSend = !!event && recipients.length > 0 && subject.trim().length > 0;

  const send = async () => {
    if (!event) return;
    setSending({ progress: 5, done: false });
    // The server sends every email before replying; ease the bar towards 90% meanwhile.
    const timer = window.setInterval(
      () => setSending((s) => (s && !s.done ? { ...s, progress: Math.min(90, s.progress + (90 - s.progress) * 0.08) } : s)),
      200,
    );
    try {
      const res = await sendEmails(event.id, {
        inviteeIds: recipients.map((r) => r.id),
        subject,
        bodyHtml: body,
        templateId,
        includeQr,
      });
      setResult(res);
      setSending({ progress: 100, done: true });
      if (res.failed.length) toast.error(`${res.failed.length} emails could not be delivered`);
      else toast.success(`Invitations sent to ${res.sent} guests`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the emails'));
      setSending(null);
    } finally {
      window.clearInterval(timer);
    }
  };

  if (events.length === 0 || eventsWithGuests.length === 0) {
    return (
      <>
        <PageHeader title="Send Email" subtitle="Compose and send invitations to your guests." />
        <Card>
          <EmptyState
            icon={<Mail />}
            title="No guests to email yet"
            description="Import invitees into an event first, then come back to send invitations."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Send Email"
        subtitle="Write your own invitation or start from a designed template."
        back={event ? { to: eventDetailsPath(event.id), label: event.title } : undefined}
      />

      <Layout>
        <Stack>
          <Card>
            <SectionTitle>1. Recipients</SectionTitle>
            <FormGrid $columns={2}>
              <Field label="Event" required>
                <Select value={eventId} onChange={(e) => changeEvent(e.target.value)}>
                  {eventsWithGuests.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Send to" required>
                <Select value={mode} onChange={(e) => setMode(e.target.value as RecipientMode)}>
                  <option value="all">All invitees ({eventInvitees.length})</option>
                  <option value="not_sent">
                    Not invited yet / failed ({eventInvitees.filter((i) => i.emailStatus !== 'sent').length})
                  </option>
                  <option value="category">By category</option>
                  {selectedIds.length > 0 && (
                    <option value="selected">Selected guests ({selectedIds.length})</option>
                  )}
                </Select>
              </Field>
              {mode === 'category' && (
                <Field label="Category">
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {INVITEE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </FormGrid>
            <CountPill>
              <Mail /> {recipients.length} recipient{recipients.length === 1 ? '' : 's'} will receive this email
            </CountPill>
          </Card>

          <Card>
            <SectionTitle>2. Template</SectionTitle>
            <TemplatePicker value={templateId} onChange={applyTemplate} />
          </Card>

          <Card>
            <SectionTitle>3. Message</SectionTitle>
            <Field label="Subject" required hint="Placeholders like {{name}} work here too.">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
            </Field>
            <div style={{ marginTop: 16 }}>
              <RichTextEditor key={editorKey} initialContent={body} onChange={setBody} />
            </div>
            <Toggle>
              <input type="checkbox" checked={includeQr} onChange={(e) => setIncludeQr(e.target.checked)} />
              <div>
                <strong>Attach personal QR entry pass</strong>
                <span>Each guest receives their own unique QR code and ticket number.</span>
              </div>
            </Toggle>
          </Card>
        </Stack>

        <SendPanel>
          <PreviewCard>
            <CardHeader
              title="Live Preview"
              subtitle="Exactly what the selected guest will see"
              actions={
                recipients.length > 0 && (
                  <Select
                    value={previewGuest?.id ?? ''}
                    onChange={(e) => setPreviewId(e.target.value)}
                    aria-label="Preview as"
                    style={{ width: 200 }}
                  >
                    {recipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                )
              }
            />
            <PreviewMeta>
              <div>
                <small>To</small>
                {previewGuest ? `${previewGuest.name} <${previewGuest.email}>` : 'No recipients'}
              </div>
              <div>
                <small>Subject</small>
                <strong>{previewSubject || '(no subject)'}</strong>
              </div>
            </PreviewMeta>
            <PreviewFrame ref={previewFrameRef} title="Email preview" />
          </PreviewCard>
          <Button size="lg" fullWidth disabled={!canSend} onClick={() => setConfirmOpen(true)}>
            <Send /> Send to {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
          </Button>
        </SendPanel>
      </Layout>

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSending(null);
          setResult(null);
        }}
        locked={!!sending && !sending.done}
        size="sm"
        title={sending?.done ? (result?.failed.length ? 'Sent with some failures' : 'Invitations sent') : 'Send invitations?'}
        footer={
          sending?.done ? (
            <Button onClick={() => event && navigate(eventDetailsPath(event.id))}>
              <Eye /> View event
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={!!sending}>
                Cancel
              </Button>
              <Button onClick={send} loading={!!sending}>
                <Send /> Send now
              </Button>
            </>
          )
        }
      >
        {sending?.done && result ? (
          <>
            <EmptyState
              icon={result.failed.length ? <AlertTriangle /> : <CheckCircle2 />}
              title={`${result.sent} email${result.sent === 1 ? '' : 's'} delivered`}
              description={
                result.failed.length
                  ? `${result.failed.length} failed. They are marked "Failed" on the event page so you can retry.`
                  : 'Guests are now marked as invited on the event page.'
              }
            />
            {result.failed.length > 0 && (
              <ul style={{ fontSize: 13, color: '#B91C1C', paddingLeft: 18, maxHeight: 160, overflowY: 'auto' }}>
                {result.failed.slice(0, 20).map((f) => (
                  <li key={f.inviteeId}>
                    {f.email}: {f.error}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : sending ? (
          <>
            <p style={{ marginBottom: 12 }}>Sending {recipients.length} personalised emails… please keep this page open.</p>
            <ProgressBar $pct={sending.progress} />
          </>
        ) : (
          <p>
            <strong>{recipients.length}</strong> guests of <strong>{event?.title}</strong> will receive “
            {previewSubject}”{includeQr && ' with their personal QR entry pass'}.
          </p>
        )}
      </Modal>
    </>
  );
};

export default ComposeEmail;
