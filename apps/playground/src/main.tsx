import { ChartProvider } from '@startupjafari/charts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const params = new URLSearchParams(location.search);
if (params.get('theme') === 'dark') document.documentElement.classList.add('dark');

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ChartProvider locale={params.get('locale') ?? 'en'}>
      <App />
    </ChartProvider>
  </StrictMode>,
);
