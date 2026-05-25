import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ProgressProvider } from './contexts/ProgressContext';
import { CatalogProvider } from './contexts/CatalogContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CatalogProvider>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </CatalogProvider>
  </StrictMode>
);
