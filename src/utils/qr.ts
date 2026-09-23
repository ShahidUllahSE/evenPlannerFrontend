import QRCode from 'qrcode';
import type { QrType } from '@/types/qr';

interface QrTypeConfig {
  label: string;
  tagline: string;
  description: string;
  encodes: string;
  dark: string;
  light: string;
  errorLevel: 'M' | 'H';
  withLogo: boolean;
}

export const QR_TYPES: Record<QrType, QrTypeConfig> = {
  standard: {
    label: 'Standard ID',
    tagline: 'Simple & fastest to scan',
    description: 'Classic black & white code holding only the unique ticket ID.',
    encodes: 'Ticket ID',
    dark: '#0F1B2D',
    light: '#FFFFFF',
    errorLevel: 'M',
    withLogo: false,
  },
  secure: {
    label: 'Secure Token',
    tagline: 'Tamper-evident check',
    description: 'Encodes ticket, event and guest IDs plus a signature the scanner verifies.',
    encodes: 'Signed JSON token',
    dark: '#1E3A5F',
    light: '#FFFFFF',
    errorLevel: 'M',
    withLogo: false,
  },
  branded: {
    label: 'Branded Pass',
    tagline: 'Premium look with logo',
    description: 'Brand-colored verification link with the EventSphere mark in the center.',
    encodes: 'Verification link',
    dark: '#0E7C7B',
    light: '#FFFFFF',
    errorLevel: 'H',
    withLogo: true,
  },
};

export const QR_TYPE_ORDER: QrType[] = ['standard', 'secure', 'branded'];

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

const randomChunk = (length: number) => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
};

/** Generates a ticket code not already present in `taken` and adds it to the set. */
export const generateTicketCode = (taken: Set<string>): string => {
  let code: string;
  do {
    code = `EP-${randomChunk(4)}-${randomChunk(4)}`;
  } while (taken.has(code));
  taken.add(code);
  return code;
};

// Placeholder signing for the frontend demo. Real signing (HMAC with a server
// secret) must happen on the backend so tokens cannot be forged.
const DEMO_SECRET = 'eventsphere-demo-secret';

export const signTicket = (ticketCode: string, eventId: string, inviteeId: string): string => {
  const input = `${ticketCode}|${eventId}|${inviteeId}|${DEMO_SECRET}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).toUpperCase();
};

export const VERIFY_BASE_URL = 'https://eventsphere.app/verify';

export const buildQrPayload = (
  type: QrType,
  ticket: { ticketCode: string; eventId: string; inviteeId: string },
): string => {
  const { ticketCode, eventId, inviteeId } = ticket;
  const sig = signTicket(ticketCode, eventId, inviteeId);

  switch (type) {
    case 'standard':
      return ticketCode;
    case 'secure':
      return JSON.stringify({ v: 1, t: ticketCode, e: eventId, u: inviteeId, s: sig });
    case 'branded':
      return `${VERIFY_BASE_URL}/${ticketCode}?e=${eventId}&s=${sig}`;
  }
};

const cache = new Map<string, string>();

const drawLogo = (canvas: HTMLCanvasElement, color: string) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = canvas.width * 0.22;
  const x = (canvas.width - size) / 2;
  const y = (canvas.height - size) / 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, size + 8, size + 8, 10);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 8);
  ctx.fill();

  ctx.fillStyle = '#D4A437';
  ctx.font = `700 ${size * 0.42}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ES', canvas.width / 2, canvas.height / 2 + 1);
};

/** Renders a QR as a PNG data URL, styled per QR type. Results are memoized. */
export const renderQrDataUrl = async (type: QrType, payload: string, size = 240) => {
  const key = `${type}:${size}:${payload}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const config = QR_TYPES[type];
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, payload, {
    width: size,
    margin: 1,
    errorCorrectionLevel: config.errorLevel,
    color: { dark: config.dark, light: config.light },
  });
  if (config.withLogo) drawLogo(canvas, config.dark);

  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
};
