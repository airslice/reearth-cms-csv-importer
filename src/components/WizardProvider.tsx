import React, { createContext, useState, useCallback } from 'react';
import { storage } from '@/services';
import type {
  WizardState,
  WizardContextValue,
  Step,
  Credentials,
  CsvData,
  Project,
  Model,
  FieldMapping,
  NewModelConfig,
  ImportProgress,
  ImportResults,
} from '@/types';

// Create context
export const WizardContext = createContext<WizardContextValue | null>(null);

// Initial state
const initialState: WizardState = {
  currentStep: 1,
  credentials: {
    apiKey: '',
    workspaceId: '',
  },
  csvFile: null,
  csvData: null,
  selectedProject: null,
  importMode: null,
  newModelConfig: null,
  selectedModel: null,
  fieldMappings: [],
  importProgress: null,
  importResults: null,
};

interface WizardProviderProps {
  children: React.ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  // Load saved credentials on mount
  const [state, setState] = useState<WizardState>(() => {
    const savedCredentials = storage.loadCredentials();
    return {
      ...initialState,
      credentials: savedCredentials || initialState.credentials,
    };
  });

  // Step 1 methods
  const updateCredentials = useCallback((credentials: Partial<Credentials>) => {
    setState((prev) => {
      const updated = {
        ...prev,
        credentials: { ...prev.credentials, ...credentials },
      };
      storage.saveCredentials(updated.credentials);
      return updated;
    });
  }, []);

  const setCsvFile = useCallback((file: File | null) => {
    setState((prev) => ({ ...prev, csvFile: file }));
  }, []);

  const setCsvData = useCallback((data: CsvData | null) => {
    setState((prev) => ({ ...prev, csvData: data }));
  }, []);

  // Step 2 methods
  const setSelectedProject = useCallback((project: Project | null) => {
    setState((prev) => ({ ...prev, selectedProject: project }));
  }, []);

  const setImportMode = useCallback((mode: 'createNew' | 'existing' | null) => {
    setState((prev) => ({ ...prev, importMode: mode }));
  }, []);

  const setNewModelConfig = useCallback((config: NewModelConfig | null) => {
    setState((prev) => ({ ...prev, newModelConfig: config }));
  }, []);

  const setSelectedModel = useCallback((model: Model | null) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
  }, []);

  const setFieldMappings = useCallback((mappings: FieldMapping[]) => {
    setState((prev) => ({ ...prev, fieldMappings: mappings }));
  }, []);

  // Step 3 methods
  const updateImportProgress = useCallback((progress: Partial<ImportProgress>) => {
    setState((prev) => ({
      ...prev,
      importProgress: prev.importProgress
        ? { ...prev.importProgress, ...progress }
        : (progress as ImportProgress),
    }));
  }, []);

  const setImportResults = useCallback((results: ImportResults | null) => {
    setState((prev) => ({ ...prev, importResults: results }));
  }, []);

  // Navigation methods
  const goToStep = useCallback((step: Step) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(4, prev.currentStep + 1) as Step,
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as Step,
    }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      credentials: prev.credentials, // Preserve credentials
    }));
  }, []);

  const value: WizardContextValue = {
    state,
    updateCredentials,
    setCsvFile,
    setCsvData,
    setSelectedProject,
    setImportMode,
    setNewModelConfig,
    setSelectedModel,
    setFieldMappings,
    updateImportProgress,
    setImportResults,
    goToStep,
    nextStep,
    previousStep,
    reset,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
};
