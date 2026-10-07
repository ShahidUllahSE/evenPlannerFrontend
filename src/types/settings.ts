export interface MailSettings {
  email: string;
  hasPassword: boolean;
  /** `panel` = using admin-saved credentials; `env` = using .env defaults. */
  activeSource: 'panel' | 'env';
  activeEmail: string | null;
  envConfigured: boolean;
  updatedAt: string | null;
}

export interface TwilioSettings {
  accountSid: string;
  fromNumber: string;
  hasAuthToken: boolean;
  activeSource: 'panel' | 'env';
  activeAccountSid: string | null;
  activeFromNumber: string | null;
  envConfigured: boolean;
  updatedAt: string | null;
}
