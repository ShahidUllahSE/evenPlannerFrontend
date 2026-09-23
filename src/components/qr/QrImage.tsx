import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { QrType } from '@/types/qr';
import { renderQrDataUrl } from '@/utils/qr';

const pulse = keyframes`50% { opacity: .5; }`;

const Placeholder = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.neutralSoft};
  animation: ${pulse} 1.2s ease infinite;
`;

const Img = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  max-width: none;
  flex-shrink: 0;
  border-radius: 6px;
  image-rendering: pixelated;
`;

interface QrImageProps {
  type: QrType;
  payload: string;
  size?: number;
  /** Resolution of the generated bitmap; defaults to 2× display size. */
  resolution?: number;
}

const QrImage = ({ type, payload, size = 40, resolution }: QrImageProps) => {
  const [result, setResult] = useState<{ key: string; url: string } | null>(null);
  const key = `${type}:${payload}:${resolution ?? size * 2}`;

  useEffect(() => {
    let active = true;
    renderQrDataUrl(type, payload, resolution ?? size * 2).then((url) => {
      if (active) setResult({ key, url });
    });
    return () => {
      active = false;
    };
  }, [type, payload, size, resolution, key]);

  if (!result || result.key !== key) return <Placeholder $size={size} />;
  return <Img $size={size} src={result.url} alt="QR code" />;
};

export default QrImage;
