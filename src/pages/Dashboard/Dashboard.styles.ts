import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${fadeUp} 0.35s ease both;

  > div:first-child {
    margin-bottom: 0;
  }
`;

export const Hero = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 18px 20px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background:
    radial-gradient(ellipse 80% 120% at 100% 0%, ${({ theme }) => theme.colors.primarySoft} 0%, transparent 55%),
    linear-gradient(135deg, #ffffff 0%, ${({ theme }) => theme.colors.surfaceAlt} 100%);
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(14, 124, 123, 0.06) 1px, transparent 1px);
    background-size: 18px 18px;
    mask-image: linear-gradient(90deg, transparent 0%, #000 40%, #000 100%);
    pointer-events: none;
  }

  > * {
    position: relative;
  }
`;

export const HeroCopy = styled.div`
  min-width: 0;

  small {
    display: block;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 4px;
  }

  h1 {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.2;
  }

  p {
    margin-top: 4px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    max-width: 42ch;
    line-height: 1.4;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  > * {
    position: relative;
    overflow: hidden;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;
    animation: ${fadeUp} 0.4s ease both;

    &:nth-child(1) {
      animation-delay: 0.04s;
    }
    &:nth-child(2) {
      animation-delay: 0.08s;
    }
    &:nth-child(3) {
      animation-delay: 0.12s;
    }
    &:nth-child(4) {
      animation-delay: 0.16s;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      border-radius: 0 2px 2px 0;
    }

    &:nth-child(1)::after {
      background: ${({ theme }) => theme.colors.primary};
    }
    &:nth-child(2)::after {
      background: ${({ theme }) => theme.colors.info};
    }
    &:nth-child(3)::after {
      background: ${({ theme }) => theme.colors.success};
    }
    &:nth-child(4)::after {
      background: ${({ theme }) => theme.colors.accent};
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.md};
      border-color: ${({ theme }) => theme.colors.borderStrong};
    }
  }

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  transition: box-shadow 0.18s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.surfaceAlt} 0%, transparent 100%);

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin-top: 2px;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const SideStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

export const List = styled.ul`
  list-style: none;
  max-height: 340px;
  overflow-y: auto;
`;

export const EventLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  min-width: 0;
  transition:
    background 0.14s ease,
    padding-left 0.14s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primarySoft};
    padding-left: 18px;
  }
`;

export const DateTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 48px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(160deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryHover} 100%);
  color: #fff;
  box-shadow: 0 4px 10px rgba(14, 124, 123, 0.22);

  small {
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
    opacity: 0.9;
  }

  strong {
    font-size: 1.0625rem;
    line-height: 1.05;
    margin-top: 3px;
    font-weight: 700;
  }
`;

export const EventInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    min-width: 0;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const RowEnd = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};

  > span:last-child {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ProgressRow = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    display: block;
    margin-top: 2px;
    font-size: 0.6875rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const ProgressMeta = styled.div`
  min-width: 0;
`;

export const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;
`;

export const TeamCell = styled.div<{ $tone?: 'primary' | 'info' | 'accent' }>`
  padding: 12px 8px;
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $tone = 'primary' }) =>
    ({
      primary: theme.colors.primarySoft,
      info: theme.colors.infoSoft,
      accent: theme.colors.accentSoft,
    })[$tone]};
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }

  strong {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.1;
  }

  span {
    display: block;
    margin-top: 3px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const ActivityRow = styled.li`
  display: grid;
  grid-template-columns: auto minmax(0, 1.2fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 9px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  min-width: 0;
  transition: background 0.12s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 6px 10px;

    > :nth-child(3) {
      grid-column: 2;
      grid-row: 2;
    }
  }
`;

export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.primaryHover};
  background: ${({ theme }) => theme.colors.primarySoft};
  border: 1px solid rgba(14, 124, 123, 0.12);
`;

export const ActivityMain = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 1px;
    font-size: 0.6875rem;
    font-family: ${({ theme }) => theme.fonts.mono};
    color: ${({ theme }) => theme.colors.textMuted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ActivityMeta = styled.div`
  min-width: 0;
  font-size: 0.6875rem;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ViewAll = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition:
    background 0.12s ease,
    color 0.12s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryHover};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const EmptyPad = styled.div`
  padding: 4px 0;

  > div {
    padding: 28px 16px;
    gap: 6px;
  }
`;

export const ScansList = styled(List)`
  max-height: 280px;
`;
