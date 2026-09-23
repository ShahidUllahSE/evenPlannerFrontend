import { Check } from 'lucide-react';
import styled from 'styled-components';
import type { EmailTemplateId } from '@/types/email';
import { EMAIL_TEMPLATES } from '@/utils/emailTemplates';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Option = styled.button<{ $selected: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.surface)};
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.4;
  }
`;

/** Tiny illustration of the template: header band + text lines. */
const Thumb = styled.div<{ $head: string; $accent: string }>`
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background:
    linear-gradient(${({ $head }) => $head}, ${({ $head }) => $head}) top / 100% 38% no-repeat,
    linear-gradient(${({ $accent }) => $accent}, ${({ $accent }) => $accent}) 50% 52% / 30% 3px no-repeat,
    linear-gradient(#e3e8ef, #e3e8ef) 16% 72% / 68% 4px no-repeat,
    linear-gradient(#e3e8ef, #e3e8ef) 16% 86% / 50% 4px no-repeat,
    #fff;
`;

const Tick = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;

  svg {
    width: 12px;
    height: 12px;
  }
`;

interface TemplatePickerProps {
  value: EmailTemplateId;
  onChange: (id: EmailTemplateId) => void;
}

const TemplatePicker = ({ value, onChange }: TemplatePickerProps) => (
  <Grid role="radiogroup" aria-label="Email template">
    {EMAIL_TEMPLATES.map((t) => (
      <Option
        key={t.id}
        type="button"
        role="radio"
        aria-checked={value === t.id}
        $selected={value === t.id}
        onClick={() => onChange(t.id)}
      >
        {value === t.id && (
          <Tick>
            <Check />
          </Tick>
        )}
        <Thumb $head={t.swatch[0]} $accent={t.swatch[1]} />
        <div>
          <strong>{t.name}</strong>
          <br />
          <span>{t.description}</span>
        </div>
      </Option>
    ))}
  </Grid>
);

export default TemplatePicker;
