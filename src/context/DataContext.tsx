import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { EmailLog, EmailTemplateId } from '@/types/email';
import type { EventInput, EventItem } from '@/types/event';
import type { Invitee, InviteeInput } from '@/types/invitee';
import type { QrType } from '@/types/qr';
import type { User, UserInput, UserUpdate } from '@/types/user';

export type InviteeUpdate = Partial<InviteeInput & Pick<Invitee, 'rsvp' | 'checkIn'>>;

export interface ImportResult {
  created: number;
  skipped: { email: string; reason: string }[];
}

export interface SendEmailInput {
  inviteeIds: string[];
  subject: string;
  bodyHtml: string;
  templateId: EmailTemplateId;
  includeQr: boolean;
}

export interface SendEmailResult {
  sent: number;
  failed: { inviteeId: string; email: string; error: string }[];
}

interface DataContextValue {
  events: EventItem[];
  invitees: Invitee[];
  emailLogs: EmailLog[];
  /** Admin: every account. Planner: the scanners they created. Scanner: empty. */
  users: User[];
  loading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;

  createEvent: (input: EventInput & { plannerId?: string }) => Promise<EventItem>;
  updateEvent: (id: string, input: Partial<EventInput>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  assignScanners: (eventId: string, scannerIds: string[]) => Promise<User[]>;

  importInvitees: (eventId: string, rows: InviteeInput[], qrType: QrType) => Promise<ImportResult>;
  addInvitee: (eventId: string, input: InviteeInput) => Promise<Invitee>;
  updateInvitee: (id: string, update: InviteeUpdate) => Promise<void>;
  deleteInvitees: (ids: string[]) => Promise<number>;
  regenerateQrCodes: (eventId: string, qrType: QrType) => Promise<number>;
  sendEmails: (eventId: string, input: SendEmailInput) => Promise<SendEmailResult>;
  /** Re-fetches one event's guests, e.g. after check-ins at the door. */
  refreshEventInvitees: (eventId: string) => Promise<void>;

  createUser: (input: UserInput) => Promise<User>;
  updateUser: (id: string, update: UserUpdate) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const EMPTY = { events: [] as EventItem[], invitees: [] as Invitee[], emailLogs: [] as EmailLog[], users: [] as User[] };

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isManager } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      setData(EMPTY);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      if (isManager) {
        const [ev, inv, logs, us] = await Promise.all([
          api.get<{ events: EventItem[] }>('/events'),
          api.get<{ invitees: Invitee[] }>('/invitees'),
          api.get<{ emailLogs: EmailLog[] }>('/email-logs'),
          api.get<{ users: User[] }>('/users'),
        ]);
        setData({ events: ev.events, invitees: inv.invitees, emailLogs: logs.emailLogs, users: us.users });
      } else {
        const ev = await api.get<{ events: EventItem[] }>('/events');
        setData({ ...EMPTY, events: ev.events });
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, [user, isManager]);

  // Load on login, clear on logout.
  useEffect(() => {
    reload();
  }, [reload]);

  const putEvent = useCallback((event: EventItem) => {
    setData((d) => ({ ...d, events: d.events.map((e) => (e.id === event.id ? { ...e, ...event } : e)) }));
  }, []);

  const refreshEventInvitees = useCallback(async (eventId: string) => {
    const { invitees } = await api.get<{ invitees: Invitee[] }>(`/events/${eventId}/invitees`);
    setData((d) => ({ ...d, invitees: [...invitees, ...d.invitees.filter((i) => i.eventId !== eventId)] }));
  }, []);

  // Events

  const createEvent = useCallback(async (input: EventInput & { plannerId?: string }) => {
    const { event } = await api.post<{ event: EventItem }>('/events', input);
    setData((d) => ({ ...d, events: [event, ...d.events] }));
    return event;
  }, []);

  const updateEvent = useCallback(
    async (id: string, input: Partial<EventInput>) => {
      const { event } = await api.patch<{ event: EventItem }>(`/events/${id}`, input);
      putEvent(event);
    },
    [putEvent],
  );

  const deleteEvent = useCallback(async (id: string) => {
    await api.delete(`/events/${id}`);
    setData((d) => ({
      ...d,
      events: d.events.filter((e) => e.id !== id),
      invitees: d.invitees.filter((i) => i.eventId !== id),
      emailLogs: d.emailLogs.filter((l) => l.eventId !== id),
    }));
  }, []);

  const assignScanners = useCallback(async (eventId: string, scannerIds: string[]) => {
    const { scanners } = await api.put<{ scanners: User[] }>(`/events/${eventId}/scanners`, { scannerIds });
    setData((d) => ({
      ...d,
      events: d.events.map((e) => (e.id === eventId ? { ...e, scanners: scanners.map((s) => s.id) } : e)),
    }));
    return scanners;
  }, []);

  // Guests

  const importInvitees = useCallback(
    async (eventId: string, rows: InviteeInput[], qrType: QrType) => {
      const res = await api.post<ImportResult & { event: EventItem }>(`/events/${eventId}/invitees/import`, {
        rows,
        qrType,
      });
      putEvent(res.event);
      await refreshEventInvitees(eventId);
      return { created: res.created, skipped: res.skipped };
    },
    [putEvent, refreshEventInvitees],
  );

  const addInvitee = useCallback(
    async (eventId: string, input: InviteeInput) => {
      const res = await api.post<{ invitee: Invitee; event: EventItem }>(`/events/${eventId}/invitees`, input);
      putEvent(res.event);
      setData((d) => ({ ...d, invitees: [res.invitee, ...d.invitees] }));
      return res.invitee;
    },
    [putEvent],
  );

  const updateInvitee = useCallback(async (id: string, update: InviteeUpdate) => {
    const { invitee } = await api.patch<{ invitee: Invitee }>(`/invitees/${id}`, update);
    setData((d) => ({ ...d, invitees: d.invitees.map((i) => (i.id === id ? invitee : i)) }));
  }, []);

  const deleteInvitees = useCallback(async (ids: string[]) => {
    const { deleted } = await api.post<{ deleted: number }>('/invitees/bulk-delete', { ids });
    const remove = new Set(ids);
    setData((d) => ({ ...d, invitees: d.invitees.filter((i) => !remove.has(i.id)) }));
    return deleted;
  }, []);

  const regenerateQrCodes = useCallback(
    async (eventId: string, qrType: QrType) => {
      const res = await api.post<{ updated: number; event: EventItem }>(`/events/${eventId}/qr/regenerate`, {
        qrType,
      });
      putEvent(res.event);
      await refreshEventInvitees(eventId);
      return res.updated;
    },
    [putEvent, refreshEventInvitees],
  );

  const sendEmails = useCallback(
    async (eventId: string, input: SendEmailInput) => {
      const res = await api.post<SendEmailResult & { log: EmailLog }>(`/events/${eventId}/emails`, input);
      setData((d) => ({ ...d, emailLogs: [res.log, ...d.emailLogs] }));
      await refreshEventInvitees(eventId);
      return { sent: res.sent, failed: res.failed };
    },
    [refreshEventInvitees],
  );

  // Accounts

  const createUser = useCallback(async (input: UserInput) => {
    const { user } = await api.post<{ user: User }>('/users', input);
    setData((d) => ({ ...d, users: [user, ...d.users] }));
    return user;
  }, []);

  const updateUser = useCallback(async (id: string, update: UserUpdate) => {
    const { user } = await api.patch<{ user: User }>(`/users/${id}`, update);
    // Keep the expanded "created by" from the list response.
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === id ? { ...user, createdBy: u.createdBy } : u)),
    }));
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    await api.delete(`/users/${id}`);
    setData((d) => ({
      ...d,
      users: d.users.filter((u) => u.id !== id),
      events: d.events.map((e) => ({ ...e, scanners: e.scanners.filter((s) => s !== id) })),
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      loading,
      loadError,
      reload,
      createEvent,
      updateEvent,
      deleteEvent,
      assignScanners,
      importInvitees,
      addInvitee,
      updateInvitee,
      deleteInvitees,
      regenerateQrCodes,
      sendEmails,
      refreshEventInvitees,
      createUser,
      updateUser,
      deleteUser,
    }),
    [
      data,
      loading,
      loadError,
      reload,
      createEvent,
      updateEvent,
      deleteEvent,
      assignScanners,
      importInvitees,
      addInvitee,
      updateInvitee,
      deleteInvitees,
      regenerateQrCodes,
      sendEmails,
      refreshEventInvitees,
      createUser,
      updateUser,
      deleteUser,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
};
