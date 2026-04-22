# Component Methods & Interfaces

## Type Definitions

### Core Types

```typescript
// CSV Data Types
interface CsvRow {
  [key: string]: string | number | boolean | null;
}

interface CsvField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  sampleValues: (string | number | boolean | null)[];
}

interface CsvData {
  headers: string[];
  fields: CsvField[];
  rows: CsvRow[];
  rowCount: number;
}

// Re:Earth CMS Types (from SDK + our extensions)
interface Project {
  id: string;
  name: string;
  description?: string;
  alias?: string;
}

interface Model {
  id: string;
  name: string;
  key: string;
  description?: string;
  schemaId: string;
  schema?: Schema;
}

interface Schema {
  id: string;
  fields: SchemaField[];
}

interface SchemaField {
  id: string;
  key: string;
  name?: string;
  type: FieldType;
  required: boolean;
  multiple: boolean;
}

type FieldType =
  | 'text' | 'textArea' | 'richText' | 'markdown'
  | 'checkbox' | 'bool'
  | 'asset' | 'date'
  | 'select' | 'integer' | 'number'
  | 'reference' | 'url'
  | 'group' | 'tag'
  | 'geometryObject' | 'geometryEditor';

// Field Mapping Types
interface FieldMapping {
  csvField: string;
  targetFieldKey: string;
  targetFieldType: FieldType;
}

interface NewModelConfig {
  name: string;
  key: string;
  description?: string;
  fields: NewModelField[];
}

interface NewModelField {
  csvFieldName: string;
  key: string;
  type: FieldType;
  required: boolean;
  multiple: boolean;
}

// Wizard State
interface WizardState {
  currentStep: 1 | 2 | 3 | 4;
  credentials: {
    apiKey: string;
    workspaceId: string;
    baseUrl: string;
  };
  csvFile: File | null;
  csvData: CsvData | null;
  selectedProject: Project | null;
  importMode: 'createNew' | 'existing' | null;
  newModelConfig: NewModelConfig | null;
  selectedModel: Model | null;
  fieldMappings: FieldMapping[];
  importProgress: ImportProgress | null;
  importResults: ImportResults | null;
}

interface ImportProgress {
  phase: 'creatingModel' | 'importingData';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  currentMessage: string;
}

interface ImportResults {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

interface ImportError {
  rowNumber: number;
  rowData: CsvRow;
  errorMessage: string;
}
```

---

## Context & Providers

### WizardContext

```typescript
interface WizardContextValue {
  state: WizardState;
  updateCredentials: (credentials: Partial<WizardState['credentials']>) => void;
  setCsvFile: (file: File) => void;
  setCsvData: (data: CsvData) => void;
  setSelectedProject: (project: Project) => void;
  setImportMode: (mode: 'createNew' | 'existing') => void;
  setNewModelConfig: (config: NewModelConfig) => void;
  setSelectedModel: (model: Model) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  updateImportProgress: (progress: Partial<ImportProgress>) => void;
  setImportResults: (results: ImportResults) => void;
  goToStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

// Provider Component
interface WizardProviderProps {
  children: React.ReactNode;
}
```

---

## Step Components

### StepOne Props & Methods

```typescript
interface StepOneProps {
  // No props - uses context
}

// Component Methods (internal)
const StepOne: React.FC<StepOneProps> = () => {
  // Form handling
  const handleCredentialsSubmit = (data: CredentialsFormData) => void;
  const handleFileUpload = (file: File) => Promise<void>;
  const validateAndProceed = () => boolean;

  // Return JSX
};

interface CredentialsFormData {
  apiKey: string;
  workspaceId: string;
  baseUrl?: string;
}
```

### StepTwo Props & Methods

```typescript
interface StepTwoProps {
  // No props - uses context
}

// Component Methods (internal)
const StepTwo: React.FC<StepTwoProps> = () => {
  // Data fetching
  const fetchProjects = () => Promise<Project[]>;
  const fetchModels = (projectId: string) => Promise<Model[]>;
  const fetchModelSchema = (modelId: string) => Promise<Schema>;

  // Event handlers
  const handleProjectSelect = (project: Project) => void;
  const handleImportModeChange = (mode: 'createNew' | 'existing') => void;
  const handleNewModelSubmit = (config: NewModelConfig) => void;
  const handleModelSelect = (model: Model) => void;
  const handleFieldMappingChange = (mappings: FieldMapping[]) => void;

  // Validation
  const validateConfiguration = () => boolean;
  const checkRequiredFieldsMapped = () => boolean;

  // Return JSX
};
```

### StepThree Props & Methods

```typescript
interface StepThreeProps {
  // No props - uses context
}

// Component Methods (internal)
const StepThree: React.FC<StepThreeProps> = () => {
  // Import orchestration
  const startImport = () => Promise<void>;
  const createModel = () => Promise<string>; // Returns modelId
  const importData = (modelId: string) => Promise<ImportResults>;

  // Progress tracking
  const updateProgress = (processed: number, total: number, message: string) => void;

  // Return JSX
};
```

### StepFour Props & Methods

```typescript
interface StepFourProps {
  // No props - uses context
}

// Component Methods (internal)
const StepFour: React.FC<StepFourProps> = () => {
  // Actions
  const downloadErrorReport = () => void;
  const startNewImport = () => void;
  const viewInCms = () => void;

  // Return JSX
};
```

---

## Shared Components

### Input

```typescript
interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'url';
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  // React Hook Form integration
  register?: UseFormRegister<any>;
  validation?: RegisterOptions;
}
```

### Select

```typescript
interface SelectProps<T> {
  label: string;
  name: string;
  options: SelectOption<T>[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: T;
  onChange?: (value: T) => void;
  // React Hook Form integration
  control?: Control<any>;
}

interface SelectOption<T> {
  label: string;
  value: T;
  description?: string;
}
```

### Button

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}
```

### FileUpload

```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string; // e.g., '.csv'
  maxSize?: number; // in bytes
  error?: string;
}

// Component Methods
const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, maxSize, error }) => {
  const handleDrop = (e: React.DragEvent) => void;
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => void;
  const validateFile = (file: File) => boolean;

  // Return JSX
};
```

### Table

```typescript
interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
}
```

### ProgressBar

```typescript
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
}
```

---

## Form-Specific Components

### FieldConfigTable

```typescript
interface FieldConfigTableProps {
  csvFields: CsvField[];
  onConfigChange: (fields: NewModelField[]) => void;
  initialConfig?: NewModelField[];
}

// Component Methods
const FieldConfigTable: React.FC<FieldConfigTableProps> = ({ csvFields, onConfigChange }) => {
  const handleFieldToggle = (fieldName: string, included: boolean) => void;
  const handleFieldKeyChange = (fieldName: string, key: string) => void;
  const handleFieldTypeChange = (fieldName: string, type: FieldType) => void;
  const handleRequiredChange = (fieldName: string, required: boolean) => void;
  const handleMultipleChange = (fieldName: string, multiple: boolean) => void;

  // Return JSX
};
```

### FieldMappingTable

```typescript
interface FieldMappingTableProps {
  csvFields: CsvField[];
  modelFields: SchemaField[];
  onMappingChange: (mappings: FieldMapping[]) => void;
  initialMappings?: FieldMapping[];
}

// Component Methods
const FieldMappingTable: React.FC<FieldMappingTableProps> = ({ csvFields, modelFields, onMappingChange }) => {
  const handleMappingChange = (csvField: string, targetFieldKey: string) => void;
  const checkTypeCompatibility = (csvType: string, modelType: FieldType) => boolean;
  const getCompatibilityWarning = (csvType: string, modelType: FieldType) => string | null;

  // Return JSX
};
```

---

## Event Handler Patterns

### Common Patterns

```typescript
// Form submission
const handleSubmit = (data: FormData) => {
  // Validate
  // Update context
  // Proceed to next step or show errors
};

// Async data fetching with error handling
const fetchData = async () => {
  try {
    setLoading(true);
    const result = await service.getData();
    setState(result);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Field validation
const validateField = (value: string, rules: ValidationRules) => {
  // Check required
  // Check format
  // Return error message or null
};
```

---

## Summary

**Total Interfaces Defined**: ~30
- Core Types: 15
- Component Props: 12
- Helper/Utility Types: 3

**Key Patterns**:
- All step components use WizardContext (no prop drilling)
- Shared components accept props for reusability
- React Hook Form integration for form handling
- Consistent error handling patterns
- TypeScript for type safety throughout

**Note**: Detailed business logic (validation rules, transformation logic, etc.) will be defined in Functional Design stage (per-unit, during CONSTRUCTION phase). This design focuses on component structure and interfaces.
