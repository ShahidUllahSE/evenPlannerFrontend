import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
`;

const IconCircle = styled.div`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  svg {
    width: 26px;
    height: 26px;
  }
`;

const Title = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const Description = styled.p`
  max-width: 380px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ActionWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <Wrapper>
    <IconCircle>{icon ?? <Inbox />}</IconCircle>
    <Title>{title}</Title>
    {description && <Description>{description}</Description>}
    {action && <ActionWrap>{action}</ActionWrap>}
  </Wrapper>
);

export default EmptyState;
