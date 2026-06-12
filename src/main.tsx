import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ProgressProvider } from './contexts/ProgressContext';
import { CatalogProvider } from './contexts/CatalogContext';
import ConfigMissing from './components/ConfigMissing';
import { isSupabaseConfigured } from './lib/supabase';

const root = createRoot(document.getElementById('root')!);

root.render(
  isSupabaseConfigured ? (
    <StrictMode>
      <CatalogProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </CatalogProvider>
    </StrictMode>
  ) : (
    <ConfigMissing />
  ),
);
