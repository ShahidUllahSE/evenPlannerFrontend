import styled from 'styled-components';

const Wrapper = styled.div<{ $light: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  color: ${({ theme, $light }) => ($light ? '#fff' : theme.colors.text)};
  min-width: 0;
`;

const Wordmark = styled.img`
  height: 34px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: #fff;
  padding: 3px 8px;
  box-shadow: 0 4px 12px rgba(14, 124, 123, 0.22);
`;

const Tag = styled.small`
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.65;
  padding-left: 2px;
`;

const Logo = ({ light = false, tagline = 'Admin Panel' }: { light?: boolean; tagline?: string }) => (
  <Wrapper $light={light}>
    <Wordmark src="/logo.png" alt="EventSphere" />
    {tagline ? <Tag>{tagline}</Tag> : null}
  </Wrapper>
);

export default Logo;
