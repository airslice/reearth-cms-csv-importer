import type {
  CsvRow,
  CsvFieldType,
  ItemField,
  FieldMapping,
  FieldType,
  TypeCompatibility,
  CoercionResult,
  MappingValidationResult,
  CsvData,
  SchemaField,
} from '@/types';

/**
 * Field Mapper Service
 * Maps CSV fields to CMS fields with type validation and coercion
 */

export class FieldMapperService {
  /**
   * Map CSV row to CMS item fields based on mappings
   */
  mapRowToFields(csvRow: CsvRow, mappings: FieldMapping[]): ItemField[] {
    const fields: ItemField[] = [];

    for (const mapping of mappings) {
      if (mapping.skip) continue;

      const csvValue = csvRow[mapping.csvField];
      const coerced = this.coerceValue(csvValue, mapping.targetType);

      if (coerced.success) {
        fields.push({
          key: mapping.targetField,
          value: coerced.value!,
        });
      } else {
        // If coercion fails, use null or skip
        fields.push({
          key: mapping.targetField,
          value: null,
        });
      }
    }

    return fields;
  }

  /**
   * Check if CSV type is compatible with CMS field type
   */
  checkTypeCompatibility(
    csvType: CsvFieldType,
    cmsType: FieldType
  ): TypeCompatibility {
    // Direct matches
    if (
      (csvType === 'text' && cmsType === 'text') ||
      (csvType === 'text' && cmsType === 'textArea') ||
      (csvType === 'text' && cmsType === 'markdown') ||
      (csvType === 'text' && cmsType === 'richText') ||
      (csvType === 'number' && cmsType === 'number') ||
      (csvType === 'number' && cmsType === 'integer') ||
      (csvType === 'boolean' && cmsType === 'bool') ||
      (csvType === 'date' && cmsType === 'date')
    ) {
      return {
        compatible: true,
        requiresCoercion: false,
      };
    }

    // Compatible with coercion
    if (csvType === 'text' && cmsType === 'url') {
      return {
        compatible: true,
        requiresCoercion: true,
        warning: 'Text will be validated as URL',
      };
    }

    if (csvType === 'number' && cmsType === 'text') {
      return {
        compatible: true,
        requiresCoercion: true,
        warning: 'Number will be converted to text',
      };
    }

    if (csvType === 'boolean' && cmsType === 'text') {
      return {
        compatible: true,
        requiresCoercion: true,
        warning: 'Boolean will be converted to text',
      };
    }

    if (csvType === 'date' && cmsType === 'text') {
      return {
        compatible: true,
        requiresCoercion: true,
        warning: 'Date will be converted to text',
      };
    }

    // Text can be coerced to most types (with risk)
    if (csvType === 'text') {
      return {
        compatible: true,
        requiresCoercion: true,
        warning: `Text may not always be valid ${cmsType}`,
      };
    }

    // Incompatible
    return {
      compatible: false,
      requiresCoercion: false,
      warning: `${csvType} cannot be converted to ${cmsType}`,
    };
  }

  /**
   * Coerce CSV value to match CMS field type
   */
  coerceValue(
    value: string | number | boolean | null,
    targetType: FieldType
  ): CoercionResult {
    // Null values are always valid
    if (value === null || value === '') {
      return { success: true, value: null };
    }

    try {
      switch (targetType) {
        case 'text':
        case 'textArea':
        case 'richText':
        case 'markdown':
        case 'url':
        case 'select':
        case 'tag':
          return { success: true, value: String(value) };

        case 'integer':
          if (typeof value === 'number') {
            return { success: true, value: Math.floor(value) };
          }
          const intValue = parseInt(String(value), 10);
          if (isNaN(intValue)) {
            return { success: false, error: 'Cannot convert to integer' };
          }
          return { success: true, value: intValue };

        case 'number':
          if (typeof value === 'number') {
            return { success: true, value };
          }
          const numValue = parseFloat(String(value));
          if (isNaN(numValue)) {
            return { success: false, error: 'Cannot convert to number' };
          }
          return { success: true, value: numValue };

        case 'bool':
          if (typeof value === 'boolean') {
            return { success: true, value };
          }
          const strValue = String(value).toLowerCase();
          if (['true', 'yes', '1'].includes(strValue)) {
            return { success: true, value: true };
          }
          if (['false', 'no', '0'].includes(strValue)) {
            return { success: true, value: false };
          }
          return { success: false, error: 'Cannot convert to boolean' };

        case 'date':
          if (typeof value === 'string') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              return { success: false, error: 'Invalid date format' };
            }
            return { success: true, value: date.toISOString() };
          }
          return { success: false, error: 'Cannot convert to date' };

        default:
          // For complex types (asset, reference, group, checkbox), pass through as string
          return { success: true, value: String(value) };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Coercion failed',
      };
    }
  }

  /**
   * Validate all mappings before import
   */
  validateMappings(
    _csvData: CsvData,
    mappings: FieldMapping[],
    requiredFields: SchemaField[]
  ): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check that all required CMS fields are mapped
    for (const requiredField of requiredFields.filter((f) => f.required)) {
      const isMapped = mappings.some(
        (m) => m.targetField === requiredField.key && !m.skip
      );

      if (!isMapped) {
        errors.push(
          `Required field "${requiredField.key}" is not mapped`
        );
      }
    }

    // Check type compatibility for all mappings
    for (const mapping of mappings) {
      if (mapping.skip) continue;

      const compatibility = this.checkTypeCompatibility(
        mapping.csvType,
        mapping.targetType
      );

      if (!compatibility.compatible) {
        errors.push(
          `Field "${mapping.csvField}" (${mapping.csvType}) cannot be mapped to "${mapping.targetField}" (${mapping.targetType})`
        );
      } else if (compatibility.warning) {
        warnings.push(
          `Field "${mapping.csvField}" → "${mapping.targetField}": ${compatibility.warning}`
        );
      }
    }

    // Check for duplicate target fields
    const targetFields = mappings
      .filter((m) => !m.skip)
      .map((m) => m.targetField);
    const duplicates = targetFields.filter(
      (field, index) => targetFields.indexOf(field) !== index
    );

    if (duplicates.length > 0) {
      errors.push(
        `Duplicate target fields: ${[...new Set(duplicates)].join(', ')}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Export singleton instance
export const fieldMapper = new FieldMapperService();
