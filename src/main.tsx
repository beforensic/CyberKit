import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-900.css';
import '@fontsource/inter/latin-ext-400.css';
import '@fontsource/inter/latin-ext-600.css';
import '@fontsource/inter/latin-ext-700.css';
import '@fontsource/inter/latin-ext-900.css';
import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@fontsource/source-serif-4/latin-700.css';
import '@fontsource/source-serif-4/latin-ext-400.css';
import '@fontsource/source-serif-4/latin-ext-600.css';
import '@fontsource/source-serif-4/latin-ext-700.css';
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
