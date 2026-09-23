import type { ReactNode } from 'react';
import styled, { type DefaultTheme } from 'styled-components';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'accent';

const toneColors = (theme: DefaultTheme, tone: BadgeTone) => {
  const c = theme.colors;
  switch (tone) {
    case 'success':
      return [c.successSoft, c.success];
    case 'warning':
      return [c.warningSoft, c.warning];
    case 'danger':
      return [c.dangerSoft, c.danger];
    case 'info':
      return [c.infoSoft, c.info];
    case 'primary':
      return [c.primarySoft, c.primaryHover];
    case 'accent':
      return [c.accentSoft, '#8A6516'];
    default:
      return [c.neutralSoft, c.neutral];
  }
};

const StyledBadge = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  white-space: nowrap;
  background: ${({ theme, $tone }) => toneColors(theme, $tone)[0]};
  color: ${({ theme, $tone }) => toneColors(theme, $tone)[1]};
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}

const Badge = ({ tone = 'neutral', dot = false, children }: BadgeProps) => (
  <StyledBadge $tone={tone}>
    {dot && <Dot />}
    {children}
  </StyledBadge>
);

export default Badge;
