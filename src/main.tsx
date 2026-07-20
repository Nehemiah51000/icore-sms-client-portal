import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { Toaster } from './ui/Toast/Toaster';
import { ErrorBoundary } from './ui/ErrorBoundary/ErrorBoundary';
import { OfflineBanner } from './ui/OfflineBanner/OfflineBanner';
import { queryClient } from './lib/queryClient';
import './index.css';
import { InstallPrompt } from './ui/InstallPrompt/InstallPrompt';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OfflineBanner />
          <InstallPrompt />
          <App />
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
