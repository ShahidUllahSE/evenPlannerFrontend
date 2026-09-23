export type EmailTemplateId = 'blank' | 'elegant' | 'modern' | 'celebration';

export interface EmailLog {
  id: string;
  eventId: string;
  subject: string;
  templateId: EmailTemplateId;
  recipientCount: number;
  includeQr: boolean;
  sentAt: string;
}
