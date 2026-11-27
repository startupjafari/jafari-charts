import '@fontsource-variable/inter/opsz.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { RouterProvider } from './lib/router';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider>
      {/* App wraps the pages in a ChartProvider that follows the site theme and language. */}
      <App />
    </RouterProvider>
  </StrictMode>,
);
