import styled from 'styled-components';

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const InfoTile = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  min-width: 0;

  > svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.primary};
  }

  > div {
    flex: 1;
    min-width: 0;
  }

  small {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  strong {
    display: block;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const StatsGrid = styled(InfoGrid)``;

export const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
