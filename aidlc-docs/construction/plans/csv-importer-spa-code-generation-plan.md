# Code Generation Plan - CSV Importer SPA

## Overview

This document outlines the step-by-step plan for generating code for the CSV Importer SPA unit. This is a greenfield React 19 + Vite + TypeScript single-page application with no existing code.

**Unit**: CSV Importer SPA
**Project Type**: Greenfield
**Workspace Root**: `/Users/liubingyang/html/eukarya/reearth-cms-csv-importer`
**Code Location**: Workspace root (NOT aidlc-docs/)
**Total Stories**: 13 user stories (US-1.1 to US-4.3)

---

## Unit Context

### Stories Implemented by This Unit
All 13 user stories are implemented by this single unit:

**Step 1: Welcome & Setup**
- US-1.1: Provide API Credentials
- US-1.2: Upload CSV File
- US-1.3: Analyze CSV Structure

**Step 2: Configure Import**
- US-2.1: Select Project
- US-2.2: Choose Import Mode
- US-2.3: Configure New Model
- US-2.4: Select Existing Model
- US-2.5: Map CSV Fields to Model Fields

**Step 3: Import Process**
- US-3.1: Monitor Import Progress

**Step 4: Results**
- US-4.1: View Import Results
- US-4.2: Download Error Report
- US-4.3: Take Next Actions

### Dependencies
**External Dependencies** (npm packages):
- react@19+, react-dom@19+
- @reearth/cms-api (Re:Earth CMS SDK)
- papaparse (CSV parsing)
- react-hook-form (form validation)
- p-queue (rate limiting)
- tailwindcss (styling)
- vite (build tool)
- typescript (type checking)

**No Inter-Unit Dependencies** (single unit)

### Service Boundaries
- CsvParserService: CSV file parsing and type detection
- CmsApiService: Re:Earth CMS API integration
- FieldMapperService: CSV-to-CMS field mapping
- ImportService: Import orchestration
- ValidatorService: Input validation
- StorageService: sessionStorage management

---

## Code Generation Steps

### Phase 1: Project Setup

#### Step 1: Initialize Vite Project
- [x] Create Vite + React + TypeScript project structure
- [ ] Generate `package.json` with all dependencies
- [ ] Create `vite.config.ts` with path aliases and build configuration
- [ ] Create `tsconfig.json` with strict TypeScript settings
- [ ] Create `.gitignore` file

**Stories**: Infrastructure for all stories

---

#### Step 2: Configure Tailwind CSS
- [ ] Create `tailwind.config.js` with custom configuration
- [ ] Create `postcss.config.js`
- [ ] Update `src/index.css` with Tailwind imports

**Stories**: Infrastructure for all stories (UI styling)

---

#### Step 3: Create Directory Structure
- [ ] Create all module directories in `src/`:
  - `src/components/`
  - `src/steps/`
  - `src/services/`
  - `src/types/`
  - `src/hooks/`
  - `src/utils/`
  - `src/workers/`
- [ ] Create placeholder `index.ts` barrel exports where needed

**Stories**: Infrastructure for all stories

---

### Phase 2: Types & Interfaces (Module 6)

#### Step 4: Generate TypeScript Type Definitions
- [ ] Create `src/types/index.ts` with all interfaces:
  - Wizard types (WizardState, WizardContextValue)
  - CSV types (CsvData, CsvRow, CsvField, ParseOptions)
  - CMS types (Project, Model, Schema, SchemaField, Item, ItemField)
  - Mapping types (FieldMapping, NewModelConfig)
  - Progress types (ImportProgress, ImportResults, ImportError)
  - Validation types (ValidationResult, ValidationError, TypeCompatibility)

**Stories**: Type support for all 13 stories

---

### Phase 3: Utilities & Helpers (Module 7)

#### Step 5: Generate Utility Functions
- [ ] Create `src/utils/formatters.ts` with:
  - `formatFileSize()` - Format bytes to human-readable
  - `formatDate()` - Format dates
  - `formatNumber()` - Format numbers with commas
  - `formatDuration()` - Format milliseconds to duration
- [ ] Create `src/utils/index.ts` barrel export

**Stories**: US-1.2 (file size display), US-4.1 (statistics formatting)

---

### Phase 4: Web Workers (Module 8)

#### Step 6: Generate CSV Parser Web Worker
- [ ] Create `src/workers/csvParser.worker.ts`:
  - Import PapaParse
  - Handle file parsing messages
  - Detect field types (text, number, date, boolean)
  - Post results back to main thread

**Stories**: US-1.3 (CSV parsing in background)

---

### Phase 5: Services Layer (Module 5)

#### Step 7: Generate ValidatorService
- [ ] Create `src/services/validators.ts`:
  - `validateApiKey()` - Validate API key format
  - `validateWorkspaceId()` - Validate workspace ID format
  - `validateModelKey()` - Validate model key (alphanumeric, no spaces)
  - `validateFieldKey()` - Validate field key
  - `getRules()` - React Hook Form validation rules

**Stories**: US-1.1 (credentials validation), US-2.3 (model validation)

---

#### Step 8: Generate StorageService
- [ ] Create `src/services/storage.ts`:
  - `saveCredentials()` - Save to sessionStorage
  - `loadCredentials()` - Load from sessionStorage
  - `clear()` - Clear sessionStorage

**Stories**: US-1.1 (credential persistence), US-4.3 (reset)

---

#### Step 9: Generate CsvParserService
- [ ] Create `src/services/csvParser.ts`:
  - `parseFile()` - Parse CSV using Web Worker
  - `detectFieldType()` - Detect data types
  - `validateFile()` - Validate file extension and size

**Stories**: US-1.2 (file validation), US-1.3 (CSV parsing)

---

#### Step 10: Generate CmsApiService
- [ ] Create `src/services/cmsApi.ts`:
  - `initialize()` - Initialize @reearth/cms-api SDK
  - `fetchProjects()` - Fetch projects
  - `fetchModels()` - Fetch models for a project
  - `fetchModel()` - Fetch model with schema
  - `createModel()` - Create new model
  - `createField()` - Create single field
  - `createFields()` - Create multiple fields
  - `createItem()` - Import single item
  - `importItems()` - Import multiple items with rate limiting (p-queue)

**Stories**: US-2.1 (projects), US-2.3 (create model), US-2.4 (models), US-3.1 (import)

---

#### Step 11: Generate FieldMapperService
- [ ] Create `src/services/fieldMapper.ts`:
  - `mapRowToFields()` - Transform CSV row to CMS item fields
  - `checkTypeCompatibility()` - Check CSV type vs CMS field type
  - `coerceValue()` - Coerce values safely
  - `validateMappings()` - Validate all mappings

**Stories**: US-2.5 (field mapping validation), US-3.1 (data transformation)

---

#### Step 12: Generate ImportService
- [ ] Create `src/services/importService.ts`:
  - `executeCreateNewImport()` - Create model + import data
  - `executeExistingModelImport()` - Import to existing model
  - Progress tracking with callbacks
  - Error aggregation

**Stories**: US-3.1 (import orchestration), US-4.1 (results)

---

#### Step 13: Create Services Barrel Export
- [ ] Create `src/services/index.ts`:
  - Instantiate all services as singletons
  - Export instances

**Stories**: All stories (service access)

---

### Phase 6: Context & State Management (Module 2)

#### Step 14: Generate WizardProvider
- [ ] Create `src/components/WizardProvider.tsx`:
  - Define WizardContext
  - Implement state management
  - Implement all context methods:
    - `updateCredentials()`, `setCsvFile()`, `setCsvData()`
    - `setSelectedProject()`, `setImportMode()`
    - `setNewModelConfig()`, `setSelectedModel()`, `setFieldMappings()`
    - `updateImportProgress()`, `setImportResults()`
    - `goToStep()`, `nextStep()`, `previousStep()`, `reset()`
  - Load credentials from StorageService on mount

**Stories**: All 13 stories (state management)

---

#### Step 15: Generate useWizard Hook
- [ ] Create `src/hooks/useWizard.ts`:
  - Export custom hook to access WizardContext
  - Type-safe context access

**Stories**: All stories (context access)

---

### Phase 7: Shared Components (Module 3)

#### Step 16: Generate Input Component
- [ ] Create `src/components/Input.tsx`:
  - Text input with validation support
  - Error message display
  - Tailwind styling
  - `data-testid` attributes

**Stories**: US-1.1 (credentials), US-2.3 (model config)

---

#### Step 17: Generate Select Component
- [ ] Create `src/components/Select.tsx`:
  - Dropdown select with validation
  - Tailwind styling
  - `data-testid` attributes

**Stories**: US-2.1 (project), US-2.4 (model), US-2.5 (field mapping)

---

#### Step 18: Generate Button Component
- [ ] Create `src/components/Button.tsx`:
  - Primary, secondary, danger variants
  - Loading state support
  - Tailwind styling
  - `data-testid` attributes

**Stories**: All steps (navigation, actions)

---

#### Step 19: Generate FileUpload Component
- [ ] Create `src/components/FileUpload.tsx`:
  - Drag-and-drop support
  - File picker fallback
  - File preview display
  - Validation feedback
  - Tailwind styling
  - `data-testid` attributes

**Stories**: US-1.2 (CSV upload)

---

#### Step 20: Generate Table Component
- [ ] Create `src/components/Table.tsx`:
  - Generic data table
  - Column headers
  - Row rendering
  - Empty state
  - Tailwind styling
  - `data-testid` attributes

**Stories**: US-1.3 (CSV preview), US-2.5 (field mapping), US-4.1 (errors)

---

#### Step 21: Generate ProgressBar Component
- [ ] Create `src/components/ProgressBar.tsx`:
  - Progress percentage display
  - Visual bar
  - Tailwind styling
  - `data-testid` attributes

**Stories**: US-3.1 (import progress)

---

#### Step 22: Generate WizardStepper Component
- [ ] Create `src/components/WizardStepper.tsx`:
  - Display current step (Step 1/4, 2/4, etc.)
  - Visual step indicators
  - Tailwind styling
  - `data-testid` attributes

**Stories**: All steps (navigation indicator)

---

#### Step 23: Generate WizardContainer Component
- [ ] Create `src/components/WizardContainer.tsx`:
  - Wrapper layout for wizard
  - Header with stepper
  - Content area
  - Tailwind styling

**Stories**: All steps (layout)

---

#### Step 24: Create Components Barrel Export
- [ ] Create `src/components/index.ts`:
  - Export all shared components

**Stories**: All stories

---

### Phase 8: Step Components (Module 4)

#### Step 25: Generate StepOne Component
- [ ] Create `src/steps/StepOne.tsx`:
  - Welcome message
  - Credentials form (API key, workspace ID, base URL inputs)
  - CSV file upload
  - CSV analysis trigger
  - Form validation with react-hook-form
  - Next button with validation
  - `data-testid` attributes

**Stories**: US-1.1, US-1.2, US-1.3

---

#### Step 26: Generate StepTwo Component
- [ ] Create `src/steps/StepTwo.tsx`:
  - CSV preview table
  - Project selector (fetches projects on mount)
  - Import mode toggle (Create New / Existing Model)
  - Conditional rendering:
    - If "Create New": Show CreateNewModelForm
    - If "Existing": Show ImportToExistingForm
  - Next button with validation
  - Back button
  - `data-testid` attributes
- [ ] Implement CreateNewModelForm sub-component:
  - Model name, key, description inputs
  - Field configuration table (select CSV fields, configure types, required, multiple)
- [ ] Implement ImportToExistingForm sub-component:
  - Model selector (fetches models)
  - Field mapping table (map CSV fields to model fields)
  - Type compatibility warnings

**Stories**: US-2.1, US-2.2, US-2.3, US-2.4, US-2.5

---

#### Step 27: Generate StepThree Component
- [ ] Create `src/steps/StepThree.tsx`:
  - Auto-start import on mount
  - Progress bar
  - Status message (current phase and row count)
  - Phase indicator (for Create New path)
  - Call ImportService with progress callback
  - Auto-navigate to Step 4 on completion
  - `data-testid` attributes

**Stories**: US-3.1

---

#### Step 28: Generate StepFour Component
- [ ] Create `src/steps/StepFour.tsx`:
  - Result summary (success/failure icon, statistics)
  - Error table (if errors exist)
  - Download error report button
  - Action buttons:
    - Import Another CSV (calls reset)
    - View in Re:Earth CMS (opens URL if available)
  - `data-testid` attributes

**Stories**: US-4.1, US-4.2, US-4.3

---

#### Step 29: Create Steps Barrel Export
- [ ] Create `src/steps/index.ts`:
  - Export all step components with lazy loading support

**Stories**: All stories

---

### Phase 9: Core Infrastructure (Module 1)

#### Step 30: Generate App Component
- [ ] Create `src/App.tsx`:
  - Wrap with WizardProvider
  - Render WizardContainer
  - Render WizardStepper
  - Lazy load step components (React.lazy)
  - Suspense with loading fallback
  - Route based on currentStep from context

**Stories**: All stories (application shell)

---

#### Step 31: Generate Main Entry Point
- [ ] Create `src/main.tsx`:
  - Import React and ReactDOM
  - Import App component
  - Render App to DOM
  - Import index.css

**Stories**: All stories (application entry)

---

#### Step 32: Generate Global Styles
- [ ] Create `src/index.css`:
  - Tailwind imports (@tailwind base, components, utilities)
  - Custom global styles if needed
  - Reset styles

**Stories**: All stories (global styling)

---

### Phase 10: Testing

#### Step 33: Generate Service Tests
- [ ] Create `src/services/__tests__/validators.test.ts`:
  - Test all validation functions
- [ ] Create `src/services/__tests__/csvParser.test.ts`:
  - Test CSV parsing with sample data
  - Test type detection
- [ ] Create `src/services/__tests__/fieldMapper.test.ts`:
  - Test field mapping
  - Test type compatibility checks
- [ ] Create `src/services/__tests__/importService.test.ts`:
  - Test import orchestration (mocked API)

**Stories**: Testing support for all stories

---

#### Step 34: Generate Component Tests
- [ ] Create `src/components/__tests__/FileUpload.test.tsx`:
  - Test file upload and validation
- [ ] Create `src/steps/__tests__/StepOne.test.tsx`:
  - Test credentials form
  - Test CSV upload flow

**Stories**: Testing for US-1.1, US-1.2

---

#### Step 35: Create Test Setup
- [ ] Create `src/test/setup.ts`:
  - Vitest configuration
  - Global mocks (sessionStorage, File API)
- [ ] Create `src/test/fixtures.ts`:
  - Sample CSV data
  - Sample CMS responses
- [ ] Create `src/test/testUtils.tsx`:
  - Custom render function with WizardProvider

**Stories**: Testing infrastructure

---

### Phase 11: Configuration Files

#### Step 36: Generate Vitest Configuration
- [ ] Create `vitest.config.ts`:
  - Test environment: jsdom
  - Setup files
  - Coverage configuration

**Stories**: Testing infrastructure

---

#### Step 37: Generate ESLint Configuration
- [ ] Create `.eslintrc.cjs`:
  - React plugin
  - TypeScript rules
  - Recommended rules

**Stories**: Code quality

---

#### Step 38: Generate Public Assets
- [ ] Create `public/favicon.ico` (placeholder)
- [ ] Create `index.html`:
  - Root div with id="root"
  - Title: "Re:Earth CMS CSV Importer"
  - Meta tags

**Stories**: Application assets

---

### Phase 12: Documentation

#### Step 39: Generate README
- [ ] Create `README.md`:
  - Project description
  - Features list
  - Installation instructions
  - Development commands
  - Build and deployment instructions
  - Tech stack
  - Project structure overview

**Stories**: Documentation for all features

---

#### Step 40: Generate Code Documentation
- [ ] Create `aidlc-docs/construction/csv-importer-spa/code/architecture-summary.md`:
  - Architecture overview
  - Module summary
  - Data flow diagrams
  - Service layer summary
- [ ] Create `aidlc-docs/construction/csv-importer-spa/code/implementation-notes.md`:
  - Implementation decisions
  - Key patterns used
  - Performance optimizations
  - Security considerations

**Stories**: Internal documentation

---

## Completion Criteria

- [ ] All 40 steps marked as [x]
- [ ] All 13 user stories implemented
- [ ] All code generated in workspace root (NOT aidlc-docs/)
- [ ] All tests created (will be executed in Build & Test phase)
- [ ] Configuration files complete
- [ ] Documentation complete
- [ ] Application ready for build and verification

---

## Story Traceability

| Story ID | Implemented In Steps |
|----------|---------------------|
| US-1.1 | Steps 7, 8, 14, 16, 25 |
| US-1.2 | Steps 5, 9, 19, 25 |
| US-1.3 | Steps 6, 9, 25 |
| US-2.1 | Steps 10, 17, 26 |
| US-2.2 | Steps 26 |
| US-2.3 | Steps 7, 10, 16, 17, 26 |
| US-2.4 | Steps 10, 17, 26 |
| US-2.5 | Steps 11, 17, 20, 26 |
| US-3.1 | Steps 10, 11, 12, 21, 27 |
| US-4.1 | Steps 5, 12, 20, 28 |
| US-4.2 | Steps 9, 18, 28 |
| US-4.3 | Steps 8, 14, 18, 28 |

---

## Notes

- **Greenfield Project**: No existing code to modify
- **Single Unit**: All code in one workspace root
- **Code Location**: `/Users/liubingyang/html/eukarya/reearth-cms-csv-importer/src/` (application code)
- **Documentation Location**: `aidlc-docs/construction/csv-importer-spa/code/` (markdown only)
- **Testing**: Tests created but not executed (Build & Test phase)
- **Automation-Friendly**: All interactive elements have `data-testid` attributes
