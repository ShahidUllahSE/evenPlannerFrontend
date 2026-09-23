import { Check } from 'lucide-react';
import styled from 'styled-components';
import type { QrType } from '@/types/qr';
import { buildQrPayload, QR_TYPE_ORDER, QR_TYPES } from '@/utils/qr';
import QrImage from './QrImage';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Option = styled.button<{ $selected: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.surface)};
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }

  small {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.5;
  }
`;

const QrFrame = styled.div`
  padding: 8px;
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Encodes = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.neutralSoft};
  padding: 2px 8px;
  border-radius: 999px;
`;

const Tick = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SAMPLE = { ticketCode: 'EP-DEMO-7K3F', eventId: 'evt_sample', inviteeId: 'inv_sample' };

interface QrTypePickerProps {
  value: QrType | null;
  onChange: (type: QrType) => void;
  /** When set, only this type can be chosen (event already has tickets). */
  lockedTo?: QrType | null;
}

const QrTypePicker = ({ value, onChange, lockedTo }: QrTypePickerProps) => (
  <Grid role="radiogroup" aria-label="QR code type">
    {QR_TYPE_ORDER.map((type) => {
      const config = QR_TYPES[type];
      const selected = value === type;
      return (
        <Option
          key={type}
          type="button"
          role="radio"
          aria-checked={selected}
          $selected={selected}
          disabled={!!lockedTo && lockedTo !== type}
          onClick={() => onChange(type)}
        >
          {selected && (
            <Tick>
              <Check />
            </Tick>
          )}
          <QrFrame>
            <QrImage type={type} payload={buildQrPayload(type, SAMPLE)} size={112} resolution={240} />
          </QrFrame>
          <h4>{config.label}</h4>
          <small>{config.tagline}</small>
          <p>{config.description}</p>
          <Encodes>Encodes: {config.encodes}</Encodes>
        </Option>
      );
    })}
  </Grid>
);

export default QrTypePicker;
