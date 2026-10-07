import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export type CameraState = 'idle' | 'starting' | 'running' | 'error';

/** Frames are shrunk to this width before decoding; plenty for a ticket held up to the camera. */
const DECODE_WIDTH = 640;
const DECODE_INTERVAL_MS = 120;

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

/**
 * Streams the rear camera into `videoRef` and calls `onDetect` with the text of every QR code it sees.
 * The caller decides what to do with repeats.
 */
export const useQrCamera = (onDetect: (text: string) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const onDetectRef = useRef(onDetect);
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        return;
      }
      video.srcObject = stream;
      await video.play();
      setState('running');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      let last = 0;
      const tick = (now: number) => {
        frameRef.current = requestAnimationFrame(tick);
        if (!ctx || now - last < DECODE_INTERVAL_MS || video.readyState < video.HAVE_ENOUGH_DATA) return;
        last = now;
        const scale = Math.min(1, DECODE_WIDTH / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) onDetectRef.current(code.data);
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError(describeError(err));
      setState('error');
    }
  }, []);

  // Release the camera when the page closes.
  useEffect(() => stop, [stop]);

  return { videoRef, state, error, start, stop };
};
