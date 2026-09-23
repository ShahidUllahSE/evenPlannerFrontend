import { INVITEE_CATEGORIES } from '@/constants/options';
import type { EmailLog } from '@/types/email';
import type { EventItem } from '@/types/event';
import type { Invitee, InviteeCategory } from '@/types/invitee';
import { createId } from '@/utils/id';
import { buildQrPayload, generateTicketCode } from '@/utils/qr';

export interface AppData {
  events: EventItem[];
  invitees: Invitee[];
  emailLogs: EmailLog[];
}

// Deterministic PRNG so the demo data looks the same on every reset.
const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const FIRST = ['Emily', 'James', 'Sophie', 'Oliver', 'Charlotte', 'Jack', 'Hannah', 'Thomas', 'Lucy', 'Harry', 'Grace', 'George', 'Chloe', 'William', 'Amelia', 'Daniel', 'Olivia', 'Henry', 'Jessica', 'Samuel', 'Emma', 'Edward', 'Rebecca', 'Matthew'];
const LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Taylor', 'Wilson', 'Davies', 'Evans', 'Thompson', 'Walker', 'Wright', 'Robinson', 'Clarke', 'Harris'];
const COMPANIES = ['Nimbus Tech', 'Orbit Media', 'Vertex Labs', 'Crescent Bank', 'Indus Motors', 'Skyline Realty', 'Blue Pine Hotels', 'Zenith Pharma', 'Atlas Consulting', 'Falcon Logistics'];
const DESIGNATIONS = ['CEO', 'Product Manager', 'Marketing Lead', 'Software Engineer', 'Director', 'Editor', 'Consultant', 'HR Manager', 'CTO', 'Founder', 'Sales Head'];
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'];

interface SeedEvent extends Omit<EventItem, 'id' | 'createdAt'> {
  guests: number;
  sentRatio: number;
  checkInRatio: number;
}

const SEED_EVENTS: SeedEvent[] = [
  {
    title: 'Pakistan Tech Summit 2026',
    category: 'Conference',
    description: 'Two tracks of keynotes and panels on AI, fintech and cloud with 40+ speakers.',
    venue: 'Expo Centre',
    city: 'Lahore',
    date: '2026-10-18',
    startTime: '09:00',
    endTime: '18:00',
    capacity: 500,
    organizer: 'TechVision Events',
    status: 'upcoming',
    qrType: 'secure',
    guests: 22,
    sentRatio: 0.6,
    checkInRatio: 0,
  },
  {
    title: 'James & Emily Wedding Reception',
    category: 'Wedding',
    description: 'Evening wedding reception with dinner and a live band.',
    venue: 'Pearl Continental',
    city: 'Karachi',
    date: '2026-11-07',
    startTime: '19:30',
    endTime: '23:30',
    capacity: 350,
    organizer: 'Royal Occasions',
    status: 'upcoming',
    qrType: 'branded',
    guests: 18,
    sentRatio: 1,
    checkInRatio: 0,
  },
  {
    title: 'Annual Corporate Gala Dinner',
    category: 'Gala',
    description: 'Year-end awards night for partners and top performers.',
    venue: 'Serena Hotel',
    city: 'Islamabad',
    date: '2026-10-02',
    startTime: '20:00',
    endTime: '23:00',
    capacity: 200,
    organizer: 'Nimbus Group',
    status: 'upcoming',
    qrType: 'standard',
    guests: 14,
    sentRatio: 0.3,
    checkInRatio: 0,
  },
  {
    title: 'Healthcare Innovation Seminar',
    category: 'Seminar',
    description: 'Half-day seminar on digital health and hospital operations.',
    venue: 'Aga Khan University Auditorium',
    city: 'Karachi',
    date: '2026-09-24',
    startTime: '09:00',
    endTime: '13:00',
    capacity: 150,
    organizer: 'MedConnect',
    status: 'ongoing',
    qrType: 'secure',
    guests: 12,
    sentRatio: 1,
    checkInRatio: 0.5,
  },
  {
    title: 'Startup Founders Workshop',
    category: 'Workshop',
    description: 'Hands-on fundraising and pitching workshop for early-stage founders.',
    venue: 'National Incubation Center',
    city: 'Karachi',
    date: '2026-09-10',
    startTime: '10:00',
    endTime: '16:00',
    capacity: 80,
    organizer: 'LaunchPad PK',
    status: 'completed',
    qrType: 'standard',
    guests: 10,
    sentRatio: 1,
    checkInRatio: 0.8,
  },
  {
    title: 'Winter Music Fest',
    category: 'Concert',
    description: 'Open-air evening concert featuring local bands.',
    venue: 'Alhamra Arts Council',
    city: 'Lahore',
    date: '2026-12-20',
    startTime: '18:00',
    endTime: '23:00',
    capacity: 1000,
    organizer: 'SoundWave Live',
    status: 'draft',
    qrType: null,
    guests: 0,
    sentRatio: 0,
    checkInRatio: 0,
  },
];

const pick = <T,>(rand: () => number, list: readonly T[]): T => list[Math.floor(rand() * list.length)]!;

export const createSeedData = (): AppData => {
  const rand = mulberry32(2026);
  const takenCodes = new Set<string>();
  const events: EventItem[] = [];
  const invitees: Invitee[] = [];
  const emailLogs: EmailLog[] = [];
  const now = Date.now();

  SEED_EVENTS.forEach(({ guests, sentRatio, checkInRatio, ...eventData }, eventIndex) => {
    const event: EventItem = {
      ...eventData,
      id: createId('evt'),
      createdAt: new Date(now - (30 - eventIndex * 3) * 86_400_000).toISOString(),
    };
    events.push(event);

    const usedEmails = new Set<string>();
    for (let i = 0; i < guests; i++) {
      let first: string, last: string, email: string;
      do {
        first = pick(rand, FIRST);
        last = pick(rand, LAST);
        email = `${first}.${last}`.toLowerCase() + '@example.com';
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const id = createId('inv');
      const ticketCode = generateTicketCode(takenCodes);
      const sent = i < Math.round(guests * sentRatio);
      const checkedIn = i < Math.round(guests * checkInRatio);
      const rsvpRoll = rand();
      const createdAt = new Date(now - (20 - eventIndex) * 86_400_000 + i * 60_000).toISOString();
      const category: InviteeCategory = i < 2 ? 'VIP' : pick(rand, INVITEE_CATEGORIES);

      invitees.push({
        id,
        eventId: event.id,
        name: `${first} ${last}`,
        email,
        phone: `+92 3${Math.floor(rand() * 50 + 0)
          .toString()
          .padStart(2, '0')} ${Math.floor(1_000_000 + rand() * 8_999_999)}`,
        company: pick(rand, COMPANIES),
        designation: pick(rand, DESIGNATIONS),
        city: pick(rand, CITIES),
        category,
        ticketCode,
        qrType: event.qrType!,
        qrPayload: buildQrPayload(event.qrType!, { ticketCode, eventId: event.id, inviteeId: id }),
        rsvp: !sent ? 'pending' : rsvpRoll > 0.25 ? 'accepted' : rsvpRoll > 0.1 ? 'pending' : 'declined',
        emailStatus: sent ? 'sent' : 'not_sent',
        emailSentAt: sent ? new Date(now - (10 - eventIndex) * 86_400_000).toISOString() : null,
        checkIn: checkedIn ? 'checked_in' : 'not_checked_in',
        checkedInAt: checkedIn ? new Date(now - eventIndex * 3_600_000).toISOString() : null,
        createdAt,
      });
    }

    const sentCount = Math.round(guests * sentRatio);
    if (sentCount > 0) {
      emailLogs.push({
        id: createId('log'),
        eventId: event.id,
        subject: `Your invitation to ${event.title}`,
        templateId: (['elegant', 'modern', 'celebration'] as const)[eventIndex % 3]!,
        recipientCount: sentCount,
        includeQr: true,
        sentAt: new Date(now - (10 - eventIndex) * 86_400_000).toISOString(),
      });
    }
  });

  return { events, invitees, emailLogs };
};
