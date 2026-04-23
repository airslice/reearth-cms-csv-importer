import { cmsApi } from './cmsApi';
import { fieldMapper } from './fieldMapper';
import type {
  NewModelConfig,
  FieldMapping,
  CsvData,
  ImportProgress,
  ImportResults,
  ImportError,
} from '@/types';

/**
 * Import Service
 * Orchestrates the complete import process (model creation + data import)
 */

export class ImportService {
  private abortController: AbortController | null = null;

  /**
   * Cancel the current import operation
   */
  cancelImport(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    // Clear any pending requests from the queue
    cmsApi.clearQueue();
  }

  /**
   * Execute complete import for "Create New Model" path
   */
  async executeCreateNewImport(
    projectId: string,
    modelConfig: NewModelConfig,
    csvData: CsvData,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResults> {
    // Create new abort controller for this import
    this.abortController = new AbortController();
    try {
      // Phase 1: Create model
      onProgress?.({
        phase: 'creatingModel',
        totalRows: csvData.rowCount,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        currentMessage: 'Creating model in Re:Earth CMS...',
      });

      const model = await cmsApi.createModel(projectId, {
        name: modelConfig.name,
        key: modelConfig.key,
        description: modelConfig.description,
      });

      if (!model.schemaId) {
        throw new Error('Model created but no schema ID returned');
      }

      // Phase 2: Create fields
      onProgress?.({
        phase: 'creatingFields',
        totalRows: csvData.rowCount,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        currentMessage: `Creating ${modelConfig.fields.length} fields...`,
      });

      await cmsApi.createFields(
        projectId,
        model.schemaId,
        modelConfig.fields
      );

      // Phase 3: Import data
      onProgress?.({
        phase: 'importingData',
        totalRows: csvData.rowCount,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        currentMessage: 'Starting data import...',
      });

      // Build field mappings from model config
      const mappings: FieldMapping[] = modelConfig.fields.map((field) => ({
        csvField: field.csvFieldName || field.key,
        csvType:
          csvData.fields.find(
            (f) => f.name === (field.csvFieldName || field.key)
          )?.type || 'text',
        targetField: field.key,
        targetType: field.type,
        skip: false,
      }));

      // Map rows to item fields
      const items = csvData.rows.map((row) =>
        fieldMapper.mapRowToFields(row, mappings)
      );

      // Import items with progress
      const results = await cmsApi.importItems(
        model.id,
        projectId,
        items,
        onProgress,
        this.abortController?.signal
      );

      return {
        ...results,
        modelId: model.id,
        modelName: model.name,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Check if it was cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          totalRows: csvData.rowCount,
          successCount: 0,
          errorCount: csvData.rowCount,
          errors: [
            {
              rowIndex: -1,
              rowData: {},
              error: 'Import cancelled by user',
            },
          ],
        };
      }

      return {
        success: false,
        totalRows: csvData.rowCount,
        successCount: 0,
        errorCount: csvData.rowCount,
        errors: [
          {
            rowIndex: -1,
            rowData: {},
            error: `Import failed: ${errorMessage}`,
          },
        ],
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Execute import for "Import to Existing Model" path
   */
  async executeExistingModelImport(
    modelId: string,
    projectId: string,
    fieldMappings: FieldMapping[],
    csvData: CsvData,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResults> {
    // Create new abort controller for this import
    this.abortController = new AbortController();

    try {
      // Start import
      onProgress?.({
        phase: 'importingData',
        totalRows: csvData.rowCount,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        currentMessage: 'Starting data import...',
      });

      // Map rows to item fields
      const items = csvData.rows.map((row) =>
        fieldMapper.mapRowToFields(row, fieldMappings)
      );

      // Import items with progress
      const results = await cmsApi.importItems(
        modelId,
        projectId,
        items,
        onProgress,
        this.abortController?.signal
      );

      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Check if it was cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          totalRows: csvData.rowCount,
          successCount: 0,
          errorCount: csvData.rowCount,
          errors: [
            {
              rowIndex: -1,
              rowData: {},
              error: 'Import cancelled by user',
            },
          ],
        };
      }

      return {
        success: false,
        totalRows: csvData.rowCount,
        successCount: 0,
        errorCount: csvData.rowCount,
        errors: [
          {
            rowIndex: -1,
            rowData: {},
            error: `Import failed: ${errorMessage}`,
          },
        ],
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Generate error report CSV
   */
  generateErrorReport(errors: ImportError[]): string {
    if (errors.length === 0) return '';

    // CSV header
    const headers = ['Row Index', 'Error', 'Row Data'];
    const rows = [headers.join(',')];

    // CSV rows
    for (const error of errors) {
      const rowData = JSON.stringify(error.rowData).replace(/"/g, '""');
      rows.push(
        `${error.rowIndex},"${error.error.replace(/"/g, '""')}","${rowData}"`
      );
    }

    return rows.join('\n');
  }
}

// Export singleton instance
export const importService = new ImportService();
