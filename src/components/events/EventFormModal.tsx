import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import { Field, FormGrid, FullRow, Input, Select, Textarea } from '@/components/common/Form';
import Modal from '@/components/common/Modal';
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/constants/options';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { errorMessage } from '@/services/api';
import type { EventInput, EventItem } from '@/types/event';

const EMPTY: EventInput = {
  title: '',
  category: 'Conference',
  description: '',
  address: '',
  date: '',
  startTime: '09:00',
  endTime: '17:00',
  capacity: 100,
  organizer: '',
  status: 'upcoming',
};

type Errors = Partial<Record<keyof EventInput, string>>;

const validate = (v: EventInput): Errors => {
  const e: Errors = {};
  if (v.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
  if (v.address.trim().length < 2) e.address = 'Address is required';
  if (!v.date) e.date = 'Date is required';
  if (!v.organizer.trim()) e.organizer = 'Organizer is required';
  if (!v.capacity || v.capacity < 1) e.capacity = 'Capacity must be at least 1';
  if (v.endTime <= v.startTime) e.endTime = 'End time must be after start time';
  return e;
};

interface EventFormModalProps {
  open: boolean;
  event?: EventItem | null;
  onClose: () => void;
  onCreated?: (event: EventItem) => void;
}

const EventFormFields = ({ event, onClose, onCreated }: Omit<EventFormModalProps, 'open'>) => {
  const { user } = useAuth();
  const { users, createEvent, updateEvent } = useData();
  const planners = users.filter((u) => u.role === 'planner' && u.isActive);
  const [plannerId, setPlannerId] = useState('');
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<EventInput>(() => {
    if (!event) return EMPTY;
    const { title, category, description, address, date, startTime, endTime, capacity, organizer, status } = event;
    return { title, category, description, address, date, startTime, endTime, capacity, organizer, status };
  });
  const [errors, setErrors] = useState<Errors>({});
  const isEdit = !!event;

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    const clean = { ...values, title: values.title.trim(), address: values.address.trim() };
    setSaving(true);
    try {
      if (isEdit) {
        await updateEvent(event.id, clean);
        toast.success('Event updated');
        onClose();
      } else {
        const created = await createEvent({ ...clean, plannerId: plannerId || undefined });
        toast.success('Event created');
        onClose();
        onCreated?.(created);
      }
    } catch (err) {
      toast.error(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      locked={saving}
      size="lg"
      title={isEdit ? 'Edit Event' : 'Create New Event'}
      subtitle={isEdit ? 'Update the details of this event.' : 'Fill in the details to set up your event.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="event-form" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </>
      }
    >
      <form id="event-form" onSubmit={submit} noValidate>
        <FormGrid $columns={2}>
          <FullRow>
            <Field label="Event title" required error={errors.title}>
              <Input
                value={values.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Annual Tech Conference 2026"
                aria-invalid={!!errors.title}
                autoFocus
              />
            </Field>
          </FullRow>
          {!isEdit && user?.role === 'admin' && (
            <FullRow>
              <Field label="Event planner" hint="The planner who will own and manage this event.">
                <Select value={plannerId} onChange={(e) => setPlannerId(e.target.value)}>
                  <option value="">Me ({user.name})</option>
                  {planners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.email}
                    </option>
                  ))}
                </Select>
              </Field>
            </FullRow>
          )}
          <Field label="Category" required>
            <Select
              value={values.category}
              onChange={(e) => set('category', e.target.value as EventInput['category'])}
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status" required>
            <Select
              value={values.status}
              onChange={(e) => set('status', e.target.value as EventInput['status'])}
            >
              {EVENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <FullRow>
            <Field label="Address" required error={errors.address}>
              <Input
                value={values.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="e.g. Expo Centre, Avenue 1, Lahore"
                aria-invalid={!!errors.address}
              />
            </Field>
          </FullRow>
        </FormGrid>
        <FormGrid $columns={3} style={{ marginTop: 16 }}>
          <Field label="Date" required error={errors.date}>
            <Input
              type="date"
              value={values.date}
              onChange={(e) => set('date', e.target.value)}
              aria-invalid={!!errors.date}
            />
          </Field>
          <Field label="Start time" required>
            <Input type="time" value={values.startTime} onChange={(e) => set('startTime', e.target.value)} />
          </Field>
          <Field label="End time" required error={errors.endTime}>
            <Input
              type="time"
              value={values.endTime}
              onChange={(e) => set('endTime', e.target.value)}
              aria-invalid={!!errors.endTime}
            />
          </Field>
        </FormGrid>
        <FormGrid $columns={2} style={{ marginTop: 16 }}>
          <Field label="Capacity" required error={errors.capacity}>
            <Input
              type="number"
              min={1}
              value={values.capacity}
              onChange={(e) => set('capacity', Number(e.target.value))}
              aria-invalid={!!errors.capacity}
            />
          </Field>
          <Field label="Organizer" required error={errors.organizer}>
            <Input
              value={values.organizer}
              onChange={(e) => set('organizer', e.target.value)}
              placeholder="e.g. TechVision Events"
              aria-invalid={!!errors.organizer}
            />
          </Field>
          <FullRow>
            <Field label="Description" hint="Shown internally and can be used in emails.">
              <Textarea
                value={values.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What is this event about?"
              />
            </Field>
          </FullRow>
        </FormGrid>
      </form>
    </Modal>
  );
};

// Mounting the fields only while open resets the form state on every open.
const EventFormModal = ({ open, ...props }: EventFormModalProps) =>
  open ? <EventFormFields {...props} /> : null;

export default EventFormModal;
