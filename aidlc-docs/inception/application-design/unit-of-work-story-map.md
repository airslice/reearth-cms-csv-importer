# Unit of Work Story Map - Re:Earth CMS CSV Importer

## Overview

This document maps all 13 user stories to the CSV Importer SPA unit and identifies which modules implement each story. Since this is a single-page application, all stories are implemented within one unit with different modules responsible for different aspects.

---

## Story Assignment to Unit

**Unit**: CSV Importer SPA
**Total Stories**: 13
**Assignment**: All 13 stories implemented within this single unit

| Story ID | Story Title | Assigned to Unit |
|----------|-------------|------------------|
| US-1.1 | Provide API Credentials | CSV Importer SPA |
| US-1.2 | Upload CSV File | CSV Importer SPA |
| US-1.3 | Analyze CSV Structure | CSV Importer SPA |
| US-2.1 | Select Project | CSV Importer SPA |
| US-2.2 | Choose Import Mode | CSV Importer SPA |
| US-2.3 | Configure New Model | CSV Importer SPA |
| US-2.4 | Select Existing Model | CSV Importer SPA |
| US-2.5 | Map CSV Fields to Model Fields | CSV Importer SPA |
| US-3.1 | Monitor Import Progress | CSV Importer SPA |
| US-4.1 | View Import Results | CSV Importer SPA |
| US-4.2 | Download Error Report | CSV Importer SPA |
| US-4.3 | Take Next Actions | CSV Importer SPA |

**Coverage**: ✅ 100% - All stories assigned to the single unit

---

## Story-to-Module Mapping

### Module Legend
- **M1**: Core Infrastructure
- **M2**: Context & State Management
- **M3**: Shared Components
- **M4**: Step Components
- **M5**: Services Layer
- **M6**: Types & Interfaces
- **M7**: Utilities & Helpers
- **M8**: Web Workers

---

## Step 1: Welcome & Setup

### US-1.1: Provide API Credentials

**Story**: As a user, I want to input my Re:Earth CMS API key and Workspace ID, so that the application can authenticate and access my CMS instance.

**Implementing Modules**:
- **M4 (Step Components)**: `StepOne.tsx` → `CredentialsForm` component
- **M3 (Shared Components)**: `Input.tsx` for text input fields
- **M3 (Shared Components)**: `Button.tsx` for submit button
- **M5 (Services)**: `validators.ts` for credential validation
- **M5 (Services)**: `storage.ts` for saving to sessionStorage
- **M2 (Context)**: Stores credentials in WizardState
- **M6 (Types)**: `Credentials` interface

**Data Flow**:
```
User enters API key/workspace ID
    ↓
CredentialsForm (M4) validates via validators (M5)
    ↓
Updates Context (M2) via updateCredentials()
    ↓
StorageService (M5) saves to sessionStorage
```

---

### US-1.2: Upload CSV File

**Story**: As a user, I want to upload a CSV file via drag-and-drop or file picker, so that I can import my data into Re:Earth CMS.

**Implementing Modules**:
- **M4 (Step Components)**: `StepOne.tsx` → `FileUpload` component (or uses M3)
- **M3 (Shared Components)**: `FileUpload.tsx` component with drag-drop support
- **M5 (Services)**: `validators.ts` for file validation (extension, size)
- **M2 (Context)**: Stores csvFile in WizardState
- **M6 (Types)**: File type
- **M7 (Utilities)**: `formatFileSize()` for display

**Data Flow**:
```
User uploads file (drag-drop or click)
    ↓
FileUpload (M3) validates file via validators (M5)
    ↓
StepOne (M4) updates Context (M2) via setCsvFile()
    ↓
File stored in state, ready for parsing
```

---

### US-1.3: Analyze CSV Structure

**Story**: As a user, I want to automatically analyze my CSV file's structure, so that I can see the fields and sample data before configuring the import.

**Implementing Modules**:
- **M4 (Step Components)**: `StepOne.tsx` triggers CSV parsing
- **M5 (Services)**: `csvParser.ts` for CSV parsing and type detection
- **M8 (Web Workers)**: `csvParser.worker.ts` for background parsing
- **M3 (Shared Components)**: `Table.tsx` for CSV preview display
- **M2 (Context)**: Stores csvData in WizardState
- **M6 (Types)**: `CsvData`, `CsvField`, `CsvRow` interfaces

**Data Flow**:
```
User uploads CSV file (US-1.2)
    ↓
StepOne (M4) calls csvParser.parseFile() (M5)
    ↓
CsvParser spawns Web Worker (M8) with PapaParse
    ↓
Worker parses CSV, detects types, returns data
    ↓
StepOne (M4) updates Context (M2) via setCsvData()
    ↓
CSV preview displayed in Table (M3)
```

---

## Step 2: Configure Import

### US-2.1: Select Project

**Story**: As a user, I want to select which Re:Earth CMS project to import data into, so that my data goes to the correct location.

**Implementing Modules**:
- **M4 (Step Components)**: `StepTwo.tsx` → `ProjectSelector` component
- **M3 (Shared Components)**: `Select.tsx` for dropdown
- **M5 (Services)**: `cmsApi.ts` for fetching projects
- **M2 (Context)**: Stores selectedProject in WizardState
- **M6 (Types)**: `Project` interface

**Data Flow**:
```
StepTwo (M4) mounts
    ↓
Calls cmsApi.fetchProjects() (M5)
    ↓
CmsApi uses @reearth/cms-api SDK to fetch projects
    ↓
Projects displayed in Select (M3)
    ↓
User selects project
    ↓
StepTwo (M4) updates Context (M2) via setSelectedProject()
```

---

### US-2.2: Choose Import Mode

**Story**: As a user, I want to choose between creating a new model or importing to an existing model, so that I can either set up new data structures or add to existing ones.

**Implementing Modules**:
- **M4 (Step Components)**: `StepTwo.tsx` → `ImportModeToggle` component
- **M3 (Shared Components)**: `Button.tsx` or custom toggle buttons
- **M2 (Context)**: Stores importMode in WizardState
- **M6 (Types)**: `'createNew' | 'existing'` type

**Data Flow**:
```
User views import mode options
    ↓
ImportModeToggle (M4) displays two options
    ↓
User clicks one option
    ↓
StepTwo (M4) updates Context (M2) via setImportMode()
    ↓
UI conditionally renders CreateNewModelForm or ImportToExistingForm
```

---

### US-2.3: Configure New Model (Create New Model Path)

**Story**: As a user, I want to specify the name and structure for a new model, so that I can create a custom data model based on my CSV fields.

**Implementing Modules**:
- **M4 (Step Components)**: `StepTwo.tsx` → `CreateNewModelForm` component
- **M4 (Step Components)**: `FieldConfigTable` sub-component for field configuration
- **M3 (Shared Components)**: `Input.tsx`, `Select.tsx`, checkboxes for field config
- **M3 (Shared Components)**: `Table.tsx` for field configuration table
- **M5 (Services)**: `validators.ts` for model key validation
- **M2 (Context)**: Stores newModelConfig in WizardState
- **M6 (Types)**: `NewModelConfig`, `CreateFieldRequest` interfaces

**Data Flow**:
```
User chooses "Create New Model" (US-2.2)
    ↓
CreateNewModelForm (M4) renders
    ↓
User configures model name, key, and fields via Input/Select (M3)
    ↓
FieldConfigTable (M4) displays CSV fields with configuration options
    ↓
validators.validateModelKey() (M5) validates model key
    ↓
StepTwo (M4) updates Context (M2) via setNewModelConfig()
```

---

### US-2.4: Select Existing Model (Import to Existing Model Path)

**Story**: As a user, I want to select an existing model from my project, so that I can import CSV data into an already-defined structure.

**Implementing Modules**:
- **M4 (Step Components)**: `StepTwo.tsx` → `ImportToExistingForm` component
- **M4 (Step Components)**: `ModelSelector` sub-component
- **M3 (Shared Components)**: `Select.tsx` for model dropdown
- **M5 (Services)**: `cmsApi.ts` for fetching models and model schema
- **M2 (Context)**: Stores selectedModel in WizardState
- **M6 (Types)**: `Model`, `Schema`, `SchemaField` interfaces

**Data Flow**:
```
User chooses "Import to Existing Model" (US-2.2)
    ↓
ImportToExistingForm (M4) mounts
    ↓
Calls cmsApi.fetchModels(projectId) (M5)
    ↓
Models displayed in Select (M3)
    ↓
User selects model
    ↓
Calls cmsApi.fetchModel(modelId) to get schema (M5)
    ↓
StepTwo (M4) updates Context (M2) via setSelectedModel()
```

---

### US-2.5: Map CSV Fields to Model Fields (Import to Existing Model Path)

**Story**: As a user, I want to map my CSV fields to the existing model's fields, so that data is imported into the correct fields.

**Implementing Modules**:
- **M4 (Step Components)**: `StepTwo.tsx` → `ImportToExistingForm` component
- **M4 (Step Components)**: `FieldMappingTable` sub-component
- **M3 (Shared Components)**: `Table.tsx`, `Select.tsx` for mapping table
- **M5 (Services)**: `fieldMapper.ts` for validation and compatibility checks
- **M2 (Context)**: Stores fieldMappings in WizardState
- **M6 (Types)**: `FieldMapping`, `TypeCompatibility` interfaces

**Data Flow**:
```
User has selected existing model (US-2.4)
    ↓
FieldMappingTable (M4) displays CSV fields and model fields
    ↓
User maps each CSV field to a model field via Select (M3)
    ↓
fieldMapper.checkTypeCompatibility() (M5) validates mappings
    ↓
fieldMapper.validateMappings() (M5) ensures required fields mapped
    ↓
StepTwo (M4) updates Context (M2) via setFieldMappings()
```

---

## Step 3: Import Process

### US-3.1: Monitor Import Progress

**Story**: As a user, I want to see real-time progress while my data is being imported, so that I know the import is working and how long it will take.

**Implementing Modules**:
- **M4 (Step Components)**: `StepThree.tsx` component
- **M4 (Step Components)**: `PhaseIndicator` sub-component for two-phase display
- **M3 (Shared Components)**: `ProgressBar.tsx` for progress visualization
- **M5 (Services)**: `importService.ts` for orchestrating import
- **M5 (Services)**: `cmsApi.ts` for API calls
- **M5 (Services)**: `fieldMapper.ts` for row transformation
- **M2 (Context)**: Stores importProgress in WizardState, updates in real-time
- **M6 (Types)**: `ImportProgress` interface

**Data Flow**:
```
StepThree (M4) mounts
    ↓
Calls importService.executeCreateNewImport() or executeExistingModelImport() (M5)
    ↓
ImportService coordinates:
    If Create New:
        Phase 1: cmsApi.createModel() + createFields() (M5)
        Phase 2: For each row, fieldMapper.mapRowToFields() + cmsApi.createItem() (M5)
    If Existing:
        For each row, fieldMapper.mapRowToFields() + cmsApi.createItem() (M5)
    ↓
ImportService calls onProgress callback with updates
    ↓
StepThree (M4) updates Context (M2) via updateImportProgress()
    ↓
ProgressBar (M3) and PhaseIndicator (M4) display progress
    ↓
When complete, navigate to Step 4
```

---

## Step 4: Results

### US-4.1: View Import Results

**Story**: As a user, I want to see a summary of the import outcome, so that I know whether the import succeeded and if there were any issues.

**Implementing Modules**:
- **M4 (Step Components)**: `StepFour.tsx` component
- **M4 (Step Components)**: `ResultSummary` sub-component
- **M4 (Step Components)**: `ErrorTable` sub-component (if errors)
- **M3 (Shared Components)**: `Table.tsx` for error details
- **M2 (Context)**: Reads importResults from WizardState
- **M6 (Types)**: `ImportResults`, `ImportError` interfaces
- **M7 (Utilities)**: Formatters for displaying statistics

**Data Flow**:
```
StepFour (M4) mounts
    ↓
Reads state.importResults from Context (M2)
    ↓
ResultSummary (M4) displays:
    - Success/failure icon
    - Total rows, success count, error count
    ↓
If errors exist:
    ErrorTable (M4) displays error details in Table (M3)
```

---

### US-4.2: Download Error Report

**Story**: As a user, I want to download a report of failed rows and errors, so that I can fix the issues and re-import the corrected data.

**Implementing Modules**:
- **M4 (Step Components)**: `StepFour.tsx` → `ActionButtons` component
- **M3 (Shared Components)**: `Button.tsx` for download button
- **M5 (Services)**: `csvParser.ts` or utility function to generate CSV
- **M2 (Context)**: Reads importResults.errors from WizardState
- **M6 (Types)**: `ImportError` interface
- **M7 (Utilities)**: Format error data for CSV export

**Data Flow**:
```
User clicks "Download Error Report" button (M3)
    ↓
StepFour (M4) reads state.importResults.errors from Context (M2)
    ↓
Generates CSV string with error data (M5 or M7)
    ↓
Creates download link and triggers browser download
```

---

### US-4.3: Take Next Actions

**Story**: As a user, I want to choose what to do after the import completes, so that I can import more data or view my imported data in Re:Earth CMS.

**Implementing Modules**:
- **M4 (Step Components)**: `StepFour.tsx` → `ActionButtons` component
- **M3 (Shared Components)**: `Button.tsx` for action buttons
- **M2 (Context)**: `reset()` method to clear wizard state
- **M5 (Services)**: `storage.ts` to clear sessionStorage

**Data Flow**:
```
User clicks "Import Another CSV" button (M3)
    ↓
StepFour (M4) calls context.reset() (M2)
    ↓
Context clears all state, calls storage.clear() (M5)
    ↓
Navigate back to Step 1

OR

User clicks "View in Re:Earth CMS" button (M3)
    ↓
StepFour (M4) opens CMS URL in new tab
```

---

## Story Coverage Matrix

### Stories by Module

| Module | Stories Implemented | Story IDs |
|--------|---------------------|-----------|
| **M1: Core Infrastructure** | All (provides app structure) | US-1.1 to US-4.3 |
| **M2: Context & State** | All (stores state) | US-1.1 to US-4.3 |
| **M3: Shared Components** | 11 stories | US-1.1, US-1.2, US-1.3, US-2.1, US-2.2, US-2.3, US-2.4, US-2.5, US-3.1, US-4.1, US-4.2, US-4.3 |
| **M4: Step Components** | All 13 stories | US-1.1 to US-4.3 |
| **M5: Services** | 9 stories | US-1.1, US-1.2, US-1.3, US-2.1, US-2.3, US-2.4, US-2.5, US-3.1, US-4.2, US-4.3 |
| **M6: Types** | All (type support) | US-1.1 to US-4.3 |
| **M7: Utilities** | 4 stories | US-1.2, US-4.1, US-4.2 (formatting/utilities) |
| **M8: Web Workers** | 1 story | US-1.3 (CSV parsing) |

---

## Implementation Order Recommendation

Based on story dependencies and the approved implementation plan (core infrastructure first, then sequential steps):

### Phase 1: Foundation (M1, M2, M6)
**No stories yet** - Set up infrastructure
- Create project structure
- Implement WizardProvider (M2)
- Define all TypeScript interfaces (M6)
- Set up App.tsx and routing (M1)

### Phase 2: Shared Components (M3)
**No stories yet** - Build reusable components
- Input, Select, Button, FileUpload
- Table, ProgressBar
- WizardStepper, WizardContainer

### Phase 3: Step 1 Components & Services (M4, M5, M7, M8)
**Stories**: US-1.1, US-1.2, US-1.3
- Implement ValidatorService (M5)
- Implement StorageService (M5)
- Implement CsvParserService (M5) and Web Worker (M8)
- Implement StepOne component (M4)
- Implement formatters (M7)

### Phase 4: Step 2 Components & Services (M4, M5)
**Stories**: US-2.1, US-2.2, US-2.3, US-2.4, US-2.5
- Implement CmsApiService (M5)
- Implement FieldMapperService (M5)
- Implement StepTwo component with all sub-components (M4)

### Phase 5: Step 3 Components & Services (M4, M5)
**Stories**: US-3.1
- Implement ImportService (M5)
- Implement StepThree component (M4)

### Phase 6: Step 4 Components (M4)
**Stories**: US-4.1, US-4.2, US-4.3
- Implement StepFour component with all sub-components (M4)

---

## Module Reuse Across Stories

### High-Reuse Modules
- **M2 (Context)**: Used by all 13 stories
- **M3 (Shared Components)**: Used by 11 stories
- **M4 (Step Components)**: Primary implementer for all 13 stories
- **M6 (Types)**: Supports all 13 stories

### Specialized Modules
- **M8 (Web Workers)**: Only US-1.3 (CSV parsing)
- **M7 (Utilities)**: 4 stories (formatting/display)

---

## Story Completeness Validation

✅ **All 13 stories assigned to unit**: CSV Importer SPA
✅ **All stories mapped to implementing modules**
✅ **No orphaned stories**: Every story has clear module assignments
✅ **No duplicate assignments**: Stories are uniquely implemented (no overlap)
✅ **Implementation order defined**: Sequential by wizard step

---

## Summary

**Total Stories**: 13
**Assigned to Unit**: 13 (CSV Importer SPA)
**Coverage**: 100%

**Module Involvement**:
- Core modules (M1, M2, M6) support all stories
- Step components (M4) implement all stories
- Shared components (M3) used by 11 stories
- Services (M5) implement 9 stories
- Utilities (M7) support 4 stories
- Web Workers (M8) support 1 story (CSV parsing)

**Implementation Phases**: 6 phases following bottom-up approach (infrastructure → shared → steps 1→2→3→4)

This story map provides complete traceability from user stories to implementation modules, ensuring all requirements are covered within the single-unit architecture.
