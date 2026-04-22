import { useContext } from 'react';
import { WizardContext } from '@/components/WizardProvider';
import type { WizardContextValue } from '@/types';

/**
 * Custom hook to access Wizard context
 * Provides type-safe access to wizard state and methods
 */
export const useWizard = (): WizardContextValue => {
  const context = useContext(WizardContext);

  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }

  return context;
};
