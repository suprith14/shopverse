import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { App } from '@/App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Provider> makes the Redux store available to every component */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

// The app has rendered: fade out the start-up loader from index.html, then remove it.
// requestAnimationFrame waits for the first frame to be painted, so there's no blank flash.
requestAnimationFrame(() => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('splash-hide'); // CSS fades it out over 0.3 s
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  setTimeout(() => splash.remove(), 600); // in case the transition doesn't run (e.g. reduced motion)
});
