import type { QrType } from './qr';

export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type EventCategory =
  | 'Conference'
  | 'Wedding'
  | 'Corporate'
  | 'Concert'
  | 'Exhibition'
  | 'Seminar'
  | 'Gala'
  | 'Workshop';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  venue: string;
  city: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  organizer: string;
  status: EventStatus;
  /** QR style chosen at first import; every ticket for the event uses it. */
  qrType: QrType | null;
  createdAt: string;
}

export type EventInput = Omit<EventItem, 'id' | 'qrType' | 'createdAt'>;
