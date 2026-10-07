import styled from 'styled-components';
import Avatar from '../Avatar';

/** Filter/search row that sits between a card header and its table. */
export const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  select {
    width: auto;
    min-width: 140px;
    max-width: 100%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    align-items: stretch;

    /* Search grows full-width; filters share the next row */
    > div:first-child {
      flex: 1 1 100%;
      max-width: none;
    }

    select {
      flex: 1 1 calc(50% - ${({ theme }) => theme.spacing.sm});
      min-width: 0;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    select {
      flex: 1 1 100%;
    }
  }
`;

export const ToolbarSpacer = styled.div`
  flex: 1 1 auto;
  min-width: 8px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const SelectionBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.primarySoft};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryHover};
`;

export const Mono = styled.span`
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.02em;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.neutralSoft};
  color: ${({ theme }) => theme.colors.text};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

/** Long text truncated to one line inside dense table cells. */
export const Clamp = styled.span`
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  max-width: 220px;

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 0.6875rem;
    color: ${({ theme }) => theme.colors.textMuted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0;
  flex-shrink: 0;
`;

export const IconAction = styled.button<{ $danger?: boolean }>`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textMuted};

  &:hover {
    background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.neutralSoft)};
    color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.text)};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const QrButton = styled.button`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  min-width: 44px;
  padding: 3px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.06);
  }
`;

const PersonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const PersonCell = ({ name, email }: { name: string; email: string }) => (
  <PersonRow>
    <Avatar name={name} />
    <Stack>
      <strong>{name}</strong>
      <span>{email}</span>
    </Stack>
  </PersonRow>
);

const Track = styled.div`
  width: 100%;
  min-width: 64px;
  max-width: 110px;
  height: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.neutralSoft};
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
`;

const MeterWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 72px;
  max-width: 110px;

  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.2;
  }

  && strong {
    display: inline;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

export const Meter = ({ value, max }: { value: number; max: number }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <MeterWrap title={`${value} of ${max} (${pct}%)`}>
      <span>
        <strong>{value}</strong> / {max}
      </span>
      <Track>
        <Fill $pct={pct} />
      </Track>
    </MeterWrap>
  );
};
