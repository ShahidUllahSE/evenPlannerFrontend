import styled, { css } from 'styled-components';

export const Scroll = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.colors.borderStrong} transparent`};

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderStrong};
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const Table = styled.table<{ $minWidth: string }>`
  width: 100%;
  min-width: ${({ $minWidth }) => $minWidth};
  border-collapse: separate;
  border-spacing: 0;
`;

const stickyRight = css`
  position: sticky;
  right: 0;
  z-index: 2;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: inset 1px 0 0 ${({ theme }) => theme.colors.border};
`;

export const Th = styled.th<{ $align?: string; $stickyRight?: boolean; $wrap?: boolean }>`
  height: 36px;
  padding: 0 10px;
  text-align: ${({ $align = 'left' }) => $align};
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: ${({ $wrap }) => ($wrap ? 'normal' : 'nowrap')};
  vertical-align: middle;
  ${({ $stickyRight }) => $stickyRight && stickyRight}
  ${({ $stickyRight }) => $stickyRight && 'z-index: 3;'}
`;

export const Td = styled.td<{ $align?: string; $stickyRight?: boolean; $wrap?: boolean }>`
  height: 44px;
  padding: 6px 10px;
  text-align: ${({ $align = 'left' }) => $align};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  white-space: ${({ $wrap }) => ($wrap ? 'normal' : 'nowrap')};
  vertical-align: middle;
  max-width: ${({ $wrap }) => ($wrap ? '220px' : 'none')};
  line-height: 1.35;
  ${({ $stickyRight }) => $stickyRight && stickyRight}
`;

export const Tr = styled.tr<{ $clickable: boolean; $selected: boolean }>`
  transition: background 0.12s ease;
  ${({ $clickable }) => $clickable && 'cursor: pointer;'}

  ${({ theme, $selected }) =>
    $selected &&
    css`
      ${Td} {
        background: ${theme.colors.primarySoft};
      }
    `}

  &:hover ${Td} {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.surfaceAlt)};
  }

  &:last-child ${Td} {
    border-bottom: none;
  }
`;

export const HeaderButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : 'inherit')};

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    opacity: ${({ $active }) => ($active ? 1 : 0.45)};
  }
`;

export const Checkbox = styled.input`
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 10px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const PageInfo = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: space-between;
  }
`;

export const PageSizeSelect = styled.select`
  margin-left: 8px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: auto;
  }
`;

export const PageControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 3px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
  }
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.text)};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;
