import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { getConsultedResourceIds, saveConsultedResourceIds } from '../utils/storage';

interface ProgressContextType {
  consultedResources: Set<string>;
  markAsConsulted: (resourceId: string) => void;
  isConsulted: (resourceId: string) => boolean;
  getConsultedCount: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

function loadConsultedSet(): Set<string> {
  return new Set(getConsultedResourceIds());
}

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consultedResources, setConsultedResources] = useState<Set<string>>(loadConsultedSet);

  useEffect(() => {
    const syncFromStorage = () => setConsultedResources(loadConsultedSet());
    window.addEventListener('progressUpdated', syncFromStorage);
    return () => window.removeEventListener('progressUpdated', syncFromStorage);
  }, []);

  const markAsConsulted = useCallback((resourceId: string) => {
    setConsultedResources((prev) => {
      if (prev.has(resourceId)) return prev;
      const next = new Set(prev).add(resourceId);
      saveConsultedResourceIds(Array.from(next));
      return next;
    });
  }, []);

  const isConsulted = useCallback(
    (resourceId: string) => consultedResources.has(resourceId),
    [consultedResources],
  );

  const getConsultedCount = useCallback(
    () => consultedResources.size,
    [consultedResources],
  );

  return (
    <ProgressContext.Provider value={{ consultedResources, markAsConsulted, isConsulted, getConsultedCount }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
