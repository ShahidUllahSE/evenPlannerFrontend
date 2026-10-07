import { useMemo, useState } from 'react';
import { Pencil, Plus, Power, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable, { type Column } from '@/components/common/DataTable';
import { SearchInput, Select } from '@/components/common/Form';
import PageHeader from '@/components/common/PageHeader';
import { RoleBadge } from '@/components/common/StatusBadges';
import {
  Actions,
  IconAction,
  Muted,
  PersonCell,
  Stack,
  TableToolbar,
  ToolbarSpacer,
} from '@/components/common/TableParts';
import UserFormModal from '@/components/users/UserFormModal';
import { ROLE_LABELS } from '@/constants/auth';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api';
import type { Role, User } from '@/types/user';
import { formatDateTime } from '@/utils/format';

const creatorName = (u: User) => (u.createdBy && typeof u.createdBy === 'object' ? u.createdBy.name : null);

const Team = () => {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';
  useDocumentTitle(isAdmin ? 'Accounts' : 'My Scanners');
  const { users, events, loading, updateUser, deleteUser } = useData();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [form, setForm] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleting, setDeleting] = useState<User | null>(null);

  const eventsByScanner = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const e of events) for (const id of e.scanners) map.set(id, [...(map.get(id) ?? []), e.title]);
    return map;
  }, [events]);

  const ownedEvents = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) if (e.createdBy) map.set(e.createdBy.id, (map.get(e.createdBy.id) ?? 0) + 1);
    return map;
  }, [events]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => !role || u.role === role)
      .filter((u) => !q || [u.name, u.email, u.phone].some((f) => f.toLowerCase().includes(q)));
  }, [users, search, role]);

  const toggleActive = async (u: User) => {
    try {
      await updateUser(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? `${u.name} can no longer sign in` : `${u.name} can sign in again`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const columns: Column<User>[] = [
    { key: 'name', header: 'Name', sortValue: (u) => u.name, render: (u) => <PersonCell name={u.name} email={u.email} /> },
    { key: 'role', header: 'Role', sortValue: (u) => u.role, render: (u) => <RoleBadge role={u.role} /> },
    {
      key: 'events',
      header: 'Events',
      render: (u) => {
        if (u.role === 'planner') return <Muted>{ownedEvents.get(u.id) ?? 0} owned</Muted>;
        if (u.role !== 'scanner') return <Muted>All</Muted>;
        const titles = eventsByScanner.get(u.id) ?? [];
        return titles.length ? (
          <Stack title={titles.join(', ')}>
            <strong>
              {titles.length} assigned
            </strong>
            <span>{titles.slice(0, 2).join(', ')}{titles.length > 2 ? '…' : ''}</span>
          </Stack>
        ) : (
          <Muted>Not assigned</Muted>
        );
      },
    },
    { key: 'phone', header: 'Phone', render: (u) => u.phone || <Muted>—</Muted> },
    ...(isAdmin
      ? [{ key: 'creator', header: 'Created by', render: (u: User) => <Muted>{creatorName(u) ?? '—'}</Muted> }]
      : []),
    {
      key: 'status',
      header: 'Status',
      sortValue: (u) => (u.isActive ? 1 : 0),
      render: (u) => (u.isActive ? <Badge tone="success" dot>Active</Badge> : <Badge tone="danger" dot>Deactivated</Badge>),
    },
    {
      key: 'login',
      header: 'Last sign-in',
      sortValue: (u) => u.lastLoginAt ?? '',
      render: (u) => <Muted>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}</Muted>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      stickyRight: true,
      render: (u) =>
        u.id === me?.id ? (
          <Muted>You</Muted>
        ) : (
          <Actions onClick={(e) => e.stopPropagation()}>
            <IconAction onClick={() => setForm({ open: true, user: u })} title="Edit" aria-label="Edit account">
              <Pencil />
            </IconAction>
            <IconAction
              onClick={() => toggleActive(u)}
              title={u.isActive ? 'Deactivate' : 'Reactivate'}
              aria-label={u.isActive ? 'Deactivate account' : 'Reactivate account'}
            >
              <Power />
            </IconAction>
            <IconAction $danger onClick={() => setDeleting(u)} title="Delete" aria-label="Delete account">
              <Trash2 />
            </IconAction>
          </Actions>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Accounts' : 'My Scanners'}
        subtitle={
          isAdmin
            ? 'Everyone who can sign in: admins, event planners and door scanners.'
            : 'Door staff accounts you created. Assign them to events from the event page.'
        }
        actions={
          <Button onClick={() => setForm({ open: true, user: null })}>
            <Plus /> {isAdmin ? 'New Account' : 'New Scanner'}
          </Button>
        }
      />

      <Card $padded={false}>
        <TableToolbar>
          <SearchInput placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <ToolbarSpacer />
          {isAdmin && (
            <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
              <option value="">All roles</option>
              {(['admin', 'planner', 'scanner'] as Role[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          )}
        </TableToolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(u) => u.id}
          onRowClick={(u) => u.id !== me?.id && setForm({ open: true, user: u })}
          minWidth="960px"
          pageSize={25}
          empty={
            users.length === 0 && !loading
              ? {
                  icon: <ShieldCheck />,
                  title: isAdmin ? 'No accounts yet' : 'No scanner accounts yet',
                  description: isAdmin
                    ? 'Create planner accounts for your event organisers and scanner accounts for door staff.'
                    : 'Create an account for each person who will scan tickets at the door.',
                  action: (
                    <Button onClick={() => setForm({ open: true, user: null })}>
                      <Plus /> {isAdmin ? 'New Account' : 'New Scanner'}
                    </Button>
                  ),
                }
              : undefined
          }
        />
      </Card>

      <UserFormModal open={form.open} user={form.user} onClose={() => setForm({ open: false, user: null })} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete account?"
        message={
          <>
            <strong>{deleting?.name}</strong> will no longer be able to sign in
            {deleting?.role === 'scanner' && ' and will be removed from every event'}. Past scans stay in the history.
            To only block sign-in, deactivate the account instead.
          </>
        }
        confirmLabel="Delete account"
        onConfirm={() => {
          if (!deleting) return;
          deleteUser(deleting.id)
            .then(() => toast.success('Account deleted'))
            .catch((err) => toast.error(errorMessage(err)));
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  );
};

export default Team;
