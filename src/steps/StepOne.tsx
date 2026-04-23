import React, { useState } from 'react';
import { useWizard } from '@/hooks/useWizard';
import { Input, Button, FileUpload } from '@/components';
import { csvParser, validators, cmsApi } from '@/services';

export const StepOne: React.FC = () => {
  const { state, updateCredentials, setCsvFile, setCsvData, nextStep } =
    useWizard();

  const [errors, setErrors] = useState<{
    apiKey?: string;
    workspaceId?: string;
    file?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setErrors((prev) => ({ ...prev, file: undefined }));

    // Validate file
    const fileValidation = csvParser.validateFile(file);
    if (!fileValidation.valid) {
      setErrors((prev) => ({ ...prev, file: fileValidation.errors[0] }));
      return;
    }

    setCsvFile(file);

    // Parse CSV
    setIsLoading(true);
    try {
      const csvData = await csvParser.parseFile(file);

      // Validate parsed data
      const dataValidation = csvParser.validateParsedData(csvData);
      if (!dataValidation.valid) {
        setErrors((prev) => ({ ...prev, file: dataValidation.errors[0] }));
        setCsvFile(null);
        return;
      }

      setCsvData(csvData);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        file:
          error instanceof Error
            ? error.message
            : 'Failed to parse CSV file',
      }));
      setCsvFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Validate credentials
    const newErrors: typeof errors = {};

    const apiKeyError = validators.validateApiKey(state.credentials.apiKey);
    if (apiKeyError) {
      newErrors.apiKey = apiKeyError.message;
    }

    const workspaceIdError = validators.validateWorkspaceId(
      state.credentials.workspaceId
    );
    if (workspaceIdError) {
      newErrors.workspaceId = workspaceIdError.message;
    }

    if (!state.csvFile || !state.csvData) {
      newErrors.file = 'Please upload a CSV file';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Initialize CMS API
      cmsApi.initialize({
        apiKey: state.credentials.apiKey,
        workspaceId: state.credentials.workspaceId,
      });

      nextStep();
    }
  };

  return (
    <div data-testid="step-one" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome & Setup</h2>
        <p className="text-muted-foreground">
          Connect to your Re:Earth CMS and upload your CSV file to begin
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Before you start</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Connect an integration to your target workspace (with write access)</li>
            <li>Make sure your target project is ready</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Notes</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>It's intended as a playground or for small-scale use, so please avoid importing large datasets</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Re:Earth CMS Credentials</h3>
        <Input
          label="API Key"
          name="apiKey"
          type="password"
          placeholder="Enter your Re:Earth CMS API key"
          value={state.credentials.apiKey}
          onChange={(value) => {
            updateCredentials({ apiKey: value });
            setErrors((prev) => ({ ...prev, apiKey: undefined }));
          }}
          error={errors.apiKey}
          required
          data-testid="step-one-api-key"
        />

        <Input
          label="Workspace ID"
          name="workspaceId"
          placeholder="Enter your workspace ID or alias"
          value={state.credentials.workspaceId}
          onChange={(value) => {
            updateCredentials({ workspaceId: value });
            setErrors((prev) => ({ ...prev, workspaceId: undefined }));
          }}
          error={errors.workspaceId}
          required
          data-testid="step-one-workspace-id"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload CSV File</h3>
        <FileUpload
          onFileSelect={handleFileSelect}
          file={state.csvFile}
          error={errors.file}
          data-testid="step-one-file-upload"
        />
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Analyzing CSV file...</p>
        </div>
      )}

      {state.csvData && !isLoading && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold mb-2">CSV Preview</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {state.csvData.rowCount} rows, {state.csvData.headers.length} columns
          </p>
          <div className="text-sm text-muted-foreground">
            Fields:{' '}
            {state.csvData.fields.map((f) => `${f.name} (${f.type})`).join(', ')}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={isLoading}
          data-testid="step-one-next"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
