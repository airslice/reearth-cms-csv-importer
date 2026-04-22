import React from 'react';
import type { Step } from '@/types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
  currentStep: Step;
  'data-testid'?: string;
}

const steps = [
  { number: 1, name: 'Setup' },
  { number: 2, name: 'Configure' },
  { number: 3, name: 'Import' },
  { number: 4, name: 'Results' },
];

export const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  'data-testid': dataTestId,
}) => {
  return (
    <nav aria-label="Progress" data-testid={dataTestId}>
      <ol className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <li
            key={step.number}
            className="flex items-center"
            data-testid={`${dataTestId}-step-${step.number}`}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  currentStep === step.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep > step.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/25 bg-background text-muted-foreground'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <div className="ml-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    currentStep === step.number
                      ? 'text-primary'
                      : currentStep > step.number
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-4",
                  currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/25'
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
