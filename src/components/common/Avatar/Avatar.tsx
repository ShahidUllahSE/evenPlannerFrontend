import styled from 'styled-components';
import { initials } from '@/utils/format';

// Muted tints so avatars add warmth without competing with status colors.
const TINTS = [
  ['#E3F2F1', '#0B6665'],
  ['#FBF3DF', '#8A6516'],
  ['#E8EDF6', '#1E3A5F'],
  ['#F3E8EE', '#7A3553'],
  ['#E9F0E4', '#3F5F2A'],
  ['#EEEAF6', '#4B3F7A'],
];

const hash = (s: string) => [...s].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 0);

const Circle = styled.span<{ $size: number; $bg: string; $fg: string }>`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  font-size: ${({ $size }) => Math.round($size * 0.38)}px;
  font-weight: 600;
`;

const Avatar = ({ name, size = 34 }: { name: string; size?: number }) => {
  const [bg, fg] = TINTS[Math.abs(hash(name)) % TINTS.length]!;
  return (
    <Circle $size={size} $bg={bg!} $fg={fg!} aria-hidden>
      {initials(name)}
    </Circle>
  );
};

export default Avatar;
