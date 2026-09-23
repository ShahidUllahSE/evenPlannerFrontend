import styled, { css, keyframes } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

const spin = keyframes`to { transform: rotate(360deg); }`;

const sizes = {
  sm: css`
    height: 32px;
    padding: 0 12px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  md: css`
    height: 38px;
    padding: 0 16px;
    font-size: ${({ theme }) => theme.fontSizes.md};
  `,
  lg: css`
    height: 46px;
    padding: 0 22px;
    font-size: ${({ theme }) => theme.fontSizes.lg};
  `,
};

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryHover};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.borderStrong};
      background: ${({ theme }) => theme.colors.surfaceAlt};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textMuted};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.neutralSoft};
      color: ${({ theme }) => theme.colors.text};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.danger};
    color: #fff;
    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }
  `,
  accent: css`
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.sidebar};
    &:hover:not(:disabled) {
      filter: brightness(0.95);
    }
  `,
};

export const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $iconOnly: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    filter 0.15s ease;

  ${({ $size }) => sizes[$size]}
  ${({ $variant }) => variants[$variant]}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
  ${({ $iconOnly, $size }) =>
    $iconOnly &&
    css`
      padding: 0;
      width: ${$size === 'sm' ? '32px' : $size === 'lg' ? '46px' : '38px'};
    `}

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const Spinner = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: ${spin} 0.7s linear infinite;
`;
