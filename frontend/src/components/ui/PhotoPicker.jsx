// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useRef, useState } from 'react';
// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { Camera, FolderOpen, RefreshCw, SwitchCamera, X } from 'lucide-react';
// import = bring in code from another file or package
import { Button } from '@/components/ui/Button';

// Two ways to pick a photo: "Take photo" (the camera) or "Choose file".
// Either way the parent gets a File through onFile(file), so its checks and upload stay the same.
//
// Take photo:
//   - Browsers with the camera API (getUserMedia: every modern phone and laptop browser, on HTTPS or
//     localhost) get a live preview in a popup: capture, then Retake or Use photo.
//   - Without it, a file input with capture="user" opens the phone's own camera app instead.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// navigator = info about the browser/device (languages, camera...)
// !== = not strictly equal
// a && b = AND; in JSX: show b only when a is true
// ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
// getUserMedia = ask for the camera/microphone stream (needs permission)
const canUseCamera = () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function PhotoPicker({ onFile, accept, disabled, loading, chooseLabel, takeLabel }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const fileInput = useRef(null);
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const cameraInput = useRef(null);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [cameraOpen, setCameraOpen] = useState(false);

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const fromInput = (e) => {
    // const = a name for a value that is never reassigned
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    // if (...) = run the next part only when the condition is true
    if (file) onFile(file);
  };

  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        // loading="lazy" = load the image only when it gets near the screen
        // { } in JSX = run JavaScript here and show its result
        loading={loading}
        // disabled = can't be clicked or typed in
        // { } in JSX = run JavaScript here and show its result
        disabled={disabled}
        // onClick = what happens on click/tap
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // a ? b : c = ternary: if a then b else c
        // ?.() = call only if the function exists
        // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
        onClick={() => (canUseCamera() ? setCameraOpen(true) : cameraInput.current?.click())}
      >
        {/* { } in JSX = run JavaScript here and show its result
           ! = NOT: flips true/false
           a && b = AND; in JSX: show b only when a is true
           className = CSS classes (Tailwind) for this element (class is a JS keyword)
           a ?? b = a, unless a is null/undefined, then b
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        {!loading && <Camera className="size-4" />} {takeLabel ?? t('photo.take')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        // disabled = can't be clicked or typed in
        // { } in JSX = run JavaScript here and show its result
        // a || b = OR: a if it is truthy, else b
        disabled={disabled || loading}
        // onClick = what happens on click/tap
        // { } in JSX = run JavaScript here and show its result
        // => = an arrow function (a short function)
        // ?.() = call only if the function exists
        // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
        onClick={() => fileInput.current?.click()}
      >
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
           { } in JSX = run JavaScript here and show its result
           a ?? b = a, unless a is null/undefined, then b
           t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
        <FolderOpen className="size-4" /> {chooseLabel ?? t('photo.choose')}
      </Button>

      {/* ref = after drawing, put this element into a useRef box (.current)
         { } in JSX = run JavaScript here and show its result
         accept = which file types the file picker shows
         onChange = runs on every change of an input
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <input ref={fileInput} type="file" accept={accept} onChange={fromInput} className="hidden" />
      {/* Fallback for browsers without the camera API: opens the phone's camera app */}
      {/* ref = after drawing, put this element into a useRef box (.current)
         { } in JSX = run JavaScript here and show its result
         accept = which file types the file picker shows
         capture = open the camera instead of the file picker (phones)
         onChange = runs on every change of an input
         className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <input ref={cameraInput} type="file" accept={accept} capture="user" onChange={fromInput} className="hidden" />

      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {cameraOpen && (
        <CameraDialog
          // onClose = runs when the dialog closes
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onClose={() => setCameraOpen(false)}
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onCapture={(file) => {
            setCameraOpen(false);
            onFile(file);
          }}
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChooseFile={() => {
            setCameraOpen(false);
            // ?.() = call only if the function exists
            // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
            fileInput.current?.click();
          }}
        />
      )}
    </div>
  );
}

// Live camera preview in a native <dialog> (focus stays inside, Esc closes it).
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// onClose = runs when the dialog closes
function CameraDialog({ onClose, onCapture, onChooseFile }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const dialogRef = useRef(null);
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const videoRef = useRef(null);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [facing, setFacing] = useState('user'); // 'user' = front camera, 'environment' = back camera
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [cameraCount, setCameraCount] = useState(0);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [error, setError] = useState(null);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [shot, setShot] = useState(null); // { file, url } after Capture, until Retake / Use photo

  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // ?.() = call only if the function exists
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // showModal = open a <dialog> as a modal (dims the page, traps focus)
    dialogRef.current?.showModal();
  }, []);

  // Start the camera; restart it when switching front/back. Always stop it on close: an open
  // stream keeps the camera light on, which is the first thing users notice (and distrust).
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // return = give this value back and stop the function here
    if (shot) return undefined; // camera off while showing the captured photo
    // let = a name whose value can be changed later
    let stream;
    // let = a name whose value can be changed later
    let cancelled = false;
    setError(null);
    // navigator = info about the browser/device (languages, camera...)
    navigator.mediaDevices
      // getUserMedia = ask for the camera/microphone stream (needs permission)
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      // => = an arrow function (a short function)
      // async = this function works with await and returns a Promise
      .then(async (s) => {
        // if (...) = run the next part only when the condition is true
        // return = give this value back and stop the function here
        // => = an arrow function (a short function)
        if (cancelled) return s.getTracks().forEach((track) => track.stop());
        stream = s;
        // if (...) = run the next part only when the condition is true
        if (videoRef.current) videoRef.current.srcObject = s;
        // Only offer "switch camera" when there's more than one (labels/ids need permission first)
        // const = a name for a value that is never reassigned
        // await = wait for a Promise (async result) before continuing
        // navigator = info about the browser/device (languages, camera...)
        const devices = await navigator.mediaDevices.enumerateDevices();
        // .filter = keep only the items that pass a test
        // => = an arrow function (a short function)
        // === = strictly equal (same value AND same type)
        setCameraCount(devices.filter((d) => d.kind === 'videoinput').length);
      })
      // => = an arrow function (a short function)
      .catch((err) => {
        // if (...) = run the next part only when the condition is true
        // return = give this value back and stop the function here
        if (cancelled) return;
        setError(
          // a ? b : c = ternary: if a then b else c
          // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
          // === = strictly equal (same value AND same type)
          err?.name === 'NotAllowedError'
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            ? t('photo.denied')
            // a ? b : c = ternary: if a then b else c
            // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
            // === = strictly equal (same value AND same type)
            // a || b = OR: a if it is truthy, else b
            : err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError'
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              ? t('photo.noCamera')
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              : t('photo.cameraFailed'),
        );
      });
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    return () => {
      cancelled = true;
      // ?.() = call only if the function exists
      // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
      // => = an arrow function (a short function)
      stream?.getTracks().forEach((track) => track.stop());
    };
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  }, [facing, shot, t]);

  // Free the preview image's memory when it's replaced or the dialog closes
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  // a && b = AND; in JSX: show b only when a is true
  // URL.revokeObjectURL = free the memory of a temporary URL
  useEffect(() => () => shot && URL.revokeObjectURL(shot.url), [shot]);

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const capture = () => {
    // const = a name for a value that is never reassigned
    const video = videoRef.current;
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
    // return = give this value back and stop the function here
    if (!video?.videoWidth) return;
    // const = a name for a value that is never reassigned
    // document = the current web page (its HTML elements)
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // const = a name for a value that is never reassigned
    const ctx = canvas.getContext('2d');
    // The front-camera preview is mirrored (like a mirror, which feels natural); save it the same
    // way the person saw it.
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      // => = an arrow function (a short function)
      (blob) => {
        // if (...) = run the next part only when the condition is true
        // ! = NOT: flips true/false
        // return = give this value back and stop the function here
        if (!blob) return;
        // const = a name for a value that is never reassigned
        // new = create an object from a class (e.g. new Date())
        // `text ${x}` = a template string: text with values inserted
        // Date = a point in time
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        // URL.createObjectURL = a temporary URL for a file/blob in memory
        setShot({ file, url: URL.createObjectURL(blob) });
      },
      'image/jpeg',
      0.9,
    );
  };

  // return = give this value back and stop the function here
  return (
    // <dialog> = the browser's built-in popup (focus trap, Esc to close)
    <dialog
      // ref = after drawing, put this element into a useRef box (.current)
      // { } in JSX = run JavaScript here and show its result
      ref={dialogRef}
      // onClose = runs when the dialog closes
      // { } in JSX = run JavaScript here and show its result
      onClose={onClose}
      // aria-labelledby = the element (by id) that names this one
      aria-labelledby="camera-title"
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="bg-surface text-slate-900 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 shadow-xl backdrop:bg-night/60"
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <div className="space-y-4 p-5">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex items-center justify-between">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <h2 id="camera-title" className="font-semibold">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
            {t('photo.take')}
          </h2>
          <button
            type="button"
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            // => = an arrow function (a short function)
            // ?.() = call only if the function exists
            // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
            onClick={() => dialogRef.current?.close()}
            // aria-label = the name screen readers read for this element
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            aria-label={t('common.close')}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <X className="size-5" />
          </button>
        </div>

        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-night">
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c */}
          {shot ? (
            // { } in JSX = run JavaScript here and show its result
            // alt = text describing the image for screen readers (empty = decorative)
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <img src={shot.url} alt={t('photo.preview')} className="size-full object-cover" />
          ) : (
            // <video> = shows a video or a live camera stream
            <video
              // ref = after drawing, put this element into a useRef box (.current)
              // { } in JSX = run JavaScript here and show its result
              ref={videoRef}
              autoPlay
              // playsInline = play inside the page, not full screen (iPhone)
              playsInline // iPhone: play inline instead of going full screen
              muted
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              // a ? b : c = ternary: if a then b else c
              // === = strictly equal (same value AND same type)
              className={`size-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`}
            />
          )}
          {/* { } in JSX = run JavaScript here and show its result
             a && b = AND; in JSX: show b only when a is true */}
          {error && (
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white">
              {/* { } in JSX = run JavaScript here and show its result */}
              {error}
            </div>
          )}
          {/* { } in JSX = run JavaScript here and show its result
             ! = NOT: flips true/false
             a && b = AND; in JSX: show b only when a is true */}
          {!shot && !error && cameraCount > 1 && (
            <button
              type="button"
              // onClick = what happens on click/tap
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              // a ? b : c = ternary: if a then b else c
              // === = strictly equal (same value AND same type)
              onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
              // aria-label = the name screen readers read for this element
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              aria-label={t('photo.switch')}
              // { } in JSX = run JavaScript here and show its result
              // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
              title={t('photo.switch')}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-night/60 text-white backdrop-blur hover:bg-night/80"
            >
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <SwitchCamera className="size-5" />
            </button>
          )}
        </div>

        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <div className="flex flex-wrap justify-end gap-2">
          {/* { } in JSX = run JavaScript here and show its result
             a ? b : c = ternary: if a then b else c */}
          {error ? (
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            <Button type="button" onClick={onChooseFile}>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <FolderOpen className="size-4" /> {t('photo.chooseInstead')}
            </Button>
          // a ? b : c = ternary: if a then b else c
          ) : shot ? (
            // <> </> = a fragment: groups elements without adding an extra HTML element
            <>
              {/* onClick = what happens on click/tap
                 { } in JSX = run JavaScript here and show its result
                 => = an arrow function (a short function) */}
              <Button type="button" variant="secondary" onClick={() => setShot(null)}>
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                   { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                <RefreshCw className="size-4" /> {t('photo.retake')}
              </Button>
              {/* onClick = what happens on click/tap
                 { } in JSX = run JavaScript here and show its result
                 => = an arrow function (a short function) */}
              <Button type="button" onClick={() => onCapture(shot.file)}>
                {/* { } in JSX = run JavaScript here and show its result
                   t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
                {t('photo.use')}
              </Button>
            </>
          ) : (
            // onClick = what happens on click/tap
            // { } in JSX = run JavaScript here and show its result
            <Button type="button" onClick={capture}>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result
                 t('key') = the text for this key in the current language (from i18n/en.js or kn.js) */}
              <Camera className="size-4" /> {t('photo.capture')}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
