import styled from 'styled-components';

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }

  strong {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

export const Hint = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  code {
    font-family: ${({ theme }) => theme.fonts.mono ?? 'ui-monospace, monospace'};
    font-size: 0.9em;
  }
`;
