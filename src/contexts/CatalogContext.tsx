import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Theme } from '../lib/supabase';
import { fetchThemes, fetchResources, type ResourceWithTheme } from '../services/catalog';

interface CatalogContextValue {
  themes: Theme[];
  themesLoading: boolean;
  themesError: string | null;
  resources: ResourceWithTheme[];
  resourcesLoading: boolean;
  resourcesError: string | null;
  refetchThemes: () => Promise<void>;
  refetchResources: () => Promise<void>;
  invalidateCatalog: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [themesError, setThemesError] = useState<string | null>(null);

  const [resources, setResources] = useState<ResourceWithTheme[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  const refetchThemes = useCallback(async () => {
    setThemesLoading(true);
    setThemesError(null);
    try {
      setThemes(await fetchThemes());
    } catch (err) {
      console.error('Erreur chargement thèmes:', err);
      setThemesError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setThemesLoading(false);
    }
  }, []);

  const refetchResources = useCallback(async () => {
    setResourcesLoading(true);
    setResourcesError(null);
    try {
      setResources(await fetchResources());
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
      setResourcesError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const invalidateCatalog = useCallback(async () => {
    await Promise.all([refetchThemes(), refetchResources()]);
  }, [refetchThemes, refetchResources]);

  useEffect(() => {
    refetchThemes();
    refetchResources();
  }, [refetchThemes, refetchResources]);

  return (
    <CatalogContext.Provider
      value={{
        themes,
        themesLoading,
        themesError,
        resources,
        resourcesLoading,
        resourcesError,
        refetchThemes,
        refetchResources,
        invalidateCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

function useCatalogContext() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useThemes/useResources must be used within CatalogProvider');
  }
  return context;
}

export function useThemes() {
  const { themes, themesLoading, themesError, refetchThemes } = useCatalogContext();
  return {
    themes,
    loading: themesLoading,
    error: themesError,
    refetch: refetchThemes,
  };
}

export function useResources() {
  const { resources, resourcesLoading, resourcesError, refetchResources } = useCatalogContext();
  return {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    refetch: refetchResources,
  };
}
