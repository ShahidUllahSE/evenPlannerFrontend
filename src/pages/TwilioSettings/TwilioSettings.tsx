import { useEffect, useState, type FormEvent } from 'react';
import { Phone, RotateCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Field, FormGrid, FullRow, Input } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api, errorMessage } from '@/services/api';
import type { TwilioSettings as TwilioSettingsType } from '@/types/settings';
import { Hint, StatusRow } from '@/pages/EmailSettings/EmailSettings.styles';

const SID_RE = /^AC[a-f0-9]{32}$/i;
const E164_RE = /^\+[1-9]\d{6,14}$/;

const TwilioSettings = () => {
  useDocumentTitle('Twilio Settings');
  const [settings, setSettings] = useState<TwilioSettingsType | null>(null);
  const [accountSid, setAccountSid] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [errors, setErrors] = useState<{ accountSid?: string; fromNumber?: string; authToken?: string }>({});

  const load = async () => {
    setLoading(true);
    try {
      const { settings: next } = await api.get<{ settings: TwilioSettingsType }>('/settings/twilio');
      setSettings(next);
      setAccountSid(next.accountSid);
      setFromNumber(next.fromNumber);
      setAuthToken('');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const validate = () => {
    const next: typeof errors = {};
    if (!SID_RE.test(accountSid.trim())) next.accountSid = 'Account SID should look like ACxxxxxxxx…';
    if (!E164_RE.test(fromNumber.trim())) next.fromNumber = 'Use E.164 format, e.g. +14155552671';
    if (!settings?.hasAuthToken && authToken.trim().length < 16) {
      next.authToken = 'Auth token is required the first time';
    } else if (authToken.trim() && authToken.trim().length < 16) {
      next.authToken = 'Auth token looks too short';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const body: { accountSid: string; fromNumber: string; authToken?: string } = {
        accountSid: accountSid.trim(),
        fromNumber: fromNumber.trim(),
      };
      if (authToken.trim()) body.authToken = authToken.trim();
      const { settings: next } = await api.put<{ settings: TwilioSettingsType }>('/settings/twilio', body);
      setSettings(next);
      setAccountSid(next.accountSid);
      setFromNumber(next.fromNumber);
      setAuthToken('');
      toast.success('Twilio SMS settings saved.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const clear = () => {
    api
      .delete<{ settings: TwilioSettingsType }>('/settings/twilio')
      .then(({ settings: next }) => {
        setSettings(next);
        setAccountSid(next.accountSid);
        setFromNumber(next.fromNumber);
        setAuthToken('');
        toast.success('Cleared. Twilio will use the .env defaults again.');
      })
      .catch((err) => toast.error(errorMessage(err)));
  };

  const hasPanelConfig = Boolean(settings?.accountSid || settings?.fromNumber || settings?.hasAuthToken);

  return (
    <>
      <PageHeader
        title="Twilio Settings"
        subtitle="Twilio Messages API for invitation SMS/MMS (QR images). Not voice or WhatsApp. Leave unset to use .env defaults."
      />

      <Card>
        {loading || !settings ? (
          <Hint>Loading…</Hint>
        ) : (
          <>
            <StatusRow>
              <span>Currently active</span>
              <strong>
                {settings.activeFromNumber
                  ? `${settings.activeFromNumber}${settings.activeAccountSid ? ` · ${settings.activeAccountSid.slice(0, 10)}…` : ''}`
                  : 'Not configured'}
              </strong>
              <Badge tone={settings.activeSource === 'panel' ? 'success' : 'neutral'} dot>
                {settings.activeSource === 'panel' ? 'Admin panel' : '.env default'}
              </Badge>
            </StatusRow>

            <form onSubmit={submit} noValidate>
              <FormGrid $columns={1}>
                <FullRow>
                  <Field
                    label="Account SID"
                    required
                    error={errors.accountSid}
                    hint="From the Twilio Console dashboard (starts with AC)."
                  >
                    <Input
                      value={accountSid}
                      onChange={(e) => {
                        setAccountSid(e.target.value);
                        setErrors((prev) => ({ ...prev, accountSid: undefined }));
                      }}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      aria-invalid={!!errors.accountSid}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </Field>
                </FullRow>
                <FullRow>
                  <Field
                    label="Auth token"
                    required={!settings.hasAuthToken}
                    error={errors.authToken}
                    hint={
                      settings.hasAuthToken
                        ? 'Leave blank to keep the saved token. Find it under Twilio Console → Account → API keys & tokens.'
                        : 'From Twilio Console → Account → API keys & tokens.'
                    }
                  >
                    <Input
                      type="password"
                      value={authToken}
                      onChange={(e) => {
                        setAuthToken(e.target.value);
                        setErrors((prev) => ({ ...prev, authToken: undefined }));
                      }}
                      placeholder={settings.hasAuthToken ? '••••••••••••••••' : 'Your auth token'}
                      aria-invalid={!!errors.authToken}
                      autoComplete="new-password"
                    />
                  </Field>
                </FullRow>
                <FullRow>
                  <Field
                    label="From number"
                    required
                    error={errors.fromNumber}
                    hint="Twilio phone number in E.164 format (country code required)."
                  >
                    <Input
                      value={fromNumber}
                      onChange={(e) => {
                        setFromNumber(e.target.value);
                        setErrors((prev) => ({ ...prev, fromNumber: undefined }));
                      }}
                      placeholder="+14155552671"
                      aria-invalid={!!errors.fromNumber}
                      autoComplete="off"
                    />
                  </Field>
                </FullRow>
              </FormGrid>

              <StatusRow style={{ marginTop: 20 }}>
                <Button type="submit" loading={saving}>
                  <Save size={16} /> Save settings
                </Button>
                {hasPanelConfig && (
                  <Button type="button" variant="secondary" onClick={() => setClearOpen(true)}>
                    <RotateCcw size={16} /> Use .env defaults
                  </Button>
                )}
              </StatusRow>
            </form>

            <Hint style={{ marginTop: 16 }}>
              <Phone size={14} /> SMS sending only via Twilio Messages. Set server{' '}
              <code>TWILIO_TRANSPORT=sms</code> (not <code>log</code>) to deliver for real. Panel SID, token, and
              from-number override the matching <code>TWILIO_*</code> env values when all three are saved.
            </Hint>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={clearOpen}
        title="Use .env defaults?"
        message="This removes the admin-panel Twilio credentials. SMS will use the values from the server .env file."
        confirmLabel="Clear panel settings"
        tone="danger"
        onConfirm={clear}
        onClose={() => setClearOpen(false)}
      />
    </>
  );
};

export default TwilioSettings;
