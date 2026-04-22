# Service Layer Architecture

## Overview

The service layer provides abstraction for business logic, API integration, and data processing. Services are independent of React components and can be tested in isolation.

**Service Organization**: `src/services/`

---

## Services

### 1. CSV Parser Service (`csvParser.ts`)

**Purpose**: Parse CSV files, detect data types, and extract structured data

**Responsibilities**:
- Parse CSV file using PapaParse library
- Detect data types for each column (text, number, date, boolean)
- Extract sample values for preview
- Handle various CSV formats (comma, semicolon, tab-delimited)
- Handle CSV files with/without headers
- Use Web Worker for large file processing (non-blocking)

**Interface**:

```typescript
interface CsvParserService {
  /**
   * Parse CSV file and return structured data
   * @param file - CSV file to parse
   * @param options - Parsing options
   * @returns Parsed CSV data with type detection
   */
  parseFile(file: File, options?: ParseOptions): Promise<CsvData>;

  /**
   * Detect data type for a column based on sample values
   * @param values - Array of values from the column
   * @returns Detected type (text, number, date, boolean)
   */
  detectFieldType(values: (string | null)[]): 'text' | 'number' | 'date' | 'boolean';

  /**
   * Validate CSV file before parsing
   * @param file - File to validate
   * @returns Validation result with errors if any
   */
  validateFile(file: File): ValidationResult;
}

interface ParseOptions {
  delimiter?: string; // auto-detect if not provided
  hasHeaders?: boolean; // default: true
  maxPreviewRows?: number; // default: 10
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

**Dependencies**:
- `papaparse` library for CSV parsing
- Web Worker API for background processing

---

### 2. CMS API Client Service (`cmsApi.ts`)

**Purpose**: Wrapper around `@reearth/cms-api` SDK with application-specific methods

**Responsibilities**:
- Initialize CMS SDK with user credentials
- Fetch projects, models, and schemas
- Create models and fields
- Import data items
- Handle API errors and retries
- Implement rate limiting (5-10 requests/sec)

**Interface**:

```typescript
interface CmsApiService {
  /**
   * Initialize the CMS API client
   * @param config - API configuration (API key, workspace ID, base URL)
   */
  initialize(config: CmsApiConfig): void;

  /**
   * Fetch all projects accessible to the user
   * @returns Array of projects
   */
  fetchProjects(): Promise<Project[]>;

  /**
   * Fetch all models in a project
   * @param projectId - Project ID or alias
   * @returns Array of models
   */
  fetchModels(projectId: string): Promise<Model[]>;

  /**
   * Fetch model details including schema
   * @param modelId - Model ID or key
   * @returns Model with schema
   */
  fetchModel(modelId: string): Promise<Model>;

  /**
   * Create a new model in a project
   * @param projectId - Project ID or alias
   * @param config - Model configuration (name, key, description)
   * @returns Created model with schema ID
   */
  createModel(projectId: string, config: CreateModelRequest): Promise<Model>;

  /**
   * Create a field in a model schema
   * @param projectId - Project ID or alias
   * @param schemaId - Schema ID
   * @param fieldConfig - Field configuration
   * @returns Created field
   */
  createField(
    projectId: string,
    schemaId: string,
    fieldConfig: CreateFieldRequest
  ): Promise<SchemaField>;

  /**
   * Create multiple fields in a model schema
   * @param projectId - Project ID or alias
   * @param schemaId - Schema ID
   * @param fieldsConfig - Array of field configurations
   * @returns Array of created fields
   */
  createFields(
    projectId: string,
    schemaId: string,
    fieldsConfig: CreateFieldRequest[]
  ): Promise<SchemaField[]>;

  /**
   * Import a single item to a model
   * @param modelId - Model ID or key
   * @param fields - Item fields data
   * @returns Created item
   */
  createItem(modelId: string, fields: ItemField[]): Promise<Item>;

  /**
   * Import multiple items with rate limiting
   * @param modelId - Model ID or key
   * @param items - Array of item field data
   * @param onProgress - Progress callback
   * @returns Import results
   */
  importItems(
    modelId: string,
    items: ItemField[][],
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResults>;
}

interface CmsApiConfig {
  apiKey: string;
  workspaceId: string;
  baseUrl?: string; // default: https://api.cms.reearth.io
}

interface CreateModelRequest {
  name: string;
  key: string;
  description?: string;
}

interface CreateFieldRequest {
  key: string;
  type: FieldType;
  required: boolean;
  multiple: boolean;
}

interface ItemField {
  key: string;
  value: string | number | boolean | null;
}

interface Item {
  id: string;
  modelId: string;
  fields: ItemField[];
}
```

**Dependencies**:
- `@reearth/cms-api` SDK
- `p-queue` for rate limiting

---

### 3. Field Mapper Service (`fieldMapper.ts`)

**Purpose**: Map CSV fields to Re:Earth CMS fields with type validation

**Responsibilities**:
- Transform CSV row data to CMS item fields
- Validate field type compatibility
- Provide type coercion where safe
- Generate compatibility warnings

**Interface**:

```typescript
interface FieldMapperService {
  /**
   * Map CSV row to CMS item fields based on mappings
   * @param csvRow - CSV row data
   * @param mappings - Field mapping configuration
   * @returns CMS item fields
   */
  mapRowToFields(csvRow: CsvRow, mappings: FieldMapping[]): ItemField[];

  /**
   * Check if CSV type is compatible with CMS field type
   * @param csvType - Detected CSV type
   * @param cmsType - Target CMS field type
   * @returns Compatibility result
   */
  checkTypeCompatibility(csvType: string, cmsType: FieldType): TypeCompatibility;

  /**
   * Coerce CSV value to match CMS field type
   * @param value - CSV value
   * @param targetType - Target CMS field type
   * @returns Coerced value or error
   */
  coerceValue(value: string | number | boolean | null, targetType: FieldType): CoercionResult;

  /**
   * Validate all mappings before import
   * @param csvData - CSV data with type information
   * @param mappings - Field mapping configuration
   * @param requiredFields - Required CMS fields that must be mapped
   * @returns Validation result with errors/warnings
   */
  validateMappings(
    csvData: CsvData,
    mappings: FieldMapping[],
    requiredFields: SchemaField[]
  ): MappingValidationResult;
}

interface TypeCompatibility {
  compatible: boolean;
  warning?: string;
  requiresCoercion: boolean;
}

interface CoercionResult {
  success: boolean;
  value?: string | number | boolean | null;
  error?: string;
}

interface MappingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

**Dependencies**: None

---

### 4. Import Service (`importService.ts`)

**Purpose**: Orchestrate the complete import process (model creation + data import)

**Responsibilities**:
- Coordinate model creation for "Create New Model" path
- Execute data import with progress tracking
- Handle errors and partial success scenarios
- Aggregate results

**Interface**:

```typescript
interface ImportService {
  /**
   * Execute complete import for "Create New Model" path
   * @param config - Import configuration
   * @param onProgress - Progress callback
   * @returns Import results
   */
  executeCreateNewImport(
    config: CreateNewImportConfig,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResults>;

  /**
   * Execute import for "Import to Existing Model" path
   * @param config - Import configuration
   * @param onProgress - Progress callback
   * @returns Import results
   */
  executeExistingModelImport(
    config: ExistingModelImportConfig,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResults>;
}

interface CreateNewImportConfig {
  projectId: string;
  modelConfig: NewModelConfig;
  csvData: CsvData;
}

interface ExistingModelImportConfig {
  modelId: string;
  fieldMappings: FieldMapping[];
  csvData: CsvData;
}
```

**Dependencies**:
- CmsApiService (for API calls)
- FieldMapperService (for data transformation)

---

### 5. Validator Service (`validators.ts`)

**Purpose**: Validation functions for inputs and data

**Responsibilities**:
- Validate API credentials
- Validate model names and keys
- Validate field configurations
- Provide reusable validation rules for React Hook Form

**Interface**:

```typescript
interface ValidatorService {
  /**
   * Validate API key format
   * @param apiKey - API key to validate
   * @returns Validation result
   */
  validateApiKey(apiKey: string): ValidationError | null;

  /**
   * Validate workspace ID format
   * @param workspaceId - Workspace ID to validate
   * @returns Validation result
   */
  validateWorkspaceId(workspaceId: string): ValidationError | null;

  /**
   * Validate model key (alphanumeric, no spaces)
   * @param key - Model key to validate
   * @returns Validation result
   */
  validateModelKey(key: string): ValidationError | null;

  /**
   * Validate field key (alphanumeric, no spaces)
   * @param key - Field key to validate
   * @returns Validation result
   */
  validateFieldKey(key: string): ValidationError | null;

  /**
   * React Hook Form validation rules
   */
  getRules(): {
    apiKey: RegisterOptions;
    workspaceId: RegisterOptions;
    modelKey: RegisterOptions;
    fieldKey: RegisterOptions;
  };
}

interface ValidationError {
  message: string;
}
```

**Dependencies**:
- `react-hook-form` types

---

### 6. Storage Service (`storage.ts`)

**Purpose**: Manage sessionStorage for credentials and state persistence

**Responsibilities**:
- Save/load API credentials from sessionStorage
- Clear credentials on logout/reset
- Handle storage errors gracefully

**Interface**:

```typescript
interface StorageService {
  /**
   * Save credentials to sessionStorage
   * @param credentials - API credentials
   */
  saveCredentials(credentials: WizardState['credentials']): void;

  /**
   * Load credentials from sessionStorage
   * @returns Saved credentials or null
   */
  loadCredentials(): WizardState['credentials'] | null;

  /**
   * Clear all saved data from sessionStorage
   */
  clear(): void;
}
```

**Dependencies**: Browser `sessionStorage` API

---

## Service Dependency Graph

```
Components
    ↓
ImportService
    ↓
    ├── CmsApiService ← SDK Integration
    │       ↓
    │   @reearth/cms-api
    │
    └── FieldMapperService
            ↓
        ValidatorService

CsvParserService (independent)
    ↓
PapaParse + Web Worker

StorageService (independent)
    ↓
sessionStorage API
```

---

## Service Instantiation

Services will be instantiated as singletons and provided via:
- **Option A**: Direct imports (simpler)
- **Option B**: Dependency injection (more testable)

**Recommended**: Direct imports for simplicity, mock in tests

```typescript
// src/services/index.ts
export const csvParser = new CsvParserService();
export const cmsApi = new CmsApiService();
export const fieldMapper = new FieldMapperService();
export const importService = new ImportService(cmsApi, fieldMapper);
export const validators = new ValidatorService();
export const storage = new StorageService();
```

---

## Error Handling Strategy

All services follow consistent error handling:

```typescript
class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage in services
try {
  const result = await apiCall();
  return result;
} catch (error) {
  throw new ServiceError(
    'API_ERROR',
    'Failed to fetch projects',
    { originalError: error }
  );
}
```

---

## Summary

**Total Services**: 6
- CsvParserService (CSV processing)
- CmsApiService (API integration)
- FieldMapperService (data transformation)
- ImportService (orchestration)
- ValidatorService (validation)
- StorageService (persistence)

**Design Principles**:
- Single Responsibility: Each service has one clear purpose
- Dependency Injection: Services can depend on other services
- Testability: Services are independent of React and can be unit tested
- Error Handling: Consistent error patterns across all services
- Type Safety: Full TypeScript interfaces for all service methods

**Note**: Detailed implementation logic will be defined during Code Generation phase. This design establishes the service architecture and contracts.
