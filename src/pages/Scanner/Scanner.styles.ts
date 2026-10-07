import styled, { css, keyframes } from 'styled-components';

export type Verdict = 'ok' | 'warn' | 'bad';

const pop = keyframes`from { transform: scale(.96); opacity: 0; } to { transform: none; opacity: 1; }`;
const sweep = keyframes`0% { top: 8%; } 50% { top: 88%; } 100% { top: 8%; }`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: start;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  min-width: 0;
`;

export const Viewport = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: #0b1320;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    aspect-ratio: 3 / 4;
  }
`;

export const Frame = styled.div`
  position: absolute;
  inset: 14% 18%;
  border-radius: 18px;
  box-shadow: 0 0 0 9999px rgba(11, 19, 32, 0.45);
  border: 3px solid rgba(255, 255, 255, 0.85);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    left: 6%;
    right: 6%;
    height: 2px;
    background: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 12px ${({ theme }) => theme.colors.accent};
    animation: ${sweep} 2.4s ease-in-out infinite;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    inset: 22% 10%;
  }
`;

export const CameraOff = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: #cbd5e1;

  > svg {
    width: 44px;
    height: 44px;
    color: ${({ theme }) => theme.colors.accent};
  }

  p {
    max-width: 380px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const verdictColors = {
  ok: ['#15803D', '#E7F6EC'],
  warn: ['#B45309', '#FEF3E2'],
  bad: ['#DC2626', '#FDECEC'],
} as const;

export const ResultPanel = styled.div<{ $verdict: Verdict }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
  animation: ${pop} 0.18s ease;
  ${({ $verdict }) => css`
    background: ${verdictColors[$verdict][1]};
    border: 2px solid ${verdictColors[$verdict][0]};
    color: ${verdictColors[$verdict][0]};
  `}

  > svg {
    width: 64px;
    height: 64px;
  }

  h2 {
    font-size: 1.75rem;
    line-height: 1.2;
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }

  small {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

export const Waiting = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    width: 40px;
    height: 40px;
    color: ${({ theme }) => theme.colors.primary};
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

export const ManualForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  input {
    font-family: ${({ theme }) => theme.fonts.mono};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
`;

export const Counters = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};

  div {
    padding: 12px;
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: center;
  }

  strong {
    display: block;
    font-size: 1.5rem;
    line-height: 1.2;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
`;

export const RecentList = styled.ul`
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => `10px ${theme.spacing.lg}`};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
      border-bottom: none;
    }
  }
`;
