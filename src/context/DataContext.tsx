import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createSeedData, type AppData } from '@/data/seed';
import type { EmailLog } from '@/types/email';
import type { EventInput, EventItem } from '@/types/event';
import type { Invitee, InviteeInput } from '@/types/invitee';
import type { QrType } from '@/types/qr';
import { createId } from '@/utils/id';
import { buildQrPayload, generateTicketCode } from '@/utils/qr';

const STORAGE_KEY = 'eventsphere_data_v1';

const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // corrupted or unavailable storage: fall back to seed data
  }
  return createSeedData();
};

export type InviteeUpdate = Partial<InviteeInput & Pick<Invitee, 'rsvp' | 'checkIn'>>;

interface DataContextValue extends AppData {
  createEvent: (input: EventInput) => EventItem;
  updateEvent: (id: string, input: EventInput) => void;
  deleteEvent: (id: string) => void;
  importInvitees: (eventId: string, rows: InviteeInput[], qrType: QrType) => number;
  addInvitee: (eventId: string, input: InviteeInput) => void;
  updateInvitee: (id: string, update: InviteeUpdate) => void;
  deleteInvitees: (ids: string[]) => void;
  regenerateQrCodes: (eventId: string, qrType: QrType) => void;
  recordEmailSent: (log: Omit<EmailLog, 'id' | 'sentAt'>, inviteeIds: string[]) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const makeInvitee = (
  eventId: string,
  input: InviteeInput,
  qrType: QrType,
  takenCodes: Set<string>,
): Invitee => {
  const id = createId('inv');
  const ticketCode = generateTicketCode(takenCodes);
  return {
    ...input,
    id,
    eventId,
    ticketCode,
    qrType,
    qrPayload: buildQrPayload(qrType, { ticketCode, eventId, inviteeId: id }),
    rsvp: 'pending',
    emailStatus: 'not_sent',
    emailSentAt: null,
    checkIn: 'not_checked_in',
    checkedInAt: null,
    createdAt: new Date().toISOString(),
  };
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage full or blocked: keep working in memory
    }
  }, [data]);

  const takenCodes = useCallback(
    (invitees: Invitee[]) => new Set(invitees.map((i) => i.ticketCode)),
    [],
  );

  const createEvent = useCallback((input: EventInput) => {
    const event: EventItem = {
      ...input,
      id: createId('evt'),
      qrType: null,
      createdAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, events: [event, ...d.events] }));
    return event;
  }, []);

  const updateEvent = useCallback((id: string, input: EventInput) => {
    setData((d) => ({
      ...d,
      events: d.events.map((e) => (e.id === id ? { ...e, ...input } : e)),
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setData((d) => ({
      events: d.events.filter((e) => e.id !== id),
      invitees: d.invitees.filter((i) => i.eventId !== id),
      emailLogs: d.emailLogs.filter((l) => l.eventId !== id),
    }));
  }, []);

  const importInvitees = useCallback(
    (eventId: string, rows: InviteeInput[], qrType: QrType) => {
      setData((d) => {
        const codes = takenCodes(d.invitees);
        const created = rows.map((row) => makeInvitee(eventId, row, qrType, codes));
        return {
          ...d,
          events: d.events.map((e) => (e.id === eventId && !e.qrType ? { ...e, qrType } : e)),
          invitees: [...created, ...d.invitees],
        };
      });
      return rows.length;
    },
    [takenCodes],
  );

  const addInvitee = useCallback(
    (eventId: string, input: InviteeInput) => {
      setData((d) => {
        const event = d.events.find((e) => e.id === eventId);
        const qrType = event?.qrType ?? 'standard';
        const invitee = makeInvitee(eventId, input, qrType, takenCodes(d.invitees));
        return {
          ...d,
          events: d.events.map((e) => (e.id === eventId && !e.qrType ? { ...e, qrType } : e)),
          invitees: [invitee, ...d.invitees],
        };
      });
    },
    [takenCodes],
  );

  const updateInvitee = useCallback((id: string, update: InviteeUpdate) => {
    setData((d) => ({
      ...d,
      invitees: d.invitees.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i, ...update };
        if (update.checkIn && update.checkIn !== i.checkIn) {
          next.checkedInAt = update.checkIn === 'checked_in' ? new Date().toISOString() : null;
        }
        return next;
      }),
    }));
  }, []);

  const deleteInvitees = useCallback((ids: string[]) => {
    const remove = new Set(ids);
    setData((d) => ({ ...d, invitees: d.invitees.filter((i) => !remove.has(i.id)) }));
  }, []);

  const regenerateQrCodes = useCallback(
    (eventId: string, qrType: QrType) => {
      setData((d) => {
        const codes = takenCodes(d.invitees.filter((i) => i.eventId !== eventId));
        return {
          ...d,
          events: d.events.map((e) => (e.id === eventId ? { ...e, qrType } : e)),
          invitees: d.invitees.map((i) => {
            if (i.eventId !== eventId) return i;
            const ticketCode = generateTicketCode(codes);
            return {
              ...i,
              ticketCode,
              qrType,
              qrPayload: buildQrPayload(qrType, { ticketCode, eventId, inviteeId: i.id }),
            };
          }),
        };
      });
    },
    [takenCodes],
  );

  const recordEmailSent = useCallback(
    (log: Omit<EmailLog, 'id' | 'sentAt'>, inviteeIds: string[]) => {
      const sentAt = new Date().toISOString();
      const ids = new Set(inviteeIds);
      setData((d) => ({
        ...d,
        emailLogs: [{ ...log, id: createId('log'), sentAt }, ...d.emailLogs],
        invitees: d.invitees.map((i) =>
          ids.has(i.id) ? { ...i, emailStatus: 'sent', emailSentAt: sentAt } : i,
        ),
      }));
    },
    [],
  );

  const resetDemoData = useCallback(() => setData(createSeedData()), []);

  const value = useMemo(
    () => ({
      ...data,
      createEvent,
      updateEvent,
      deleteEvent,
      importInvitees,
      addInvitee,
      updateInvitee,
      deleteInvitees,
      regenerateQrCodes,
      recordEmailSent,
      resetDemoData,
    }),
    [
      data,
      createEvent,
      updateEvent,
      deleteEvent,
      importInvitees,
      addInvitee,
      updateInvitee,
      deleteInvitees,
      regenerateQrCodes,
      recordEmailSent,
      resetDemoData,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
};
