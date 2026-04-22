import React, { Suspense, lazy } from 'react';
import { WizardProvider } from './components/WizardProvider';
import { WizardContainer } from './components';
import { useWizard } from './hooks/useWizard';

// Lazy load step components
const StepOne = lazy(() => import('./steps/StepOne').then(m => ({ default: m.StepOne })));
const StepTwo = lazy(() => import('./steps/StepTwo').then(m => ({ default: m.StepTwo })));
const StepThree = lazy(() => import('./steps/StepThree').then(m => ({ default: m.StepThree })));
const StepFour = lazy(() => import('./steps/StepFour').then(m => ({ default: m.StepFour })));

const WizardContent: React.FC = () => {
  const { state } = useWizard();

  return (
    <WizardContainer>
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      }>
        {state.currentStep === 1 && <StepOne />}
        {state.currentStep === 2 && <StepTwo />}
        {state.currentStep === 3 && <StepThree />}
        {state.currentStep === 4 && <StepFour />}
      </Suspense>
    </WizardContainer>
  );
};

function App() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}

export default App;
