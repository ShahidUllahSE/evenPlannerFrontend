import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import { Field, Input } from '@/components/common/Form';
import Modal from '@/components/common/Modal';
import { MIN_PASSWORD_LENGTH } from '@/constants/auth';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/services/api';

const ChangePasswordForm = ({ onClose }: { onClose: () => void }) => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < MIN_PASSWORD_LENGTH) return setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (next !== confirm) return setError('The new passwords do not match.');
    setError('');
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success('Password updated');
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      locked={saving}
      size="sm"
      title="Change Password"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="password-form" loading={saving}>
            Update password
          </Button>
        </>
      }
    >
      <form id="password-form" onSubmit={submit} noValidate style={{ display: 'grid', gap: 16 }}>
        <Field label="Current password" required>
          <Input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="New password" required hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
          <Input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Confirm new password" required error={error || undefined}>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
};

const ChangePasswordModal = ({ open, onClose }: { open: boolean; onClose: () => void }) =>
  open ? <ChangePasswordForm onClose={onClose} /> : null;

export default ChangePasswordModal;
