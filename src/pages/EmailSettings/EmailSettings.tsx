import { useEffect, useState, type FormEvent } from 'react';
import { Mail, RotateCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Field, FormGrid, FullRow, Input } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api, errorMessage } from '@/services/api';
import type { MailSettings } from '@/types/settings';
import { Hint, StatusRow } from './EmailSettings.styles';

const EmailSettings = () => {
  useDocumentTitle('Email Settings');
  const [settings, setSettings] = useState<MailSettings | null>(null);
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; appPassword?: string }>({});

  const load = async () => {
    setLoading(true);
    try {
      const { settings: next } = await api.get<{ settings: MailSettings }>('/settings/mail');
      setSettings(next);
      setEmail(next.email);
      setAppPassword('');
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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (!settings?.hasPassword && appPassword.trim().length < 4) {
      next.appPassword = 'App password is required the first time';
    } else if (appPassword.trim() && appPassword.trim().length < 4) {
      next.appPassword = 'App password is too short';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const body: { email: string; appPassword?: string } = { email: email.trim() };
      if (appPassword.trim()) body.appPassword = appPassword.trim();
      const { settings: next } = await api.put<{ settings: MailSettings }>('/settings/mail', body);
      setSettings(next);
      setEmail(next.email);
      setAppPassword('');
      toast.success('Email settings saved. Invitations will send from this address.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const clear = () => {
    api
      .delete<{ settings: MailSettings }>('/settings/mail')
      .then(({ settings: next }) => {
        setSettings(next);
        setEmail(next.email);
        setAppPassword('');
        toast.success('Cleared. Emails will use the .env defaults again.');
      })
      .catch((err) => toast.error(errorMessage(err)));
  };

  return (
    <>
      <PageHeader
        title="Email Settings"
        subtitle="Set the Gmail address and app password used to send invitation emails. Leave unset to use the server .env defaults."
      />

      <Card>
        {loading || !settings ? (
          <Hint>Loading…</Hint>
        ) : (
          <>
            <StatusRow>
              <span>Currently sending from</span>
              <strong>{settings.activeEmail || 'Not configured'}</strong>
              <Badge tone={settings.activeSource === 'panel' ? 'success' : 'neutral'} dot>
                {settings.activeSource === 'panel' ? 'Admin panel' : '.env default'}
              </Badge>
            </StatusRow>

            <form onSubmit={submit} noValidate>
              <FormGrid $columns={1}>
                <FullRow>
                  <Field label="Sender email" required error={errors.email} hint="Usually your Gmail address.">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="you@gmail.com"
                      aria-invalid={!!errors.email}
                      autoComplete="off"
                    />
                  </Field>
                </FullRow>
                <FullRow>
                  <Field
                    label="App password"
                    required={!settings.hasPassword}
                    error={errors.appPassword}
                    hint={
                      settings.hasPassword
                        ? 'Leave blank to keep the saved password. Generate a Gmail App Password under Google Account → Security.'
                        : 'Generate a Gmail App Password under Google Account → Security (not your normal login password).'
                    }
                  >
                    <Input
                      type="password"
                      value={appPassword}
                      onChange={(e) => {
                        setAppPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, appPassword: undefined }));
                      }}
                      placeholder={settings.hasPassword ? '••••••••••••••••' : 'xxxx xxxx xxxx xxxx'}
                      aria-invalid={!!errors.appPassword}
                      autoComplete="new-password"
                    />
                  </Field>
                </FullRow>
              </FormGrid>

              <StatusRow style={{ marginTop: 20 }}>
                <Button type="submit" loading={saving}>
                  <Save size={16} /> Save settings
                </Button>
                {(settings.email || settings.hasPassword) && (
                  <Button type="button" variant="secondary" onClick={() => setClearOpen(true)}>
                    <RotateCcw size={16} /> Use .env defaults
                  </Button>
                )}
              </StatusRow>
            </form>

            <Hint style={{ marginTop: 16 }}>
              <Mail size={14} /> Host, port, and TLS still come from the server environment (
              <code>SMTP_HOST</code>, etc.). Only the account email and app password are overridden here.
            </Hint>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={clearOpen}
        title="Use .env defaults?"
        message="This removes the admin-panel email and app password. Invitation emails will send using the credentials from the server .env file."
        confirmLabel="Clear panel settings"
        tone="danger"
        onConfirm={clear}
        onClose={() => setClearOpen(false)}
      />
    </>
  );
};

export default EmailSettings;
