import type { CsvData, ParseOptions, ValidationResult } from '@/types';

/**
 * CSV Parser Service
 * Parses CSV files using Web Worker for non-blocking operation
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 50000;

export class CsvParserService {
  /**
   * Parse CSV file using Web Worker
   */
  async parseFile(
    file: File,
    options?: ParseOptions
  ): Promise<CsvData> {
    return new Promise((resolve, reject) => {
      // Create worker
      const worker = new Worker(
        new URL('../workers/csvParser.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Set up message handler
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.csvData);
        }
        worker.terminate();
      };

      // Set up error handler
      worker.onerror = (error) => {
        reject(new Error(`Worker error: ${error.message}`));
        worker.terminate();
      };

      // Send file to worker
      worker.postMessage({ file, options });
    });
  }

  /**
   * Validate CSV file before parsing
   */
  validateFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push('File must have a .csv extension');
    }

    // Check file size
    if (file.size === 0) {
      errors.push('File is empty');
    } else if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE / 1024 / 1024}MB)`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate CSV data after parsing
   */
  validateParsedData(csvData: CsvData): ValidationResult {
    const errors: string[] = [];

    // Check if data is empty
    if (csvData.rowCount === 0) {
      errors.push('CSV file contains no data rows');
    }

    // Check if headers exist
    if (csvData.headers.length === 0) {
      errors.push('CSV file contains no headers');
    }

    // Check row count limit
    if (csvData.rowCount > MAX_ROWS) {
      errors.push(
        `CSV file contains ${csvData.rowCount} rows, exceeding maximum allowed (${MAX_ROWS} rows)`
      );
    }

    // Check for duplicate headers
    const duplicateHeaders = csvData.headers.filter(
      (header, index) => csvData.headers.indexOf(header) !== index
    );
    if (duplicateHeaders.length > 0) {
      errors.push(
        `Duplicate headers found: ${duplicateHeaders.join(', ')}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const csvParser = new CsvParserService();
