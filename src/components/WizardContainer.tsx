import React from 'react';
import { WizardStepper } from './WizardStepper';
import { useWizard } from '@/hooks/useWizard';
import { Card, CardContent } from './ui/card';

interface WizardContainerProps {
  children: React.ReactNode;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({ children }) => {
  const { state } = useWizard();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Re:Earth CMS CSV Importer
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Import your CSV data into Re:Earth CMS models
        </p>
        <WizardStepper
          currentStep={state.currentStep}
          data-testid="wizard-stepper"
        />
      </div>

      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  );
};
