import { ChartProvider } from '@jafari/charts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { RouterProvider } from './lib/router';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider>
      {/* Every chart on the site follows the site theme (`.dark` on <html>). */}
      <ChartProvider theme="auto" locale="en">
        <App />
      </ChartProvider>
    </RouterProvider>
  </StrictMode>,
);
