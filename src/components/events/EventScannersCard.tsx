import { useEffect, useMemo, useState } from 'react';
import { ScanLine, Settings2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { PersonCell } from '@/components/common/TableParts';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { api, errorMessage } from '@/services/api';
import type { EventItem } from '@/types/event';
import type { User } from '@/types/user';

const List = styled.ul`
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => `12px ${theme.spacing.lg}`};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
      border-bottom: none;
    }
  }
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;

  & + & {
    margin-top: 8px;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  > div {
    flex: 1;
    min-width: 0;
  }

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

type Scanner = Pick<User, 'id' | 'name' | 'email' | 'isActive'>;

const EventScannersCard = ({ event }: { event: EventItem }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, assignScanners } = useData();
  const [assigned, setAssigned] = useState<Scanner[]>([]);
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetched separately: a planner's own list doesn't include scanners an admin assigned.
  const assignedKey = event.scanners.join(',');
  useEffect(() => {
    let active = true;
    api
      .get<{ scanners: Scanner[] }>(`/events/${event.id}/scanners`)
      .then((res) => active && setAssigned(res.scanners))
      .catch(() => active && setAssigned([]));
    return () => {
      active = false;
    };
  }, [event.id, assignedKey]);

  const options = useMemo(() => {
    const byId = new Map<string, Scanner>(users.filter((u) => u.role === 'scanner').map((u) => [u.id, u]));
    for (const s of assigned) if (!byId.has(s.id)) byId.set(s.id, s);
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [users, assigned]);

  const openEditor = () => {
    setPicked(assigned.map((s) => s.id));
    setEditing(true);
  };

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = async () => {
    setSaving(true);
    try {
      const scanners = await assignScanners(event.id, picked);
      setAssigned(scanners);
      toast.success(`${scanners.length} scanner${scanners.length === 1 ? '' : 's'} assigned`);
      setEditing(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card $padded={false}>
      <CardHeader
        title="Door Scanners"
        subtitle="Accounts allowed to check guests in at this event"
        actions={
          <Button variant="secondary" size="sm" onClick={openEditor}>
            <Settings2 /> Manage
          </Button>
        }
      />
      {assigned.length === 0 ? (
        <EmptyState
          icon={<ScanLine />}
          title="No scanners assigned"
          description="Assign scanner accounts so your door staff can check guests in with their phones."
          action={
            <Button size="sm" onClick={openEditor}>
              Assign scanners
            </Button>
          }
        />
      ) : (
        <List>
          {assigned.map((s) => (
            <li key={s.id}>
              <PersonCell name={s.name} email={s.email} />
              {s.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Deactivated</Badge>}
            </li>
          ))}
        </List>
      )}

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        locked={saving}
        title="Assign Door Scanners"
        subtitle={
          user?.role === 'admin'
            ? 'Pick any scanner account.'
            : 'Pick from the scanner accounts you created.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => navigate(ROUTES.TEAM)} disabled={saving}>
              <UserPlus /> New scanner account
            </Button>
            <Button onClick={save} loading={saving}>
              Save ({picked.length})
            </Button>
          </>
        }
      >
        {options.length === 0 ? (
          <EmptyState
            icon={<UserPlus />}
            title="No scanner accounts yet"
            description="Create a scanner account first, then assign it here."
          />
        ) : (
          options.map((s) => (
            <Option key={s.id}>
              <input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
              <PersonCell name={s.name} email={s.email} />
              {!s.isActive && <Badge tone="danger">Deactivated</Badge>}
            </Option>
          ))
        )}
      </Modal>
    </Card>
  );
};

export default EventScannersCard;
