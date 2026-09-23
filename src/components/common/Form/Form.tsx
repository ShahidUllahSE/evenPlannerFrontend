import type { InputHTMLAttributes, ReactNode } from 'react';
import { Search } from 'lucide-react';
import styled, { css } from 'styled-components';

const controlBase = css`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

export const Input = styled.input`
  ${controlBase}
`;

export const Select = styled.select`
  ${controlBase}
  padding-right: 32px;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
`;

export const Textarea = styled.textarea`
  ${controlBase}
  height: auto;
  min-height: 96px;
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.5;
`;

const FieldWrapper = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const LabelText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  em {
    color: ${({ theme }) => theme.colors.danger};
    font-style: normal;
    margin-left: 2px;
  }
`;

const HelpText = styled.span<{ $error?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme, $error }) => ($error ? theme.colors.danger : theme.colors.textMuted)};
`;

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export const Field = ({ label, required, hint, error, children }: FieldProps) => (
  <FieldWrapper>
    <LabelText>
      {label}
      {required && <em>*</em>}
    </LabelText>
    {children}
    {error ? <HelpText $error>{error}</HelpText> : hint && <HelpText>{hint}</HelpText>}
  </FieldWrapper>
);

export const FormGrid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 2 }) => $columns}, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const FullRow = styled.div`
  grid-column: 1 / -1;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.textLight};
    pointer-events: none;
  }

  input {
    padding-left: 36px;
  }
`;

export const SearchInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <SearchWrapper>
    <Search />
    <Input type="search" {...props} />
  </SearchWrapper>
);
