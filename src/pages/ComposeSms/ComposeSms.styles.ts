import styled from 'styled-components';

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  > div:first-child {
    margin-bottom: 0;

    h1 {
      font-size: 1.25rem;
    }

    p {
      font-size: ${({ theme }) => theme.fontSizes.sm};
    }
  }
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  gap: 12px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const MainCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;

  select,
  textarea {
    height: 36px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  textarea {
    height: auto;
    min-height: 110px;
  }

  label span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;

export const SideCard = styled(MainCard)`
  position: sticky;
  top: calc(${({ theme }) => theme.layout.topbarHeight} + 12px);
  gap: 12px;

  @media (max-width: 960px) {
    position: static;
  }
`;

export const SectionLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 8px;
`;

export const MetaLine = styled.p`
  margin-top: 8px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.4;

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

export const PlaceholderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;

  button {
    padding: 3px 7px;
    border-radius: ${({ theme }) => theme.radii.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.625rem;
    color: ${({ theme }) => theme.colors.textMuted};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const PreviewBubble = styled.div`
  padding: 12px 14px;
  border-radius: 14px 14px 4px 14px;
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 72px;
`;

export const PreviewLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  span {
    display: block;
    margin-top: 2px;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: 4px 0;
`;

export const Toggle = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    margin-top: 1px;
    accent-color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.35;
  }
`;

export const PreviewQr = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};

  small {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.6875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`;
