import styled from 'styled-components';
import realLogo from '@/assets/reallogo.png';

const Wrapper = styled.div<{ $light: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
  width: 100%;
  color: ${({ theme, $light }) => ($light ? '#fff' : theme.colors.text)};
`;

const Wordmark = styled.img<{ $size: 'md' | 'lg' }>`
  display: block;
  width: 100%;
  height: auto;
  max-height: ${({ $size }) => ($size === 'lg' ? '100px' : '68px')};
  object-fit: contain;
  object-position: left center;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
`;

const Tag = styled.small`
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.55;
  padding-left: 2px;
`;

type LogoProps = {
  light?: boolean;
  tagline?: string;
  size?: 'md' | 'lg';
};

/** EventSphere wordmark from `src/assets/reallogo.png` (cropped tight). */
const Logo = ({ light = false, tagline = 'Admin Panel', size = 'md' }: LogoProps) => (
  <Wrapper $light={light}>
    <Wordmark key={realLogo} $size={size} src={realLogo} alt="EventSphere" decoding="async" />
    {tagline ? <Tag>{tagline}</Tag> : null}
  </Wrapper>
);

export default Logo;
