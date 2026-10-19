import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, FolderOpen, RefreshCw, SwitchCamera, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Two ways to pick a photo: "Take photo" (the camera) or "Choose file".
// Either way the parent gets a File through onFile(file), so its checks and upload stay the same.
//
// Take photo:
//   - Browsers with the camera API (getUserMedia: every modern phone and laptop browser, on HTTPS or
//     localhost) get a live preview in a popup: capture, then Retake or Use photo.
//   - Without it, a file input with capture="user" opens the phone's own camera app instead.
const canUseCamera = () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

export function PhotoPicker({ onFile, accept, disabled, loading, chooseLabel, takeLabel }) {
  const { t } = useTranslation();
  const fileInput = useRef(null);
  const cameraInput = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const fromInput = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (file) onFile(file);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        loading={loading}
        disabled={disabled}
        onClick={() => (canUseCamera() ? setCameraOpen(true) : cameraInput.current?.click())}
      >
        {!loading && <Camera className="size-4" />} {takeLabel ?? t('photo.take')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || loading}
        onClick={() => fileInput.current?.click()}
      >
        <FolderOpen className="size-4" /> {chooseLabel ?? t('photo.choose')}
      </Button>

      <input ref={fileInput} type="file" accept={accept} onChange={fromInput} className="hidden" />
      {/* Fallback for browsers without the camera API: opens the phone's camera app */}
      <input ref={cameraInput} type="file" accept={accept} capture="user" onChange={fromInput} className="hidden" />

      {cameraOpen && (
        <CameraDialog
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            setCameraOpen(false);
            onFile(file);
          }}
          onChooseFile={() => {
            setCameraOpen(false);
            fileInput.current?.click();
          }}
        />
      )}
    </div>
  );
}

// Live camera preview in a native <dialog> (focus stays inside, Esc closes it).
function CameraDialog({ onClose, onCapture, onChooseFile }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [facing, setFacing] = useState('user'); // 'user' = front camera, 'environment' = back camera
  const [cameraCount, setCameraCount] = useState(0);
  const [error, setError] = useState(null);
  const [shot, setShot] = useState(null); // { file, url } after Capture, until Retake / Use photo

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Start the camera; restart it when switching front/back. Always stop it on close: an open
  // stream keeps the camera light on, which is the first thing users notice (and distrust).
  useEffect(() => {
    if (shot) return undefined; // camera off while showing the captured photo
    let stream;
    let cancelled = false;
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((track) => track.stop());
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        // Only offer "switch camera" when there's more than one (labels/ids need permission first)
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameraCount(devices.filter((d) => d.kind === 'videoinput').length);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.name === 'NotAllowedError'
            ? t('photo.denied')
            : err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError'
              ? t('photo.noCamera')
              : t('photo.cameraFailed'),
        );
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [facing, shot, t]);

  // Free the preview image's memory when it's replaced or the dialog closes
  useEffect(() => () => shot && URL.revokeObjectURL(shot.url), [shot]);

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // The front-camera preview is mirrored (like a mirror, which feels natural); save it the same
    // way the person saw it.
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setShot({ file, url: URL.createObjectURL(blob) });
      },
      'image/jpeg',
      0.9,
    );
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="camera-title"
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 id="camera-title" className="font-semibold">
            {t('photo.take')}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={t('common.close')}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-night">
          {shot ? (
            <img src={shot.url} alt={t('photo.preview')} className="size-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline // iPhone: play inline instead of going full screen
              muted
              className={`size-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`}
            />
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white">
              {error}
            </div>
          )}
          {!shot && !error && cameraCount > 1 && (
            <button
              type="button"
              onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
              aria-label={t('photo.switch')}
              title={t('photo.switch')}
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-night/60 text-white backdrop-blur hover:bg-night/80"
            >
              <SwitchCamera className="size-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {error ? (
            <Button type="button" onClick={onChooseFile}>
              <FolderOpen className="size-4" /> {t('photo.chooseInstead')}
            </Button>
          ) : shot ? (
            <>
              <Button type="button" variant="secondary" onClick={() => setShot(null)}>
                <RefreshCw className="size-4" /> {t('photo.retake')}
              </Button>
              <Button type="button" onClick={() => onCapture(shot.file)}>
                {t('photo.use')}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={capture}>
              <Camera className="size-4" /> {t('photo.capture')}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
