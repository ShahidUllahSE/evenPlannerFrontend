import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export type CameraState = 'idle' | 'starting' | 'running' | 'error';

/** Decode at a higher res on phones — small printed / on-screen tickets need it. */
const DECODE_WIDTH = 960;
const DECODE_INTERVAL_MS = 80;

const describeError = (err: unknown) => {
  if (!window.isSecureContext) {
    return 'The camera only works over HTTPS (or on localhost). Open the app with an https:// address, or type the ticket code below.';
  }
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError') return 'Camera permission was denied. Allow camera access in your browser settings.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device.';
  if (name === 'NotReadableError') return 'The camera is being used by another app.';
  return 'Could not start the camera.';
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

const getBarcodeDetector = (): BarcodeDetectorLike | null => {
  const BD = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector;
  if (!BD) return null;
  try {
    return new BD({ formats: ['qr_code'] });
  } catch {
    return null;
  }
};

/**
 * Streams the rear camera into `videoRef` and calls `onDetect` with the text of every QR code it sees.
 * Uses BarcodeDetector when available (better on Android Chrome), otherwise jsQR with invert attempts.
 */
export const useQrCamera = (onDetect: (text: string) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const onDetectRef = useRef(onDetect);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState('idle');
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(describeError(null));
      setState('error');
      return;
    }
    setState('starting');
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          } as MediaTrackConstraints,
          audio: false,
        });
      } catch {
        // Fall back if advanced constraints fail (common on iOS).
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        return;
      }
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      setState('running');

      detectorRef.current = getBarcodeDetector();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      let last = 0;
      let detecting = false;

      const tick = async (now: number) => {
        frameRef.current = requestAnimationFrame(tick);
        if (!ctx || detecting || now - last < DECODE_INTERVAL_MS || video.readyState < video.HAVE_ENOUGH_DATA) {
          return;
        }
        last = now;

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh) return;

        const scale = Math.min(1, DECODE_WIDTH / vw);
        canvas.width = Math.max(1, Math.round(vw * scale));
        canvas.height = Math.max(1, Math.round(vh * scale));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        detecting = true;
        try {
          const detector = detectorRef.current;
          if (detector) {
            const codes = await detector.detect(canvas);
            const value = codes[0]?.rawValue?.trim();
            if (value) {
              onDetectRef.current(value);
              return;
            }
          }

          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // attemptBoth: needed for screen glare / light-on-dark prints
          const code = jsQR(image.data, image.width, image.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code?.data) onDetectRef.current(code.data.trim());
        } finally {
          detecting = false;
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError(describeError(err));
      setState('error');
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { videoRef, state, error, start, stop };
};
