import React from 'react';
import { useWizard } from '@/hooks/useWizard';
import { Button, Table } from '@/components';
import { importService } from '@/services';
import { formatNumber } from '@/utils';

export const StepFour: React.FC = () => {
  const { state, reset } = useWizard();
  const results = state.importResults;

  const handleDownloadErrors = () => {
    if (!results?.errors) return;

    const csv = importService.generateErrorReport(results.errors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAnother = () => {
    reset();
  };

  if (!results) {
    return <div data-testid="step-four">Loading results...</div>;
  }

  // Build CMS model URL
  const modelId = results.modelId || state.selectedModel?.id;
  const cmsModelUrl = modelId && state.selectedProject && state.credentials.workspaceId
    ? `https://cms.reearth.io/workspace/${state.credentials.workspaceId}/project/${state.selectedProject.id}/content/${modelId}`
    : null;

  return (
    <div data-testid="step-four" className="space-y-8">
      <div className="text-center">
        {results.success ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-500 mb-2">
              Import Successful!
            </h2>
            <p className="text-muted-foreground">
              All {formatNumber(results.successCount)} rows imported successfully
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">
              Import Completed with Errors
            </h2>
            <p className="text-muted-foreground">
              {formatNumber(results.successCount)} of {formatNumber(results.totalRows)} rows imported
            </p>
          </>
        )}
      </div>

      {results.success && cmsModelUrl && (
        <div className="flex justify-center">
          <a
            href={cmsModelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            data-testid="step-four-view-in-cms"
          >
            <span>View in Re:Earth CMS</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-muted-foreground text-sm mb-1">Total Rows</div>
          <div className="text-3xl font-bold">{formatNumber(results.totalRows)}</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-green-600 dark:text-green-500 text-sm mb-1">Successful</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-500">
            {formatNumber(results.successCount)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-destructive text-sm mb-1">Failed</div>
          <div className="text-3xl font-bold text-destructive">
            {formatNumber(results.errorCount)}
          </div>
        </div>
      </div>

      {results.errors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Error Details</h3>
          <div className="rounded-lg border bg-card p-4">
            <Table
              columns={[
                { key: 'rowIndex', label: 'Row' },
                { key: 'error', label: 'Error Message' },
              ]}
              data={results.errors.map(e => ({
                rowIndex: e.rowIndex + 1,
                error: e.error,
              }))}
              data-testid="step-four-errors"
            />
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 pt-4">
        {results.errors.length > 0 && (
          <Button
            variant="outline"
            onClick={handleDownloadErrors}
            data-testid="step-four-download-errors"
          >
            Download Error Report
          </Button>
        )}
        <Button onClick={handleImportAnother} data-testid="step-four-import-another">
          Import Another CSV
        </Button>
      </div>
    </div>
  );
};
