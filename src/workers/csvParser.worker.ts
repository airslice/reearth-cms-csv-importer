import Papa from 'papaparse';
import type { CsvData, CsvField, CsvFieldType, CsvRow } from '@/types';

/**
 * CSV Parser Web Worker
 * Parses CSV files in background thread to avoid blocking main thread
 */

interface WorkerMessage {
  file: File;
  options?: {
    delimiter?: string;
    hasHeaders?: boolean;
    maxPreviewRows?: number;
  };
}

interface WorkerResponse {
  csvData?: CsvData;
  error?: string;
}

/**
 * Detect field type based on sample values
 */
function detectFieldType(values: (string | null)[]): CsvFieldType {
  const nonNullValues = values.filter((v) => v !== null && v !== '');

  if (nonNullValues.length === 0) return 'text';

  // Check if all values are boolean-like
  const booleanPattern = /^(true|false|yes|no|1|0)$/i;
  if (nonNullValues.every((v) => booleanPattern.test(String(v)))) {
    return 'boolean';
  }

  // Check if all values are numbers
  const numberPattern = /^-?\d+(\.\d+)?$/;
  if (nonNullValues.every((v) => numberPattern.test(String(v)))) {
    return 'number';
  }

  // Check if all values are dates (ISO 8601 or common formats)
  const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/;
  const datePatternAlt = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  if (
    nonNullValues.every(
      (v) => datePattern.test(String(v)) || datePatternAlt.test(String(v))
    )
  ) {
    return 'date';
  }

  // Default to text
  return 'text';
}

/**
 * Convert value based on detected type
 */
function convertValue(
  value: string,
  type: CsvFieldType
): string | number | boolean | null {
  if (value === null || value === '') return null;

  switch (type) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return /^(true|yes|1)$/i.test(value);
    case 'date':
    case 'text':
    default:
      return value;
  }
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { file, options = {} } = e.data;

  Papa.parse(file, {
    header: options.hasHeaders !== false, // Default true
    delimiter: options.delimiter, // Auto-detect if not specified
    skipEmptyLines: true,
    complete: (results) => {
      try {
        const headers: string[] = results.meta.fields || [];
        const rawRows = results.data as Record<string, string>[];

        // Limit rows for preview
        const maxRows = options.maxPreviewRows || 10;
        const previewRows = rawRows.slice(0, maxRows);

        // Detect field types
        const fields: CsvField[] = headers.map((header) => {
          const columnValues = rawRows
            .slice(0, 100) // Sample first 100 rows for type detection
            .map((row) => row[header]);

          const type = detectFieldType(columnValues);
          const sampleValues = previewRows.map((row) =>
            convertValue(row[header], type)
          );

          return {
            name: header,
            type,
            sampleValues,
          };
        });

        // Convert all rows
        const rows: CsvRow[] = rawRows.map((rawRow) => {
          const row: CsvRow = {};
          headers.forEach((header, index) => {
            row[header] = convertValue(rawRow[header], fields[index].type);
          });
          return row;
        });

        const csvData: CsvData = {
          headers,
          fields,
          rows,
          rowCount: rawRows.length,
        };

        const response: WorkerResponse = { csvData };
        self.postMessage(response);
      } catch (error) {
        const response: WorkerResponse = {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to parse CSV file',
        };
        self.postMessage(response);
      }
    },
    error: (error: Error) => {
      const response: WorkerResponse = {
        error: `CSV parsing error: ${error.message}`,
      };
      self.postMessage(response);
    },
  });
};
