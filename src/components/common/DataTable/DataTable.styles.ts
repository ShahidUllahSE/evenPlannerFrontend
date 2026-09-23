import styled, { css } from 'styled-components';

export const Scroll = styled.div`
  width: 100%;
  overflow-x: auto;
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
  box-shadow: -8px 0 12px -10px rgba(15, 27, 45, 0.25);
`;

export const Th = styled.th<{ $align?: string; $stickyRight?: boolean }>`
  height: 44px;
  padding: 0 16px;
  text-align: ${({ $align = 'left' }) => $align};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  ${({ $stickyRight }) => $stickyRight && stickyRight}
`;

export const Td = styled.td<{ $align?: string; $stickyRight?: boolean }>`
  height: 60px;
  padding: 10px 16px;
  text-align: ${({ $align = 'left' }) => $align};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: inherit;
  white-space: nowrap;
  vertical-align: middle;
  ${({ $stickyRight }) => $stickyRight && stickyRight}
`;

export const Tr = styled.tr<{ $clickable: boolean; $selected: boolean }>`
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.surface)};
  transition: background 0.12s ease;
  ${({ $clickable }) => $clickable && 'cursor: pointer;'}

  &:hover {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.surfaceAlt)};
  }
`;

export const HeaderButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : 'inherit')};

  svg {
    width: 13px;
    height: 13px;
    opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  }
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
`;

export const PageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

export const PageSizeSelect = styled.select`
  margin-left: 12px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
`;

export const PageControls = styled.div`
  display: flex;
  gap: 4px;
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
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
    width: 16px;
    height: 16px;
  }
`;
