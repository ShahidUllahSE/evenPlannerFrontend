import type { ReactNode } from 'react';
import styled from 'styled-components';

export const Card = styled.section<{ $padded?: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme, $padded = true }) => ($padded ? theme.spacing.lg : 0)};
  min-width: 0;
`;

const HeaderRow = styled.div<{ $bordered: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  ${({ $bordered, theme }) => $bordered && `border-bottom: 1px solid ${theme.colors.border};`}

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    margin-top: 2px;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  bordered?: boolean;
}

export const CardHeader = ({ title, subtitle, actions, bordered = true }: CardHeaderProps) => (
  <HeaderRow $bordered={bordered}>
    <div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <Actions>{actions}</Actions>}
  </HeaderRow>
);
