import Papa from 'papaparse';
import { INVITEE_CATEGORIES } from '@/constants/options';
import type { Invitee, InviteeCategory, InviteeInput } from '@/types/invitee';

export type ParsedRowStatus = 'valid' | 'invalid' | 'duplicate';

export interface ParsedRow {
  line: number;
  data: InviteeInput;
  status: ParsedRowStatus;
  error?: string;
}

export const CSV_COLUMNS = [
  { key: 'name', label: 'name', required: true, example: 'Ayesha Khan' },
  { key: 'email', label: 'email', required: true, example: 'ayesha@example.com' },
  { key: 'phone', label: 'phone', required: false, example: '+92 300 1234567' },
  { key: 'company', label: 'company', required: false, example: 'Nimbus Tech' },
  { key: 'designation', label: 'designation', required: false, example: 'Product Manager' },
  { key: 'city', label: 'city', required: false, example: 'Lahore' },
  { key: 'category', label: 'category', required: false, example: 'VIP' },
] as const;

// Accept common header spellings from exported spreadsheets.
const HEADER_ALIASES: Record<string, keyof InviteeInput> = {
  name: 'name',
  fullname: 'name',
  guestname: 'name',
  email: 'email',
  emailaddress: 'email',
  phone: 'phone',
  mobile: 'phone',
  phonenumber: 'phone',
  contact: 'phone',
  company: 'company',
  organization: 'company',
  organisation: 'company',
  designation: 'designation',
  title: 'designation',
  jobtitle: 'designation',
  position: 'designation',
  city: 'city',
  location: 'city',
  category: 'category',
  type: 'category',
  guesttype: 'category',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z]/g, '');

const toCategory = (raw: string): InviteeCategory =>
  INVITEE_CATEGORIES.find((c) => c.toLowerCase() === raw.trim().toLowerCase()) ?? 'Guest';

export const parseInviteeCsv = (file: File, existing: Invitee[]): Promise<ParsedRow[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => HEADER_ALIASES[normalizeHeader(h)] ?? normalizeHeader(h),
      complete: ({ data, meta }) => {
        const fields = meta.fields ?? [];
        if (!fields.includes('name') || !fields.includes('email')) {
          reject(new Error('CSV must contain at least "name" and "email" columns.'));
          return;
        }

        const seen = new Set(existing.map((i) => i.email.toLowerCase()));
        const rows = data.map((raw, index): ParsedRow => {
          const get = (k: string) => (raw[k] ?? '').trim();
          const row: InviteeInput = {
            name: get('name'),
            email: get('email').toLowerCase(),
            phone: get('phone'),
            company: get('company'),
            designation: get('designation'),
            city: get('city'),
            category: toCategory(get('category')),
          };
          const line = index + 2; // +1 header, +1 for 1-based

          if (!row.name) return { line, data: row, status: 'invalid', error: 'Name is missing' };
          if (!EMAIL_RE.test(row.email))
            return { line, data: row, status: 'invalid', error: 'Invalid email' };
          if (seen.has(row.email))
            return { line, data: row, status: 'duplicate', error: 'Already invited' };

          seen.add(row.email);
          return { line, data: row, status: 'valid' };
        });

        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });

export const buildSampleCsv = (): string =>
  Papa.unparse({
    fields: CSV_COLUMNS.map((c) => c.label),
    data: [
      CSV_COLUMNS.map((c) => c.example),
      ['Bilal Ahmed', 'bilal@example.com', '+92 321 7654321', 'Orbit Media', 'Editor', 'Karachi', 'Media'],
      ['Sara Malik', 'sara@example.com', '+92 333 1112233', 'Vertex Labs', 'CTO', 'Islamabad', 'Speaker'],
    ],
  });

export const invitesToCsv = (rows: (Invitee & { eventTitle: string })[]): string =>
  Papa.unparse(
    rows.map((r) => ({
      name: r.name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      designation: r.designation,
      city: r.city,
      category: r.category,
      event: r.eventTitle,
      ticket_code: r.ticketCode,
      rsvp: r.rsvp,
      email_status: r.emailStatus,
      check_in: r.checkIn,
    })),
  );
