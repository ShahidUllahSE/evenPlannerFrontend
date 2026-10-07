import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  > div:first-child {
    margin-bottom: 0;
    gap: 8px;

    h1 {
      font-size: 1.2rem;
    }

    p {
      font-size: ${({ theme }) => theme.fontSizes.sm};
      margin-top: 2px;
    }
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const TableCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;

  > div:first-child {
    padding: 8px 12px;
    gap: 6px;
  }

  select,
  input[type='search'] {
    height: 32px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  th {
    height: 32px !important;
    padding: 0 8px !important;
    font-size: 0.625rem !important;
  }

  td {
    height: 38px !important;
    padding: 4px 8px !important;
    font-size: ${({ theme }) => theme.fontSizes.xs} !important;
  }

  /* Sticky Actions column — room for View / Edit / Delete */
  th:last-child,
  td:last-child {
    min-width: 128px;
    width: 128px;
    padding-left: 6px !important;
    padding-right: 10px !important;
  }
`;

export const GuestCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  max-width: 180px;

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 0.625rem;
    color: ${({ theme }) => theme.colors.textMuted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const EventCell = styled(Link)`
  display: block;
  max-width: 140px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

export const RowActions = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
`;

export const ActionBtn = styled.button<{ $danger?: boolean; $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 26px;
  min-width: 26px;
  padding: 0 7px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${({ theme, $danger, $primary }) =>
    $danger ? theme.colors.danger : $primary ? theme.colors.primary : theme.colors.textMuted};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.primarySoft : 'transparent')};

  &:hover {
    background: ${({ theme, $danger, $primary }) =>
      $danger ? theme.colors.dangerSoft : $primary ? theme.colors.primarySoft : theme.colors.neutralSoft};
    color: ${({ theme, $danger, $primary }) =>
      $danger ? theme.colors.danger : $primary ? theme.colors.primaryHover : theme.colors.text};
  }

  svg {
    width: 13px;
    height: 13px;
  }
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const DetailItem = styled.div`
  min-width: 0;

  dt {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: 2px;
  }

  dd {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
    word-break: break-word;
  }
`;

export const DetailTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const DetailMeta = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  h4 {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
`;

export const DetailActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
