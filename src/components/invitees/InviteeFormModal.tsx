import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import { Field, FormGrid, Input, Select } from '@/components/common/Form';
import Modal from '@/components/common/Modal';
import { INVITEE_CATEGORIES } from '@/constants/options';
import { useData, type InviteeUpdate } from '@/context/DataContext';
import type { Invitee, InviteeInput } from '@/types/invitee';

type Values = Required<InviteeUpdate>;
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteeFormModalProps {
  open: boolean;
  eventId: string;
  invitee?: Invitee | null;
  onClose: () => void;
}

const InviteeFormFields = ({ eventId, invitee, onClose }: Omit<InviteeFormModalProps, 'open'>) => {
  const { invitees, addInvitee, updateInvitee } = useData();
  const isEdit = !!invitee;
  const [values, setValues] = useState<Values>({
    name: invitee?.name ?? '',
    email: invitee?.email ?? '',
    phone: invitee?.phone ?? '',
    company: invitee?.company ?? '',
    designation: invitee?.designation ?? '',
    city: invitee?.city ?? '',
    category: invitee?.category ?? 'Guest',
    rsvp: invitee?.rsvp ?? 'pending',
    checkIn: invitee?.checkIn ?? 'not_checked_in',
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const email = values.email.trim().toLowerCase();
    const found: Errors = {};
    if (!values.name.trim()) found.name = 'Name is required';
    if (!EMAIL_RE.test(email)) found.email = 'Enter a valid email';
    else if (
      invitees.some((i) => i.eventId === eventId && i.email === email && i.id !== invitee?.id)
    )
      found.email = 'This email is already invited to this event';
    setErrors(found);
    if (Object.keys(found).length) return;

    const data = { ...values, name: values.name.trim(), email };
    if (isEdit) {
      updateInvitee(invitee.id, data);
      toast.success('Invitee updated');
    } else {
      const { rsvp: _r, checkIn: _c, ...input } = data;
      addInvitee(eventId, input as InviteeInput);
      toast.success('Invitee added with a unique QR ticket');
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit Invitee' : 'Add Invitee'}
      subtitle={
        isEdit ? 'Update guest details and status.' : 'A unique QR ticket is generated automatically.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="invitee-form">
            {isEdit ? 'Save Changes' : 'Add Invitee'}
          </Button>
        </>
      }
    >
      <form id="invitee-form" onSubmit={submit} noValidate>
        <FormGrid $columns={2}>
          <Field label="Full name" required error={errors.name}>
            <Input
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              aria-invalid={!!errors.name}
              autoFocus
            />
          </Field>
          <Field label="Email" required error={errors.email}>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="Phone">
            <Input value={values.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="City">
            <Input value={values.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Company">
            <Input value={values.company} onChange={(e) => set('company', e.target.value)} />
          </Field>
          <Field label="Designation">
            <Input value={values.designation} onChange={(e) => set('designation', e.target.value)} />
          </Field>
          <Field label="Category">
            <Select
              value={values.category}
              onChange={(e) => set('category', e.target.value as Values['category'])}
            >
              {INVITEE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          {isEdit && (
            <Field label="RSVP">
              <Select value={values.rsvp} onChange={(e) => set('rsvp', e.target.value as Values['rsvp'])}>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </Select>
            </Field>
          )}
          {isEdit && (
            <Field label="Check-in" hint="Will be set automatically by the QR scanner later.">
              <Select
                value={values.checkIn}
                onChange={(e) => set('checkIn', e.target.value as Values['checkIn'])}
              >
                <option value="not_checked_in">Not arrived</option>
                <option value="checked_in">Checked in</option>
              </Select>
            </Field>
          )}
        </FormGrid>
      </form>
    </Modal>
  );
};

const InviteeFormModal = ({ open, ...props }: InviteeFormModalProps) =>
  open ? <InviteeFormFields {...props} /> : null;

export default InviteeFormModal;
