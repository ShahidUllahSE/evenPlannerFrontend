import {
  CalendarDays,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  ScanLine,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Avatar from '@/components/common/Avatar';
import { ROLE_LABELS } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';

const Aside = styled.aside<{ $open: boolean }>`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  width: ${({ theme }) => theme.layout.sidebarWidth};
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.sidebar};
  color: ${({ theme }) => theme.colors.sidebarText};
  transition: transform 0.2s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
    box-shadow: ${({ $open, theme }) => ($open ? theme.shadows.lg : 'none')};
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const Nav = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
`;

const SectionLabel = styled.div`
  padding: 0 12px;
  margin: 0 0 8px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #62708a;

  &:not(:first-child) {
    margin-top: ${({ theme }) => theme.spacing.lg};
  }
`;

const itemStyles = `
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  padding: 0 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: background .15s ease, color .15s ease;

  svg { width: 18px; height: 18px; flex-shrink: 0; }
`;

const Item = styled(NavLink)`
  ${itemStyles}
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.sidebarHover};
    color: #fff;
  }

  &.active {
    background: ${({ theme }) => theme.colors.sidebarActive};
    color: #fff;

    &::before {
      content: '';
      position: absolute;
      left: -16px;
      top: 8px;
      bottom: 8px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: ${({ theme }) => theme.colors.accent};
    }

    svg {
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: ${({ theme }) => theme.spacing.md};
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const UserText = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    color: #fff;
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: 600;
  }

  span {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const LogoutButton = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.sidebarText};

  &:hover {
    background: rgba(220, 38, 38, 0.15);
    color: #f87171;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MANAGER_MENU = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.EVENTS, label: 'Events', icon: CalendarDays },
  { to: ROUTES.USERS, label: 'All Guests', icon: Users },
  { to: ROUTES.COMPOSE, label: 'Send Email', icon: Mail },
  { to: ROUTES.COMPOSE_SMS, label: 'Send SMS', icon: MessageSquare },
];

const EVENT_DAY_MENU = [
  { to: ROUTES.SCAN, label: 'QR Scanner', icon: ScanLine },
  { to: ROUTES.SCAN_HISTORY, label: 'Scan History', icon: History },
];

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

const Sidebar = ({ open, onNavigate }: SidebarProps) => {
  const { user, isManager, logout } = useAuth();

  return (
    <Aside $open={open}>
      <Brand>
        <Logo light />
      </Brand>
      <Nav>
        {isManager && (
          <>
            <SectionLabel>Main Menu</SectionLabel>
            {MANAGER_MENU.map(({ to, label, icon: Icon }) => (
              <Item key={to} to={to} onClick={onNavigate}>
                <Icon />
                {label}
              </Item>
            ))}
          </>
        )}
        <SectionLabel>Event Day</SectionLabel>
        {EVENT_DAY_MENU.map(({ to, label, icon: Icon }) => (
          <Item key={to} to={to} onClick={onNavigate}>
            <Icon />
            {label}
          </Item>
        ))}
        {isManager && (
          <>
            <SectionLabel>Administration</SectionLabel>
            <Item to={ROUTES.TEAM} onClick={onNavigate}>
              <ShieldCheck />
              {user?.role === 'admin' ? 'Accounts' : 'My Scanners'}
            </Item>
            {user?.role === 'admin' && (
              <>
                <Item to={ROUTES.EMAIL_SETTINGS} onClick={onNavigate}>
                  <Settings />
                  Email Settings
                </Item>
                <Item to={ROUTES.TWILIO_SETTINGS} onClick={onNavigate}>
                  <Phone />
                  Twilio Settings
                </Item>
              </>
            )}
          </>
        )}
      </Nav>
      {user && (
        <UserBox>
          <Avatar name={user.name} size={36} />
          <UserText>
            <strong>{user.name}</strong>
            <span>{ROLE_LABELS[user.role]}</span>
          </UserText>
          <LogoutButton onClick={logout} aria-label="Log out" title="Log out">
            <LogOut />
          </LogoutButton>
        </UserBox>
      )}
    </Aside>
  );
};

export default Sidebar;
