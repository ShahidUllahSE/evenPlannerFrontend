import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export type CameraState = 'idle' | 'starting' | 'running' | 'error';

const describeError = (err: unknown) => {
  if (!window.isSecureContext) {
    return 'The camera only works over HTTPS (or on localhost). Open https://event.gwbdemo.xyz (not http://IP), or type the ticket code below.';
  }
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError') return 'Camera permission was denied. Allow camera access in your browser settings.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device.';
  if (name === 'NotReadableError') return 'The camera is being used by another app.';
  return err instanceof Error && err.message ? err.message : 'Could not start the camera.';
};

const buildReader = () => {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8');
  return new BrowserQRCodeReader(hints, {
    delayBetweenScanAttempts: 80,
    delayBetweenScanSuccess: 400,
  });
};

/**
 * Streams the rear camera and reports every QR payload via `onDetect`.
 * Powered by ZXing (much more reliable on phones than jsQR alone).
 */
export const useQrCamera = (onDetect: (text: string) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const onDetectRef = useRef(onDetect);
  const [state, setState] = useState<CameraState>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  const stop = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {
      // ignore
    }
    controlsRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setState('idle');
  }, []);

  const start = useCallback(async () => {
    if (controlsRef.current || state === 'starting' || state === 'running') return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(describeError(null));
      setState('error');
      return;
    }

    const video = videoRef.current;
    if (!video) {
      setError('Camera view is not ready. Refresh and try again.');
      setState('error');
      return;
    }

    setState('starting');
    try {
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;

      readerRef.current ??= buildReader();
      const reader = readerRef.current;

      // Prefer rear camera; fall back to any camera.
      let controls: IScannerControls;
      try {
        controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          video,
          (result) => {
            const text = result?.getText()?.trim();
            if (text) onDetectRef.current(text);
          },
        );
      } catch {
        controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
          const text = result?.getText()?.trim();
          if (text) onDetectRef.current(text);
        });
      }

      controlsRef.current = controls;
      setState('running');
    } catch (err) {
      stop();
      setError(describeError(err));
      setState('error');
    }
  }, [state, stop]);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, state, error, start, stop };
};
