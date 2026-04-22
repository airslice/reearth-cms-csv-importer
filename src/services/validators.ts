import type { ValidationError } from '@/types';

/**
 * Validator Service
 * Provides validation functions for inputs and data
 */

export class ValidatorService {
  /**
   * Validate API key format (non-empty string)
   */
  validateApiKey(apiKey: string): ValidationError | null {
    if (!apiKey || apiKey.trim() === '') {
      return { message: 'API key is required' };
    }

    if (apiKey.length < 10) {
      return { message: 'API key appears to be invalid (too short)' };
    }

    return null;
  }

  /**
   * Validate workspace ID format (non-empty string)
   */
  validateWorkspaceId(workspaceId: string): ValidationError | null {
    if (!workspaceId || workspaceId.trim() === '') {
      return { message: 'Workspace ID is required' };
    }

    return null;
  }

  /**
   * Validate model key (alphanumeric, underscores, hyphens, no spaces)
   */
  validateModelKey(key: string): ValidationError | null {
    if (!key || key.trim() === '') {
      return { message: 'Model key is required' };
    }

    // Must be alphanumeric with underscores and hyphens only
    const keyPattern = /^[a-zA-Z0-9_-]+$/;
    if (!keyPattern.test(key)) {
      return {
        message:
          'Model key must contain only letters, numbers, underscores, and hyphens',
      };
    }

    // Must start with a letter
    if (!/^[a-zA-Z]/.test(key)) {
      return { message: 'Model key must start with a letter' };
    }

    return null;
  }

  /**
   * Validate field key (same rules as model key)
   */
  validateFieldKey(key: string): ValidationError | null {
    return this.validateModelKey(key);
  }

  /**
   * Get React Hook Form validation rules
   */
  getRules() {
    return {
      apiKey: {
        required: 'API key is required',
        minLength: {
          value: 10,
          message: 'API key appears to be invalid (too short)',
        },
      },
      workspaceId: {
        required: 'Workspace ID is required',
      },
      modelKey: {
        required: 'Model key is required',
        pattern: {
          value: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
          message:
            'Model key must start with a letter and contain only letters, numbers, underscores, and hyphens',
        },
      },
      fieldKey: {
        required: 'Field key is required',
        pattern: {
          value: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
          message:
            'Field key must start with a letter and contain only letters, numbers, underscores, and hyphens',
        },
      },
      modelName: {
        required: 'Model name is required',
      },
    };
  }
}

// Export singleton instance
export const validators = new ValidatorService();
