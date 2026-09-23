import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};

  h1 {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: 700;
    letter-spacing: -0.01em;
  }
`;

const Subtitle = styled.p`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}

const PageHeader = ({ title, subtitle, badge, actions, back }: PageHeaderProps) => (
  <Wrapper>
    <div>
      {back && (
        <Back to={back.to}>
          <ChevronLeft />
          {back.label}
        </Back>
      )}
      <TitleRow>
        <h1>{title}</h1>
        {badge}
      </TitleRow>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </div>
    {actions && <Actions>{actions}</Actions>}
  </Wrapper>
);

export default PageHeader;
