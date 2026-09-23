import styled from 'styled-components';

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  min-width: 0;
`;

export const SendPanel = styled(Stack)`
  position: sticky;
  top: calc(${({ theme }) => theme.layout.topbarHeight} + ${({ theme }) => theme.spacing.lg});

  @media (max-width: 1200px) {
    position: static;
  }
`;

export const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const CountPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryHover};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const Toggle = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }

  strong {
    display: block;
    font-weight: 600;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const PreviewMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  div {
    display: flex;
    gap: 10px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    width: 56px;
    flex-shrink: 0;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.textMuted};
    padding-top: 1px;
  }

  strong {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const PreviewFrame = styled.iframe`
  display: block;
  width: 100%;
  height: 640px;
  border: none;
  border-radius: ${({ theme }) => `0 0 ${theme.radii.md} ${theme.radii.md}`};
  background: ${({ theme }) => theme.colors.background};
`;

export const ProgressBar = styled.div<{ $pct: number }>`
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.neutralSoft};
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 999px;
    transition: width 0.1s linear;
  }
`;
