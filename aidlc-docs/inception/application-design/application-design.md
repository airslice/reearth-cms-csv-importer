# Application Design - Re:Earth CMS CSV Importer

## Overview

This document consolidates the complete application design for the Re:Earth CMS CSV Importer. The application is a React 19+ single-page application (SPA) that enables users to import CSV data into Re:Earth CMS through a 4-step wizard interface.

**Design Documents**:
- `components.md` - Component hierarchy and responsibilities
- `component-methods.md` - Component interfaces and method signatures
- `services.md` - Service layer architecture
- `component-dependency.md` - Dependencies and data flow

---

## Architecture Summary

### Technology Stack

**Frontend Framework**:
- React 19+ with TypeScript
- Vite as build tool
- Tailwind CSS for styling

**Key Libraries**:
- `@reearth/cms-api` - Official Re:Earth CMS SDK
- `react-hook-form` - Form handling and validation
- `papaparse` - CSV parsing
- `p-queue` - Request rate limiting

**State Management**:
- React Context API (WizardContext)

**Build & Dev Tools**:
- Vite (development server + build)
- TypeScript (type safety)
- ESLint + Prettier (code quality)

---

## Folder Structure

```
src/
├── components/          # Shared/reusable components
│   ├── WizardProvider.tsx
│   ├── WizardContainer.tsx
│   ├── WizardStepper.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Button.tsx
│   ├── FileUpload.tsx
│   ├── Table.tsx
│   ├── ProgressBar.tsx
│   └── ...
│
├── steps/               # Step-specific components
│   ├── StepOne.tsx      # Welcome & Setup
│   ├── StepTwo.tsx      # Configure Import
│   ├── StepThree.tsx    # Import Process
│   └── StepFour.tsx     # Results
│
├── services/            # Business logic services
│   ├── csvParser.ts
│   ├── cmsApi.ts
│   ├── fieldMapper.ts
│   ├── importService.ts
│   ├── validators.ts
│   ├── storage.ts
│   └── index.ts
│
├── types/               # TypeScript interfaces
│   └── index.ts
│
├── hooks/               # Custom React hooks (if needed)
│   └── useWizard.ts
│
├── utils/               # Helper functions
│   └── formatters.ts
│
├── workers/             # Web Workers
│   └── csvParser.worker.ts
│
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles + Tailwind
```

---

## Component Architecture

### Component Hierarchy (Visual)

```
App
├── WizardProvider (Context)
└── WizardContainer
    ├── WizardStepper
    └── StepRouter
        ├── StepOne
        │   ├── WelcomeMessage
        │   ├── CredentialsForm
        │   │   └── Input (×3)
        │   └── FileUpload
        │       ├── DropZone
        │       └── FilePreview
        ├── StepTwo
        │   ├── CsvPreview (Table)
        │   ├── ProjectSelector
        │   ├── ImportModeToggle
        │   ├── CreateNewModelForm
        │   │   ├── Input (×2)
        │   │   └── FieldConfigTable
        │   └── ImportToExistingForm
        │       ├── ModelSelector
        │       └── FieldMappingTable
        ├── StepThree
        │   ├── ProgressBar
        │   ├── StatusMessage
        │   └── PhaseIndicator
        └── StepFour
            ├── ResultSummary
            ├── ErrorTable
            └── ActionButtons
```

**Total Components**: ~30
- Shared/Reusable: ~8
- Step Components: 4
- Sub-components: ~18

---

## Service Layer Architecture

### Services Overview

| Service | Purpose | Dependencies |
|---------|---------|--------------|
| **CsvParserService** | Parse CSV files, detect types | PapaParse, Web Worker |
| **CmsApiService** | Wrapper for @reearth/cms-api SDK | @reearth/cms-api, p-queue |
| **FieldMapperService** | Map CSV fields to CMS fields | None |
| **ImportService** | Orchestrate import process | CmsApi, FieldMapper |
| **ValidatorService** | Input validation | react-hook-form |
| **StorageService** | sessionStorage management | Browser API |

### Service Dependency Graph

```
Components
    ↓
ImportService
    ↓
    ├── CmsApiService → @reearth/cms-api SDK
    └── FieldMapperService → ValidatorService

CsvParserService → PapaParse + Web Worker
StorageService → sessionStorage
```

---

## Data Flow

### Wizard Flow Overview

```
User Input
    ↓
Component (StepOne/Two/Three/Four)
    ↓
Service Layer (parse, validate, API calls)
    ↓
WizardContext (state updates)
    ↓
Component Re-render (new data displayed)
```

### Step-by-Step Flow

**Step 1 → Step 2**:
1. User enters credentials (API key, workspace ID)
2. User uploads CSV file
3. CsvParser parses file → WizardContext stores csvData
4. Navigate to Step 2

**Step 2 → Step 3**:
1. CmsApi fetches projects → User selects project
2. User chooses import mode (Create New / Existing)
3. **If Create New**: User configures model name, key, fields
4. **If Existing**: CmsApi fetches models → User selects model → User maps fields
5. Field Mapper validates mappings
6. Navigate to Step 3

**Step 3 → Step 4**:
1. Import Service executes import
2. **If Create New**: Create model → Create fields → Import data
3. **If Existing**: Import data directly
4. Progress updates sent to WizardContext → UI updates in real-time
5. Import completes → Navigate to Step 4

**Step 4**:
1. Display results (success/errors)
2. User can download error report, import another CSV, or view in CMS

---

## State Management

### WizardContext State

```typescript
interface WizardState {
  // Navigation
  currentStep: 1 | 2 | 3 | 4;

  // Step 1
  credentials: { apiKey, workspaceId, baseUrl };
  csvFile: File | null;
  csvData: CsvData | null;

  // Step 2
  selectedProject: Project | null;
  importMode: 'createNew' | 'existing' | null;
  newModelConfig: NewModelConfig | null;
  selectedModel: Model | null;
  fieldMappings: FieldMapping[];

  // Step 3
  importProgress: ImportProgress | null;

  // Step 4
  importResults: ImportResults | null;
}
```

### Context Methods

- `updateCredentials()`
- `setCsvFile()`, `setCsvData()`
- `setSelectedProject()`, `setImportMode()`
- `setNewModelConfig()`, `setSelectedModel()`, `setFieldMappings()`
- `updateImportProgress()`, `setImportResults()`
- `goToStep()`, `nextStep()`, `previousStep()`, `reset()`

---

## Key Design Patterns

### 1. Wizard Pattern
- 4-step linear progression
- Step validation before proceeding
- Context-based state sharing
- Clear visual progress indicator

### 2. Service Layer Pattern
- Business logic separated from UI
- Services are framework-independent
- Testable in isolation
- Composable (ImportService uses CmsApi + FieldMapper)

### 3. Context Provider Pattern
- WizardProvider wraps entire app
- No prop drilling
- Single source of truth for wizard state
- Centralized state updates

### 4. Async Operation Pattern
- All API calls in services
- Loading/error states managed in components
- Progress callbacks for long-running operations
- Consistent error handling

### 5. Validation Pattern
- React Hook Form for form validation
- Validator service for reusable rules
- Field Mapper for type compatibility checking
- Pre-import validation in Step 2

---

## Component Responsibilities

### Shared Components

**WizardProvider**: Manage wizard state, provide context methods
**WizardStepper**: Display progress (Step 1/4, 2/4, etc.)
**Input/Select/Button**: Reusable form elements with validation
**FileUpload**: Handle drag-drop and file selection
**Table**: Generic table for CSV preview, field mapping, errors
**ProgressBar**: Visual progress indicator for import

### Step Components

**StepOne**: Credentials input, CSV upload, CSV analysis
**StepTwo**: Project selection, import mode selection, field configuration/mapping
**StepThree**: Import execution, progress tracking, status updates
**StepFour**: Results display, error reporting, next actions

---

## Service Responsibilities

**CsvParserService**:
- Parse CSV using PapaParse
- Detect field types (text, number, date, boolean)
- Use Web Worker for non-blocking parsing

**CmsApiService**:
- Initialize SDK with credentials
- Fetch projects, models, schemas
- Create models and fields
- Import items with rate limiting (5-10 req/sec)

**FieldMapperService**:
- Transform CSV rows to CMS item fields
- Check type compatibility (CSV type vs. CMS field type)
- Coerce values where safe
- Validate mappings before import

**ImportService**:
- Orchestrate complete import process
- Handle "Create New Model" path (create model + fields + import)
- Handle "Import to Existing" path (import only)
- Track progress and aggregate results

**ValidatorService**:
- Validate API credentials
- Validate model keys and field keys
- Provide React Hook Form validation rules

**StorageService**:
- Save/load credentials from sessionStorage
- Clear on reset

---

## Performance Considerations

### Web Worker for CSV Parsing
- Offload CSV parsing to background thread
- Keep UI responsive during large file processing
- Support files up to 50,000 rows

### API Rate Limiting
- Use p-queue to throttle requests
- Max 5-10 requests/second
- Prevents overwhelming Re:Earth CMS API

### Component Optimization
- `React.memo()` for expensive components (tables)
- `useMemo()` for expensive computations
- `useCallback()` for event handlers
- Lazy loading for step components

### Batch Progress Updates
- Update UI every 10-50 rows (not every row)
- Reduces re-render overhead during import

---

## Security Considerations

### Credential Storage
- Store API key and workspace ID in sessionStorage (not localStorage)
- Cleared when tab closes
- Never transmitted except to Re:Earth CMS API

### Input Validation
- Validate all user inputs (credentials, model names, field keys)
- Sanitize CSV data before display (prevent XSS)
- Validate field mappings before import

### API Security
- Use official @reearth/cms-api SDK (handles auth headers)
- No hardcoded credentials
- User provides their own API key

---

## Error Handling

### Error Types

**Validation Errors**: Invalid input (empty API key, invalid model key)
**File Errors**: Invalid CSV format, file too large
**API Errors**: 401 Unauthorized, 404 Not Found, 500 Server Error
**Network Errors**: Connection timeout, offline
**Import Errors**: Row-level failures (type mismatch, validation error)

### Error Handling Strategy

**User-Facing Errors**:
- Clear error messages displayed in UI
- Actionable guidance ("Check your API key", "Fix CSV format")
- Inline validation for forms

**Partial Success**:
- Allow import to continue even if some rows fail
- Track success/error counts
- Provide detailed error report for failed rows

**Recovery**:
- Retry failed API calls (with exponential backoff)
- Allow user to download error report and fix issues
- Graceful degradation (continue import despite errors)

---

## Testing Strategy

### Unit Tests

**Services**:
- CsvParser: Test CSV parsing, type detection
- FieldMapper: Test field mapping, type coercion
- Validators: Test validation rules

**Utilities**:
- Test helper functions, formatters

### Component Tests

**Shared Components**: Test Input, Select, Button, FileUpload in isolation

**Step Components**: Test each step's rendering and user interactions

### Integration Tests

**Wizard Flow**: Test complete flow from Step 1 → Step 4
**Import Process**: Test model creation + data import
**Error Scenarios**: Test error handling and recovery

### E2E Tests (Optional)

- Complete user journey: upload CSV → configure → import → view results
- Test both Create New and Import to Existing paths

---

## Non-Functional Requirements Mapping

### Performance (NFR-01)
- ✅ CSV parsing in Web Worker (non-blocking)
- ✅ Support up to 50,000 rows
- ✅ Client-side rate limiting (5-10 req/sec)

### Security (NFR-02)
- ✅ Secure credential storage (sessionStorage)
- ✅ Input validation (XSS prevention)
- ✅ No data leaves browser except to Re:Earth CMS API

### Usability (NFR-03)
- ✅ 4-step wizard with clear progress
- ✅ Inline validation and error messages
- ✅ Responsive design (Tailwind CSS)

### Reliability (NFR-04)
- ✅ Graceful error handling
- ✅ Partial import support
- ✅ Clear status updates

### Maintainability (NFR-05)
- ✅ Component-based architecture
- ✅ Service layer separation
- ✅ TypeScript for type safety
- ✅ Clear folder structure

---

## Deployment Architecture

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── csvParser.worker-[hash].js
└── ...
```

### Deployment Target

**Platform**: Vercel or Netlify (static hosting)
**Features**:
- Automatic HTTPS
- CDN distribution
- Git-based deployments
- Zero-config (Vite builds static assets)

---

## Development Workflow

### Setup

```bash
npm create vite@latest reearth-cms-csv-importer -- --template react-ts
cd reearth-cms-csv-importer
npm install
npm install @reearth/cms-api papaparse react-hook-form p-queue
npm install -D @types/papaparse tailwindcss
```

### Development

```bash
npm run dev  # Start dev server
```

### Build

```bash
npm run build  # Production build
npm run preview  # Preview production build
```

### Testing

```bash
npm run test  # Run tests
npm run lint  # Run linter
```

---

## Future Enhancements (Out of Scope for V1)

- Save import configurations for reuse
- Scheduled/automated imports
- CSV export from Re:Earth CMS
- Advanced CSV transformations (formulas, computed fields)
- Batch import from multiple CSV files
- Real-time collaboration features

---

## Summary

This application design provides:
- ✅ Clear component hierarchy (~30 components)
- ✅ Service layer with 6 services
- ✅ Type-safe interfaces with TypeScript
- ✅ Unidirectional data flow via Context
- ✅ Scalable and maintainable architecture
- ✅ Performance optimization strategies
- ✅ Comprehensive error handling
- ✅ All NFRs addressed

The design is ready for implementation in the Construction Phase.

**Next Stage**: Units Planning (break down into implementation units)
