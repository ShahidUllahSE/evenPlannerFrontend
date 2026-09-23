import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const rise = keyframes`from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; }`;

const WIDTHS = { sm: '440px', md: '600px', lg: '820px', xl: '1040px' };

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 27, 45, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 6vh ${({ theme }) => theme.spacing.md};
  overflow-y: auto;
  animation: ${fadeIn} 0.15s ease;
`;

const Dialog = styled.div<{ $size: keyof typeof WIDTHS }>`
  width: 100%;
  max-width: ${({ $size }) => WIDTHS[$size]};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${rise} 0.2s ease;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }

  p {
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textMuted};

  &:hover {
    background: ${({ theme }) => theme.colors.neutralSoft};
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: ${({ theme }) => `0 0 ${theme.radii.lg} ${theme.radii.lg}`};
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: keyof typeof WIDTHS;
  footer?: ReactNode;
  children: ReactNode;
  /** Blocks closing via overlay/Escape, e.g. while a task is running. */
  locked?: boolean;
}

const Modal = ({ open, onClose, title, subtitle, size = 'md', footer, children, locked }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, locked]);

  if (!open) return null;

  return createPortal(
    <Overlay onMouseDown={(e) => e.target === e.currentTarget && !locked && onClose()}>
      <Dialog $size={size} role="dialog" aria-modal="true" aria-label={title}>
        <Header>
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {!locked && (
            <CloseButton onClick={onClose} aria-label="Close">
              <X />
            </CloseButton>
          )}
        </Header>
        <Body>{children}</Body>
        {footer && <Footer>{footer}</Footer>}
      </Dialog>
    </Overlay>,
    document.body,
  );
};

export default Modal;
