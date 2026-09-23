import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, LogOut, Menu, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Avatar from '@/components/common/Avatar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  height: ${({ theme }) => theme.layout.topbarHeight};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 0 ${({ theme }) => theme.spacing.xl};
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const MenuButton = styled.button`
  display: none;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: grid;
  }
`;

const DateChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const UserWrap = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 4px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    strong {
      display: none;
    }
  }
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 240px;
  padding: 6px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const MenuHead = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 6px;

  strong {
    display: block;
    font-weight: 600;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.text)};
  text-align: left;

  &:hover {
    background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.neutralSoft)};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuth();
  const { resetDemoData } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Bar>
      <MenuButton onClick={onMenuClick} aria-label="Open menu">
        <Menu />
      </MenuButton>
      <DateChip>
        <CalendarDays />
        {today}
      </DateChip>
      <Spacer />
      {user && (
        <UserWrap ref={ref}>
          <UserButton onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
            <Avatar name={user.name} size={30} />
            <strong>{user.name}</strong>
            <ChevronDown />
          </UserButton>
          {menuOpen && (
            <Dropdown>
              <MenuHead>
                <strong>{user.name}</strong>
                <span>{user.role}</span>
              </MenuHead>
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmReset(true);
                }}
              >
                <RotateCcw /> Reset demo data
              </MenuItem>
              <MenuItem $danger onClick={logout}>
                <LogOut /> Log out
              </MenuItem>
            </Dropdown>
          )}
        </UserWrap>
      )}
      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="All events, invitees and email history will be replaced with the original sample data."
        confirmLabel="Reset data"
        onConfirm={() => {
          resetDemoData();
          toast.success('Demo data restored');
        }}
        onClose={() => setConfirmReset(false)}
      />
    </Bar>
  );
};

export default Topbar;
