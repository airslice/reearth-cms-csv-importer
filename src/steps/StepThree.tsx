import React, { useEffect, useState, useRef } from 'react';
import { useWizard } from '@/hooks/useWizard';
import { ProgressBar, Button } from '@/components';
import { importService } from '@/services';

export const StepThree: React.FC = () => {
  const { state, updateImportProgress, setImportResults, nextStep, previousStep } = useWizard();
  const [error, setError] = useState<string>();
  const [isCancelling, setIsCancelling] = useState(false);
  const importStartedRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (importStartedRef.current) return;
    importStartedRef.current = true;
    cancelledRef.current = false;
    executeImport();
  }, []);

  const handleCancel = () => {
    cancelledRef.current = true;
    setIsCancelling(true);
    importService.cancelImport();
    // Go back to step 2 immediately
    previousStep();
  };

  const executeImport = async () => {
    if (!state.csvData) return;

    try {
      let results;

      if (state.importMode === 'createNew' && state.newModelConfig && state.selectedProject) {
        results = await importService.executeCreateNewImport(
          state.selectedProject.id,
          state.newModelConfig,
          state.csvData,
          (progress) => updateImportProgress(progress)
        );
      } else if (state.importMode === 'existing' && state.selectedModel && state.selectedProject) {
        results = await importService.executeExistingModelImport(
          state.selectedModel.id,
          state.selectedProject.id,
          state.fieldMappings,
          state.csvData,
          (progress) => updateImportProgress(progress)
        );
      } else {
        throw new Error('Invalid import configuration');
      }

      // Only proceed if not cancelled
      if (!cancelledRef.current) {
        setImportResults(results);
        setTimeout(() => nextStep(), 1500);
      }
    } catch (err) {
      // Check if it was cancelled
      if (err instanceof Error && err.message === 'Import cancelled by user') {
        // Don't show error for user-initiated cancellation
        return;
      }
      // Only show error if not cancelled
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : 'Import failed');
      }
    }
  };

  const progress = state.importProgress;

  return (
    <div data-testid="step-three" className="text-center space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Importing Data</h2>
        <p className="text-muted-foreground">
          Please wait while we import your data
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {progress && (
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <div className="text-4xl mb-3">
              {progress.phase === 'creatingModel' ? '📝' : progress.phase === 'creatingFields' ? '🔧' : '📊'}
            </div>
            <p className="text-lg font-semibold mb-2">
              {progress.currentMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              Phase: {progress.phase === 'creatingModel' ? 'Creating Model' : progress.phase === 'creatingFields' ? 'Creating Fields' : 'Importing Data'}
            </p>
          </div>

          <ProgressBar
            current={progress.processedRows}
            total={progress.totalRows}
            label="Import Progress"
            data-testid="step-three-progress"
          />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-green-600 dark:text-green-500 font-medium mb-1">Success</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{progress.successCount}</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-destructive font-medium mb-1">Errors</div>
              <div className="text-2xl font-bold text-destructive">{progress.errorCount}</div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
              data-testid="step-three-cancel"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Import'}
            </Button>
          </div>
        </div>
      )}

      {!progress && !error && (
        <div className="py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Initializing import...</p>
        </div>
      )}
    </div>
  );
};
