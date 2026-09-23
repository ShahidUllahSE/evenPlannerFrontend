import { Sparkles } from 'lucide-react';
import styled from 'styled-components';

const Wrapper = styled.div<{ $light: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme, $light }) => ($light ? '#fff' : theme.colors.text)};
`;

const Mark = styled.div`
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, #14A3A1);
  color: ${({ theme }) => theme.colors.accent};
  box-shadow: 0 6px 16px rgba(14, 124, 123, 0.35);

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Name = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;

  small {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.6;
  }
`;

const Logo = ({ light = false, tagline = 'Admin Panel' }: { light?: boolean; tagline?: string }) => (
  <Wrapper $light={light}>
    <Mark>
      <Sparkles />
    </Mark>
    <Name>
      EventSphere
      <small>{tagline}</small>
    </Name>
  </Wrapper>
);

export default Logo;
