import type { ReactNode } from 'react';
import styled, { type DefaultTheme } from 'styled-components';

type Tone = 'primary' | 'accent' | 'info' | 'success';

const toneColors = (theme: DefaultTheme, tone: Tone) =>
  ({
    primary: [theme.colors.primarySoft, theme.colors.primary],
    accent: [theme.colors.accentSoft, '#A8842B'],
    info: [theme.colors.infoSoft, theme.colors.info],
    success: [theme.colors.successSoft, theme.colors.success],
  })[tone];

const Wrapper = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme, $compact }) => ($compact ? theme.spacing.sm : theme.spacing.md)};
  padding: ${({ theme, $compact }) => ($compact ? '12px 14px' : theme.spacing.lg)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;
`;

const Label = styled.div<{ $compact?: boolean }>`
  font-size: ${({ theme, $compact }) => ($compact ? theme.fontSizes.xs : theme.fontSizes.sm)};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Value = styled.div<{ $compact?: boolean }>`
  margin-top: ${({ $compact }) => ($compact ? '2px' : '6px')};
  font-size: ${({ theme, $compact }) => ($compact ? '1.25rem' : theme.fontSizes.xxl)};
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: ${({ theme }) => theme.colors.text};
`;

const Hint = styled.div<{ $compact?: boolean }>`
  margin-top: ${({ $compact }) => ($compact ? '2px' : '4px')};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  ${({ $compact }) => $compact && 'line-height: 1.3;'}
`;

const IconBox = styled.div<{ $tone: Tone; $compact?: boolean }>`
  display: grid;
  place-items: center;
  width: ${({ $compact }) => ($compact ? '34px' : '44px')};
  height: ${({ $compact }) => ($compact ? '34px' : '44px')};
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $tone }) => toneColors(theme, $tone)[0]};
  color: ${({ theme, $tone }) => toneColors(theme, $tone)[1]};

  svg {
    width: ${({ $compact }) => ($compact ? '16px' : '22px')};
    height: ${({ $compact }) => ($compact ? '16px' : '22px')};
  }
`;

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: Tone;
  compact?: boolean;
}

const StatCard = ({ label, value, hint, icon, tone = 'primary', compact = false }: StatCardProps) => (
  <Wrapper $compact={compact}>
    <div>
      <Label $compact={compact}>{label}</Label>
      <Value $compact={compact}>{value}</Value>
      {hint && <Hint $compact={compact}>{hint}</Hint>}
    </div>
    <IconBox $tone={tone} $compact={compact}>
      {icon}
    </IconBox>
  </Wrapper>
);

export default StatCard;
