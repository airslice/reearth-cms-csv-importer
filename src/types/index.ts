// ============================================================================
// Wizard Types
// ============================================================================

export type Step = 1 | 2 | 3 | 4;

export interface Credentials {
  apiKey: string;
  workspaceId: string;
}

export interface WizardState {
  // Navigation
  currentStep: Step;

  // Step 1 Data
  credentials: Credentials;
  csvFile: File | null;
  csvData: CsvData | null;

  // Step 2 Data
  selectedProject: Project | null;
  importMode: 'createNew' | 'existing' | null;
  newModelConfig: NewModelConfig | null;
  selectedModel: Model | null;
  fieldMappings: FieldMapping[];

  // Step 3 Data
  importProgress: ImportProgress | null;

  // Step 4 Data
  importResults: ImportResults | null;
}

export interface WizardContextValue {
  state: WizardState;

  // Step 1 methods
  updateCredentials: (credentials: Partial<Credentials>) => void;
  setCsvFile: (file: File | null) => void;
  setCsvData: (data: CsvData | null) => void;

  // Step 2 methods
  setSelectedProject: (project: Project | null) => void;
  setImportMode: (mode: 'createNew' | 'existing' | null) => void;
  setNewModelConfig: (config: NewModelConfig | null) => void;
  setSelectedModel: (model: Model | null) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;

  // Step 3 methods
  updateImportProgress: (progress: Partial<ImportProgress>) => void;
  setImportResults: (results: ImportResults | null) => void;

  // Navigation methods
  goToStep: (step: Step) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

// ============================================================================
// CSV Types
// ============================================================================

export type CsvFieldType = 'text' | 'number' | 'date' | 'boolean';

export interface CsvField {
  name: string;
  type: CsvFieldType;
  sampleValues: (string | number | boolean | null)[];
}

export interface CsvRow {
  [key: string]: string | number | boolean | null;
}

export interface CsvData {
  headers: string[];
  fields: CsvField[];
  rows: CsvRow[];
  rowCount: number;
}

export interface ParseOptions {
  delimiter?: string;
  hasHeaders?: boolean;
  maxPreviewRows?: number;
}

// ============================================================================
// Re:Earth CMS Types
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  alias?: string;
}

export type FieldType =
  | 'text'
  | 'textArea'
  | 'richText'
  | 'markdown'
  | 'checkbox'
  | 'asset'
  | 'date'
  | 'bool'
  | 'select'
  | 'integer'
  | 'number'
  | 'reference'
  | 'url'
  | 'group'
  | 'tag'
  | 'geometryObject'
  | 'geometryEditor';

export interface SchemaField {
  id: string;
  key: string;
  type: FieldType;
  title?: string;
  description?: string;
  required: boolean;
  multiple: boolean;
  unique?: boolean;
}

export interface Schema {
  id: string;
  fields: SchemaField[];
}

export interface Model {
  id: string;
  name: string;
  key: string;
  description?: string;
  schema?: Schema;
  schemaId?: string;
}

export interface ItemField {
  key: string;
  value: string | number | boolean | null;
}

export interface Item {
  id: string;
  modelId: string;
  fields: ItemField[];
}

// ============================================================================
// Field Mapping Types
// ============================================================================

export interface FieldMapping {
  csvField: string;
  csvType: CsvFieldType;
  targetField: string;
  targetType: FieldType;
  skip?: boolean;
}

export interface NewModelConfig {
  name: string;
  key: string;
  description?: string;
  fields: CreateFieldRequest[];
}

export interface CreateModelRequest {
  name: string;
  key: string;
  description?: string;
}

export interface CreateFieldRequest {
  key: string;
  type: FieldType;
  title?: string;
  description?: string;
  required: boolean;
  multiple: boolean;
  csvFieldName?: string; // Link back to CSV field
}

// ============================================================================
// Import Progress & Results Types
// ============================================================================

export type ImportPhase = 'creatingModel' | 'creatingFields' | 'importingData';

export interface ImportProgress {
  phase: ImportPhase;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  currentMessage: string;
}

export interface ImportError {
  rowIndex: number;
  rowData: CsvRow;
  error: string;
}

export interface ImportResults {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  modelId?: string;
  modelName?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationError {
  message: string;
}

export interface TypeCompatibility {
  compatible: boolean;
  warning?: string;
  requiresCoercion: boolean;
}

export interface CoercionResult {
  success: boolean;
  value?: string | number | boolean | null;
  error?: string;
}

export interface MappingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// CMS API Configuration
// ============================================================================

export interface CmsApiConfig {
  apiKey: string;
  workspaceId: string;
  baseUrl?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

export interface SelectProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'default' | 'outline' | 'destructive' | 'ghost' | 'link';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'data-testid'?: string;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  'data-testid'?: string;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  'data-testid'?: string;
}
