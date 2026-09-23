import { Calendar, Download, MapPin } from 'lucide-react';
import styled from 'styled-components';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { CategoryBadge } from '@/components/common/StatusBadges';
import type { EventItem } from '@/types/event';
import type { Invitee } from '@/types/invitee';
import { downloadUrl } from '@/utils/download';
import { formatDate, formatTime } from '@/utils/format';
import { QR_TYPES, renderQrDataUrl } from '@/utils/qr';
import QrImage from './QrImage';

const Ticket = styled.div`
  max-width: 360px;
  margin: 0 auto;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const TicketHead = styled.div`
  background: ${({ theme }) => theme.colors.sidebar};
  color: #fff;
  padding: ${({ theme }) => theme.spacing.lg};

  small {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.accent};
  }

  h4 {
    margin-top: 6px;
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.sidebarText};

  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Perforation = styled.div`
  position: relative;
  height: 0;
  border-top: 2px dashed ${({ theme }) => theme.colors.border};

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -12px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  &::before {
    left: -12px;
  }
  &::after {
    right: -12px;
  }
`;

const TicketBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  text-align: center;

  h5 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-top: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Code = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.text};
`;

const Payload = styled.pre`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: pre-wrap;
  word-break: break-all;
`;

interface QrTicketModalProps {
  invitee: Invitee | null;
  event: EventItem | undefined;
  onClose: () => void;
}

const QrTicketModal = ({ invitee, event, onClose }: QrTicketModalProps) => {
  if (!invitee || !event) return null;

  const download = async () => {
    const url = await renderQrDataUrl(invitee.qrType, invitee.qrPayload, 1024);
    downloadUrl(url, `${invitee.ticketCode}_${invitee.name.replace(/\s+/g, '_')}.png`);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Entry Pass"
      subtitle={`${QR_TYPES[invitee.qrType].label} QR · unique to this guest`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={download}>
            <Download /> Download QR (PNG)
          </Button>
        </>
      }
    >
      <Ticket>
        <TicketHead>
          <small>Admit one</small>
          <h4>{event.title}</h4>
          <Meta>
            <span>
              <Calendar /> {formatDate(event.date)} · {formatTime(event.startTime)}
            </span>
            <span>
              <MapPin /> {event.venue}, {event.city}
            </span>
          </Meta>
        </TicketHead>
        <Perforation />
        <TicketBody>
          <QrImage type={invitee.qrType} payload={invitee.qrPayload} size={200} resolution={480} />
          <Code>{invitee.ticketCode}</Code>
          <h5>{invitee.name}</h5>
          <p>
            {invitee.designation}
            {invitee.company && ` · ${invitee.company}`}
          </p>
          <CategoryBadge category={invitee.category} />
        </TicketBody>
      </Ticket>
      <Payload>
        <strong>Encoded data (scanner will read this):</strong>
        {'\n'}
        {invitee.qrPayload}
      </Payload>
    </Modal>
  );
};

export default QrTicketModal;
