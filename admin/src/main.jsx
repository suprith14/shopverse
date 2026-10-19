// import = bring in code from another file or package
// StrictMode = extra checks while developing (runs some code twice to catch bugs); no effect in production
import { StrictMode } from 'react';
// import = bring in code from another file or package
// createRoot = start React inside an existing HTML element
import { createRoot } from 'react-dom/client';
// import = bring in code from another file or package
// Provider = makes the Redux store available to every component inside it
import { Provider } from 'react-redux';
// import = bring in code from another file or package
import { store } from '@/app/store';
// import = bring in code from another file or package
import { App } from '@/App';
// import = bring in code from another file or package
import './index.css';

// createRoot = start React inside an existing HTML element
// document = the current web page (its HTML elements)
createRoot(document.getElementById('root')).render(
  // StrictMode = extra checks while developing (runs some code twice to catch bugs); no effect in production
  <StrictMode>
    {/* <Provider> makes the Redux store available to every component */}
    {/* Provider = makes the Redux store available to every component inside it
       { } in JSX = run JavaScript here and show its result */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

// The app has rendered: fade out the start-up loader from index.html, then remove it.
// requestAnimationFrame waits for the first frame to be painted, so there's no blank flash.
// requestAnimationFrame = run code right before the next screen paint
// => = an arrow function (a short function)
requestAnimationFrame(() => {
  // const = a name for a value that is never reassigned
  // document = the current web page (its HTML elements)
  const splash = document.getElementById('splash');
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!splash) return;
  splash.classList.add('splash-hide'); // CSS fades it out over 0.3 s
  // addEventListener = run a function when an event happens
  // => = an arrow function (a short function)
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  // setTimeout = run a function once after a delay (ms)
  // => = an arrow function (a short function)
  setTimeout(() => splash.remove(), 600); // in case the transition doesn't run (e.g. reduced motion)
});
