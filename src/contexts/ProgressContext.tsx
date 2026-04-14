import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProgressContextType {
  consultedResources: Set<string>;
  markAsConsulted: (resourceId: string) => void;
  isConsulted: (resourceId: string) => boolean;
  getConsultedCount: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consultedResources, setConsultedResources] = useState<Set<string>>(new Set());

  const markAsConsulted = (resourceId: string) => {
    setConsultedResources(prev => new Set(prev).add(resourceId));
  };

  const isConsulted = (resourceId: string) => {
    return consultedResources.has(resourceId);
  };

  const getConsultedCount = () => {
    return consultedResources.size;
  };

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
