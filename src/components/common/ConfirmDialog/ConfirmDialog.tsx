import type { ReactNode } from 'react';
import styled from 'styled-components';
import Button from '../Button';
import Modal from '../Modal';

const Message = styled.div`
  color: ${({ theme }) => theme.colors.neutral};
  line-height: 1.6;
`;

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={tone}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <Message>{message}</Message>
  </Modal>
);

export default ConfirmDialog;
