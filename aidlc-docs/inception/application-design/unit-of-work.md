# Unit of Work - Re:Earth CMS CSV Importer

## Overview

This document defines the unit of work decomposition for the Re:Earth CMS CSV Importer. As a **single-page application (SPA)**, the application consists of one deployable unit with logical modules for organization.

---

## Unit Definition

### Unit: CSV Importer SPA

**Type**: Single-Page Application (Frontend)
**Deployment**: Static bundle via Vite → Vercel/Netlify
**Technology Stack**: React 19 + TypeScript + Vite + Tailwind CSS

**Purpose**: Complete CSV import workflow for Re:Earth CMS, enabling users to upload CSV files, configure import targets (new or existing models), and import data with real-time progress tracking.

---

## Unit Responsibilities

The CSV Importer SPA unit is responsible for:

### Core Features
1. **CSV File Processing** - Upload, parse, analyze CSV files with type detection
2. **API Integration** - Authenticate and interact with Re:Earth CMS API
3. **Wizard UI** - 4-step wizard interface with progress tracking
4. **Data Mapping** - Map CSV fields to CMS model fields with validation
5. **Model Management** - Create new models or select existing models
6. **Data Import** - Import CSV data to Re:Earth CMS with rate limiting
7. **Progress Tracking** - Real-time progress updates during import
8. **Error Handling** - Graceful error handling with detailed reporting
9. **Results Display** - Show import results with success/error statistics

### Non-Functional Responsibilities
- **Performance**: Handle up to 50,000 CSV rows without blocking UI (Web Workers)
- **Security**: Secure credential storage (sessionStorage), input validation, XSS prevention
- **Usability**: Clear 4-step wizard, inline validation, responsive design
- **Reliability**: Partial import support, detailed error reporting
- **Maintainability**: Clean separation of concerns, TypeScript type safety

---

## Module Organization

The unit is organized into logical modules within a single codebase:

### Module 1: Core Infrastructure
**Location**: `src/` (root level)
**Purpose**: Application entry point, routing, global configuration

**Components**:
- `main.tsx` - Application entry point
- `App.tsx` - Root component, wizard container
- `index.css` - Global styles, Tailwind imports

**Responsibilities**:
- Initialize React application
- Set up WizardProvider (context)
- Manage wizard step routing
- Apply global styles

---

### Module 2: Context & State Management
**Location**: `src/components/WizardProvider.tsx`
**Purpose**: Central state management for wizard flow

**Components**:
- `WizardProvider.tsx` - Context provider component
- `useWizard.ts` (in `src/hooks/`) - Custom hook for accessing wizard context

**State Shape** (from WizardContext):
```typescript
{
  currentStep: 1 | 2 | 3 | 4,
  credentials: { apiKey, workspaceId, baseUrl },
  csvFile: File | null,
  csvData: CsvData | null,
  selectedProject: Project | null,
  importMode: 'createNew' | 'existing' | null,
  newModelConfig: NewModelConfig | null,
  selectedModel: Model | null,
  fieldMappings: FieldMapping[],
  importProgress: ImportProgress | null,
  importResults: ImportResults | null
}
```

**Responsibilities**:
- Store wizard state across all steps
- Provide state update methods to components
- Manage navigation between steps
- Handle wizard reset

---

### Module 3: Shared Components
**Location**: `src/components/`
**Purpose**: Reusable UI components used across multiple steps

**Components** (~8 shared components):
- `WizardStepper.tsx` - Progress indicator (Step 1/4, 2/4, etc.)
- `WizardContainer.tsx` - Wrapper for wizard layout
- `Input.tsx` - Text input with validation
- `Select.tsx` - Dropdown select with validation
- `Button.tsx` - Button with variants (primary, secondary)
- `FileUpload.tsx` - Drag-drop file upload component
- `Table.tsx` - Generic data table component
- `ProgressBar.tsx` - Progress bar for import process

**Responsibilities**:
- Provide consistent UI patterns
- Handle common interactions (form inputs, file upload)
- Display data in tables
- Show progress indicators

---

### Module 4: Step Components
**Location**: `src/steps/`
**Purpose**: Step-specific wizard screens

**Components** (4 step components + ~18 sub-components):

#### StepOne.tsx (Welcome & Setup)
- `WelcomeMessage` - Introduction text
- `CredentialsForm` - API key + workspace ID inputs
- `FileUpload` - CSV file upload
- `FilePreview` - Show uploaded file info

#### StepTwo.tsx (Configure Import)
- `CsvPreview` - Display CSV data preview (Table)
- `ProjectSelector` - Select Re:Earth CMS project
- `ImportModeToggle` - Choose Create New vs. Existing Model
- `CreateNewModelForm` - Configure new model fields
  - `FieldConfigTable` - Configure field types, keys, flags
- `ImportToExistingForm` - Select existing model and map fields
  - `ModelSelector` - Select model from dropdown
  - `FieldMappingTable` - Map CSV fields to model fields

#### StepThree.tsx (Import Process)
- `ProgressBar` - Visual progress bar
- `StatusMessage` - Current status text
- `PhaseIndicator` - Show current phase (for Create New path)

#### StepFour.tsx (Results)
- `ResultSummary` - Success/failure summary with statistics
- `ErrorTable` - List of failed rows with error messages
- `ActionButtons` - Next action buttons (Import Another, View in CMS)

**Responsibilities**:
- Render step-specific UI
- Handle user input for each step
- Validate inputs before proceeding
- Communicate with services for data processing
- Update WizardContext state

---

### Module 5: Services Layer
**Location**: `src/services/`
**Purpose**: Business logic, API integration, data processing

**Services** (6 services):

#### 1. CsvParserService (`csvParser.ts`)
- Parse CSV files using PapaParse
- Detect field types (text, number, date, boolean)
- Use Web Worker for non-blocking parsing
- Support various CSV formats (comma, semicolon, tab)

#### 2. CmsApiService (`cmsApi.ts`)
- Wrapper for @reearth/cms-api SDK
- Initialize with user credentials
- Fetch projects, models, schemas
- Create models and fields
- Import items with rate limiting (5-10 req/sec via p-queue)

#### 3. FieldMapperService (`fieldMapper.ts`)
- Map CSV rows to CMS item fields
- Check type compatibility (CSV type vs. CMS field type)
- Coerce values where safe
- Validate mappings before import

#### 4. ImportService (`importService.ts`)
- Orchestrate complete import process
- Handle "Create New Model" path (create model + fields + import)
- Handle "Import to Existing" path (import only)
- Track progress and aggregate results

#### 5. ValidatorService (`validators.ts`)
- Validate API credentials
- Validate model keys and field keys
- Provide React Hook Form validation rules

#### 6. StorageService (`storage.ts`)
- Save/load credentials from sessionStorage
- Clear on reset

**Responsibilities**:
- Isolate business logic from UI
- Handle all API interactions
- Process and transform data
- Provide validation utilities
- Manage sessionStorage

---

### Module 6: Types & Interfaces
**Location**: `src/types/`
**Purpose**: TypeScript type definitions

**Files**:
- `index.ts` - Barrel export for all types

**Type Categories**:
- **Wizard Types**: WizardState, WizardContextValue, Step
- **CSV Types**: CsvData, CsvRow, CsvField, ParseOptions
- **CMS Types**: Project, Model, Schema, SchemaField, Item, ItemField
- **Mapping Types**: FieldMapping, NewModelConfig, CreateModelRequest, CreateFieldRequest
- **Progress Types**: ImportProgress, ImportResults, ImportError
- **Validation Types**: ValidationResult, ValidationError, TypeCompatibility

**Responsibilities**:
- Provide type safety across the application
- Document data structures
- Enable IntelliSense in IDEs

---

### Module 7: Utilities & Helpers
**Location**: `src/utils/`
**Purpose**: Helper functions and formatters

**Files**:
- `formatters.ts` - Format numbers, dates, file sizes
- (Additional utility files as needed)

**Responsibilities**:
- Provide reusable utility functions
- Format data for display
- Convert between data formats

---

### Module 8: Web Workers
**Location**: `src/workers/`
**Purpose**: Background processing for CPU-intensive tasks

**Workers**:
- `csvParser.worker.ts` - CSV parsing in background thread

**Responsibilities**:
- Offload CSV parsing to prevent UI blocking
- Support large CSV files (up to 50,000 rows)
- Post results back to main thread

---

## Code Organization Strategy

### Directory Structure

```
/Users/liubingyang/html/eukarya/reearth-cms-csv-importer/
├── src/
│   ├── components/          # Shared/reusable components (Module 3)
│   │   ├── WizardProvider.tsx
│   │   ├── WizardContainer.tsx
│   │   ├── WizardStepper.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Button.tsx
│   │   ├── FileUpload.tsx
│   │   ├── Table.tsx
│   │   ├── ProgressBar.tsx
│   │   └── index.ts         # Barrel export
│   │
│   ├── steps/               # Step-specific components (Module 4)
│   │   ├── StepOne.tsx
│   │   ├── StepTwo.tsx
│   │   ├── StepThree.tsx
│   │   ├── StepFour.tsx
│   │   └── index.ts         # Barrel export
│   │
│   ├── services/            # Business logic services (Module 5)
│   │   ├── csvParser.ts
│   │   ├── cmsApi.ts
│   │   ├── fieldMapper.ts
│   │   ├── importService.ts
│   │   ├── validators.ts
│   │   ├── storage.ts
│   │   └── index.ts         # Barrel export (singleton instances)
│   │
│   ├── types/               # TypeScript interfaces (Module 6)
│   │   └── index.ts
│   │
│   ├── hooks/               # Custom React hooks (Module 2)
│   │   └── useWizard.ts
│   │
│   ├── utils/               # Helper functions (Module 7)
│   │   ├── formatters.ts
│   │   └── index.ts         # Barrel export
│   │
│   ├── workers/             # Web Workers (Module 8)
│   │   └── csvParser.worker.ts
│   │
│   ├── App.tsx              # Root component (Module 1)
│   ├── main.tsx             # Entry point (Module 1)
│   └── index.css            # Global styles + Tailwind (Module 1)
│
├── public/                  # Static assets
├── aidlc-docs/              # AI-DLC documentation
├── docs/                    # Additional documentation
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## File Naming Patterns

### Components
- **Format**: PascalCase, e.g., `WizardStepper.tsx`
- **Sub-components**: Same file as parent or separate file if reusable
- **Barrel exports**: `index.ts` in each folder for clean imports

### Services
- **Format**: camelCase, e.g., `csvParser.ts`
- **Class or object**: Exported as singleton instance from `services/index.ts`

### Types
- **Format**: Centralized in `types/index.ts`
- **Interface naming**: PascalCase, e.g., `WizardState`, `CsvData`

### Utilities
- **Format**: camelCase, e.g., `formatters.ts`
- **Function naming**: camelCase, e.g., `formatFileSize()`, `formatDate()`

### Workers
- **Format**: camelCase with `.worker.ts` suffix, e.g., `csvParser.worker.ts`

---

## Import/Export Patterns

### Barrel Exports
Each module folder exports via `index.ts`:

```typescript
// src/components/index.ts
export { WizardProvider } from './WizardProvider';
export { WizardStepper } from './WizardStepper';
export { Input } from './Input';
// ... etc

// src/services/index.ts
export { csvParser } from './csvParser';
export { cmsApi } from './cmsApi';
export { fieldMapper } from './fieldMapper';
// ... etc
```

### Import Style
Components and services use barrel imports:

```typescript
// Good
import { WizardStepper, Input, Button } from '@/components';
import { csvParser, cmsApi } from '@/services';
import { WizardState, CsvData } from '@/types';

// Avoid direct imports (except for optimization)
import { WizardStepper } from '@/components/WizardStepper';
```

### Path Aliases
Configure Vite with path aliases:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  }
}
```

---

## Code Splitting Strategy

### Lazy-Loaded Step Components
Step components are lazy-loaded to optimize initial bundle size:

```typescript
// App.tsx
const StepOne = React.lazy(() => import('@/steps/StepOne'));
const StepTwo = React.lazy(() => import('@/steps/StepTwo'));
const StepThree = React.lazy(() => import('@/steps/StepThree'));
const StepFour = React.lazy(() => import('@/steps/StepFour'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  {currentStep === 1 && <StepOne />}
  {currentStep === 2 && <StepTwo />}
  {currentStep === 3 && <StepThree />}
  {currentStep === 4 && <StepFour />}
</Suspense>
```

### Separate Worker Bundle
Web Worker is bundled separately by Vite:

```typescript
// StepOne.tsx
const worker = new Worker(
  new URL('../workers/csvParser.worker.ts', import.meta.url),
  { type: 'module' }
);
```

### Vendor Chunk Splitting
Configure Vite to split vendor chunks:

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'cms-vendor': ['@reearth/cms-api'],
        'csv-vendor': ['papaparse'],
      }
    }
  }
}
```

---

## Testing Organization

### Service Tests
**Location**: `src/services/__tests__/`
**Pattern**: `<serviceName>.test.ts`

**Coverage**:
- csvParser.test.ts - CSV parsing, type detection
- cmsApi.test.ts - API wrapper methods (mocked API)
- fieldMapper.test.ts - Field mapping, type coercion
- importService.test.ts - Import orchestration
- validators.test.ts - Validation rules

### Component Tests
**Location**: `src/components/__tests__/`, `src/steps/__tests__/`
**Pattern**: `<ComponentName>.test.tsx`

**Coverage** (critical components only):
- FileUpload.test.tsx - File upload and validation
- FieldMappingTable.test.tsx - Field mapping UI
- StepOne.test.tsx - CSV upload and credentials
- StepTwo.test.tsx - Import configuration

### Test Utilities
**Location**: `src/test/`
**Files**:
- `setup.ts` - Test setup, mocks
- `fixtures.ts` - Sample data for tests
- `testUtils.tsx` - Custom render functions with providers

---

## Deployment Configuration

### Build Output
Vite generates the following structure:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js       # Main application bundle
│   ├── index-[hash].css      # Compiled Tailwind CSS
│   ├── react-vendor-[hash].js
│   ├── cms-vendor-[hash].js
│   ├── csv-vendor-[hash].js
│   ├── StepOne-[hash].js     # Lazy-loaded chunks
│   ├── StepTwo-[hash].js
│   ├── StepThree-[hash].js
│   ├── StepFour-[hash].js
│   └── csvParser.worker-[hash].js
└── favicon.ico
```

### Deployment Platforms
- **Primary**: Vercel (zero-config)
- **Alternative**: Netlify

**Deployment Features**:
- Automatic HTTPS
- CDN distribution
- Git-based deployments
- Environment variable support (for base URL config)

---

## Module Dependencies

### Internal Dependencies
- **Steps** depend on **Components** and **Services**
- **Services** are independent (except ImportService depends on CmsApi + FieldMapper)
- **Components** depend on **Types**
- **All modules** access **WizardContext** from Module 2

### External Dependencies
- `react` & `react-dom` (v19+)
- `@reearth/cms-api` (Re:Earth CMS SDK)
- `papaparse` (CSV parsing)
- `react-hook-form` (form validation)
- `p-queue` (rate limiting)
- `tailwindcss` (styling)
- `vite` (build tool)
- `typescript` (type checking)

---

## Summary

**Unit**: CSV Importer SPA (single deployable unit)
**Modules**: 8 logical modules for organization
**Components**: ~30 components (8 shared, 4 steps, 18 sub-components)
**Services**: 6 services for business logic
**Deployment**: Static bundle via Vite → Vercel/Netlify

**Key Architectural Principles**:
- ✅ Single unit of work (SPA)
- ✅ Clear module separation
- ✅ Service layer for business logic
- ✅ Context-based state management
- ✅ Code splitting for performance
- ✅ TypeScript for type safety
- ✅ Testing strategy defined

This unit structure supports the entire 4-step wizard workflow from CSV upload through import completion, with all 13 user stories implemented within a single, cohesive codebase.
