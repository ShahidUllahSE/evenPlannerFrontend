import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import { Field, FormGrid, FullRow, Input, Select } from '@/components/common/Form';
import Modal from '@/components/common/Modal';
import { MIN_PASSWORD_LENGTH, ROLE_LABELS } from '@/constants/auth';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { errorMessage } from '@/services/api';
import type { Role, User } from '@/types/user';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserFormModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
}

type Errors = Partial<Record<'name' | 'email' | 'password', string>>;

const UserFormFields = ({ user, onClose }: Omit<UserFormModalProps, 'open'>) => {
  const { user: me } = useAuth();
  const { createUser, updateUser } = useData();
  const isEdit = !!user;
  const isAdmin = me?.role === 'admin';
  const roles: Role[] = isAdmin ? ['planner', 'scanner', 'admin'] : ['scanner'];

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? roles[0]!);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (name.trim().length < 2) found.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(email.trim())) found.email = 'Enter a valid email';
    if ((!isEdit || password) && password.length < MIN_PASSWORD_LENGTH) {
      found.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    setErrors(found);
    if (Object.keys(found).length) return;

    const clean = { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() };
    setSaving(true);
    try {
      if (isEdit) {
        await updateUser(user.id, { ...clean, ...(password ? { password } : {}) });
        toast.success('Account updated');
      } else {
        await createUser({ ...clean, password, role });
        toast.success(`${ROLE_LABELS[role]} account created. Share the email and password with them.`);
      }
      onClose();
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
      title={isEdit ? 'Edit Account' : isAdmin ? 'New Account' : 'New Scanner Account'}
      subtitle={
        isEdit
          ? 'Leave the password empty to keep the current one.'
          : role === 'scanner'
            ? 'Scanner accounts can only check guests in at the events they are assigned to.'
            : role === 'planner'
              ? 'Planners manage their own events, guests, emails and scanners.'
              : 'Admins can see and manage everything.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Account'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} noValidate>
        <FormGrid $columns={2}>
          <Field label="Full name" required error={errors.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} autoFocus />
          </Field>
          <Field label="Email (used to sign in)" required error={errors.email}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Role" required>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={isEdit || roles.length === 1}
            >
              {(isEdit ? [role] : roles).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>
          <FullRow>
            <Field
              label={isEdit ? 'New password' : 'Password'}
              required={!isEdit}
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              error={errors.password}
            >
              <Input
                type="text"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? 'Leave empty to keep the current password' : ''}
                aria-invalid={!!errors.password}
              />
            </Field>
          </FullRow>
        </FormGrid>
      </form>
    </Modal>
  );
};

const UserFormModal = ({ open, ...props }: UserFormModalProps) => (open ? <UserFormFields {...props} /> : null);

export default UserFormModal;
