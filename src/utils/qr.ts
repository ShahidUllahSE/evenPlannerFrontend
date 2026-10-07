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

/**
 * Example payload in each style, for previews only. Real tickets are created and
 * signed by the server, so the scanner can verify them.
 */
export const samplePayload = (type: QrType): string => {
  switch (type) {
    case 'standard':
      return 'EP-SAMP-LE42';
    case 'secure':
      return JSON.stringify({ v: 1, t: 'EP-SAMP-LE42', e: 'event', u: 'guest', s: 'signature' });
    case 'branded':
      return 'https://eventsphere.app/verify/EP-SAMP-LE42?e=event&s=signature';
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
    // Wider quiet zone — phones scan Standard tickets more reliably
    margin: 3,
    errorCorrectionLevel: config.errorLevel,
    color: { dark: config.dark, light: config.light },
  });
  if (config.withLogo) drawLogo(canvas, config.dark);

  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
};
