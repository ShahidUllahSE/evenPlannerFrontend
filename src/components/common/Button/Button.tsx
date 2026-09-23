import type { ButtonHTMLAttributes } from 'react';
import { Spinner, StyledButton, type ButtonSize, type ButtonVariant } from './Button.styles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  loading = false,
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps) => (
  <StyledButton
    type={type}
    $variant={variant}
    $size={size}
    $fullWidth={fullWidth}
    $iconOnly={iconOnly}
    disabled={disabled || loading}
    {...rest}
  >
    {loading && <Spinner />}
    {children}
  </StyledButton>
);

export default Button;
