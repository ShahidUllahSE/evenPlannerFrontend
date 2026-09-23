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

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Value = styled.div`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
`;

const Hint = styled.div`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const IconBox = styled.div<{ $tone: Tone }>`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $tone }) => toneColors(theme, $tone)[0]};
  color: ${({ theme, $tone }) => toneColors(theme, $tone)[1]};

  svg {
    width: 22px;
    height: 22px;
  }
`;

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: Tone;
}

const StatCard = ({ label, value, hint, icon, tone = 'primary' }: StatCardProps) => (
  <Wrapper>
    <div>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {hint && <Hint>{hint}</Hint>}
    </div>
    <IconBox $tone={tone}>{icon}</IconBox>
  </Wrapper>
);

export default StatCard;
