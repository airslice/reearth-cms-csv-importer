import React, { useState, useEffect } from 'react';
import { useWizard } from '@/hooks/useWizard';
import { Input, Select, Button } from '@/components';
import { cmsApi, validators } from '@/services';
import type { Project, Model, FieldMapping, CreateFieldRequest } from '@/types';

export const StepTwo: React.FC = () => {
  const { state, setSelectedProject, setImportMode, setNewModelConfig, setSelectedModel, setFieldMappings, nextStep, previousStep } = useWizard();

  const [projects, setProjects] = useState<Project[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState<string>();

  // New model config state
  const [modelName, setModelName] = useState('');
  const [modelKey, setModelKey] = useState('');
  const [fieldConfigs, setFieldConfigs] = useState<CreateFieldRequest[]>([]);

  // Field selection state for existing model import
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const fetchedProjects = await cmsApi.fetchProjects();
      setProjects(fetchedProjects);
      if (state.selectedProject) {
        const current = fetchedProjects.find(p => p.id === state.selectedProject!.id);
        if (current) setSelectedProject(current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
  };

  const handleModeChange = (mode: 'createNew' | 'existing') => {
    setImportMode(mode);
    // Load models for both modes - needed to check for duplicate keys in createNew mode
    if (state.selectedProject) {
      loadModels(state.selectedProject.id);
    }
  };

  const loadModels = async (projectId: string) => {
    setIsLoadingModels(true);
    try {
      const fetchedModels = await cmsApi.fetchModels(projectId);
      setModels(fetchedModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelChange = async (modelId: string) => {
    if (!state.selectedProject) return;

    try {
      const model = await cmsApi.fetchModel(modelId, state.selectedProject.id);
      setSelectedModel(model);

      // Auto-map fields
      if (model.schema && state.csvData) {
        const mappings: FieldMapping[] = state.csvData.fields.map(csvField => {
          const matchedField = model.schema!.fields.find(f => f.key === csvField.name);
          return {
            csvField: csvField.name,
            csvType: csvField.type,
            targetField: matchedField?.key || '',
            targetType: matchedField?.type || 'text',
            skip: !matchedField,
          };
        });
        setFieldMappings(mappings);

        // Initialize all matched fields as selected by default
        const matchedFields = new Set(
          mappings.filter(m => !m.skip).map(m => m.csvField)
        );
        setSelectedFields(matchedFields);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    }
  };

  const handleTargetFieldChange = (csvField: string, targetFieldKey: string) => {
    const targetField = state.selectedModel?.schema?.fields.find(f => f.key === targetFieldKey);
    if (!targetField) return;

    const updatedMappings = state.fieldMappings.map(mapping =>
      mapping.csvField === csvField
        ? {
            ...mapping,
            targetField: targetFieldKey,
            targetType: targetField.type,
            skip: false,
          }
        : mapping
    );
    setFieldMappings(updatedMappings);

    // Auto-select the field when user maps it
    if (targetFieldKey) {
      setSelectedFields(prev => new Set([...prev, csvField]));
    }
  };

  const handleFieldToggle = (csvField: string) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(csvField)) {
        newSet.delete(csvField);
        // Clear the target field when unchecking
        const updatedMappings = state.fieldMappings.map(mapping =>
          mapping.csvField === csvField
            ? { ...mapping, targetField: '', skip: true }
            : mapping
        );
        setFieldMappings(updatedMappings);
      } else {
        newSet.add(csvField);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all non-skipped fields
      const allFields = new Set(
        state.fieldMappings.filter(m => !m.skip).map(m => m.csvField)
      );
      setSelectedFields(allFields);
    } else {
      setSelectedFields(new Set());
    }
  };

  const handleNext = () => {
    if (state.importMode === 'createNew') {
      // Validate new model config
      if (!modelName || !modelKey) {
        setError('Model name and key are required');
        return;
      }

      const keyError = validators.validateModelKey(modelKey);
      if (keyError) {
        setError(keyError.message);
        return;
      }

      // Check if model key already exists
      const isDuplicateKey = models.some(
        m => m.key.toLowerCase() === modelKey.toLowerCase()
      );
      if (isDuplicateKey) {
        setError(`A model with the key "${modelKey}" already exists in this project. Please use a different key.`);
        return;
      }

      setNewModelConfig({
        name: modelName,
        key: modelKey,
        fields: fieldConfigs,
      });
    } else if (state.importMode === 'existing') {
      // Validate that at least one field is selected
      if (selectedFields.size === 0) {
        setError('Please select at least one field to import');
        return;
      }

      // Get selected mappings
      const selectedMappings = state.fieldMappings.filter(m => selectedFields.has(m.csvField));

      // Check that all selected fields have a target field
      const unmappedFields = selectedMappings.filter(m => !m.targetField);
      if (unmappedFields.length > 0) {
        setError(`Please select target fields for: ${unmappedFields.map(m => m.csvField).join(', ')}`);
        return;
      }

      // Check for duplicate target fields
      const targetFields = selectedMappings.map(m => m.targetField);
      const duplicates = targetFields.filter((field, index) => targetFields.indexOf(field) !== index);
      if (duplicates.length > 0) {
        setError(`Duplicate target fields detected: ${[...new Set(duplicates)].join(', ')}`);
        return;
      }

      // Update field mappings based on selected fields
      const updatedMappings = state.fieldMappings.map(mapping => ({
        ...mapping,
        skip: !selectedFields.has(mapping.csvField),
      }));
      setFieldMappings(updatedMappings);
    }

    setError(undefined);
    nextStep();
  };

  // Initialize field configs for new model
  useEffect(() => {
    if (state.importMode === 'createNew' && state.csvData && fieldConfigs.length === 0) {
      const configs: CreateFieldRequest[] = state.csvData.fields.map(field => ({
        key: field.name.toLowerCase().replace(/\s+/g, '_'),
        type: field.type === 'number' ? 'number' : field.type === 'boolean' ? 'bool' : field.type === 'date' ? 'date' : 'text',
        title: field.name,
        required: false,
        multiple: false,
        csvFieldName: field.name,
      }));
      setFieldConfigs(configs);
    }
  }, [state.importMode, state.csvData]);

  // Validate model key for duplicates (for new model creation)
  const [modelKeyError, setModelKeyError] = useState<string>();
  useEffect(() => {
    if (state.importMode === 'createNew' && modelKey) {
      const isDuplicateKey = models.some(
        m => m.key.toLowerCase() === modelKey.toLowerCase()
      );
      if (isDuplicateKey) {
        setModelKeyError(`Model key "${modelKey}" already exists`);
      } else {
        setModelKeyError(undefined);
      }
    } else {
      setModelKeyError(undefined);
    }
  }, [modelKey, models, state.importMode]);

  return (
    <div data-testid="step-two" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configure Import</h2>
        <p className="text-muted-foreground">
          Choose your target project and configure how to import your data
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Select
        label="Select Project"
        name="project"
        value={state.selectedProject?.id || ''}
        onChange={handleProjectChange}
        options={projects.map(p => ({ value: p.id, label: p.name }))}
        placeholder="Choose a project"
        disabled={isLoadingProjects}
        required
        data-testid="step-two-project-select"
      />

      {state.selectedProject && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Import Mode</label>
          <div className="flex gap-3">
            <Button
              variant={state.importMode === 'createNew' ? 'default' : 'outline'}
              onClick={() => handleModeChange('createNew')}
              data-testid="step-two-mode-create-new"
              className="flex-1"
            >
              Create New Model
            </Button>
            <Button
              variant={state.importMode === 'existing' ? 'default' : 'outline'}
              onClick={() => handleModeChange('existing')}
              data-testid="step-two-mode-existing"
              className="flex-1"
            >
              Import to Existing Model
            </Button>
          </div>
        </div>
      )}

      {state.importMode === 'createNew' && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h3 className="text-lg font-semibold">New Model Configuration</h3>
          <Input
            label="Model Name"
            name="modelName"
            value={modelName}
            onChange={setModelName}
            required
            data-testid="step-two-model-name"
          />
          <Input
            label="Model Key"
            name="modelKey"
            value={modelKey}
            onChange={setModelKey}
            error={modelKeyError}
            required
            data-testid="step-two-model-key"
          />
          <p className="text-sm text-muted-foreground">
            {fieldConfigs.length} fields will be created from CSV columns
          </p>
        </div>
      )}

      {state.importMode === 'existing' && (
        <div className="space-y-4">
          <Select
            label="Select Model"
            name="model"
            value={state.selectedModel?.id || ''}
            onChange={handleModelChange}
            options={models.map(m => ({ value: m.id, label: m.name }))}
            placeholder="Choose a model"
            disabled={isLoadingModels}
            required
            data-testid="step-two-model-select"
          />

          {state.selectedModel && state.fieldMappings.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold mb-3">Field Mappings</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Select fields to include and choose target mappings
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed" data-testid="step-two-field-mappings">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 px-2 w-[8%]">
                        <input
                          type="checkbox"
                          checked={selectedFields.size > 0 && selectedFields.size === state.fieldMappings.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="cursor-pointer"
                          aria-label="Select all fields"
                        />
                      </th>
                      <th className="text-left py-1.5 px-2 font-medium w-[30%]">CSV Field</th>
                      <th className="text-left py-1.5 px-2 font-medium w-[15%]">CSV Type</th>
                      <th className="text-left py-1.5 px-2 font-medium w-[47%]">Target Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.fieldMappings.map((mapping, index) => {
                      const isSelected = selectedFields.has(mapping.csvField);

                      // Check if this field's target is duplicated
                      const isDuplicate = isSelected &&
                        mapping.targetField &&
                        state.fieldMappings.some(
                          m => m.csvField !== mapping.csvField &&
                          selectedFields.has(m.csvField) &&
                          m.targetField === mapping.targetField
                        );

                      return (
                        <tr key={index} className={`border-b last:border-0 ${!isSelected ? 'opacity-40' : ''}`}>
                          <td className="py-1.5 px-2 w-[8%]">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleFieldToggle(mapping.csvField)}
                              className="cursor-pointer"
                              aria-label={`Include ${mapping.csvField}`}
                            />
                          </td>
                          <td className="py-1.5 px-2 w-[30%] truncate">{mapping.csvField}</td>
                          <td className="py-1.5 px-2 text-muted-foreground w-[15%]">{mapping.csvType}</td>
                          <td className="py-1.5 px-2 w-[47%]">
                            <Select
                              name={`target-${mapping.csvField}`}
                              value={mapping.targetField || undefined}
                              onChange={(value) => handleTargetFieldChange(mapping.csvField, value)}
                              options={
                                state.selectedModel?.schema?.fields.map(field => ({
                                  value: field.key,
                                  label: field.title || field.key,
                                })) || []
                              }
                              disabled={!isSelected}
                              className={isDuplicate ? 'border-2 border-red-500' : ''}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {selectedFields.size} field(s) selected for import
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={previousStep} data-testid="step-two-back">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            !state.selectedProject ||
            !state.importMode ||
            (state.importMode === 'createNew' && !!modelKeyError) ||
            (state.importMode === 'existing' && selectedFields.size === 0)
          }
          data-testid="step-two-next"
        >
          Start Import
        </Button>
      </div>
    </div>
  );
};
