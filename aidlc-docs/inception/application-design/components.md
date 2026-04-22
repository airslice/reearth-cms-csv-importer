# Component Architecture

## Component Hierarchy

```
App
├── WizardProvider (Context Provider)
└── WizardContainer
    ├── WizardStepper (Progress indicator)
    └── StepRouter
        ├── StepOne (Welcome & Setup)
        │   ├── WelcomeMessage
        │   ├── CredentialsForm
        │   │   ├── Input (API Key)
        │   │   ├── Input (Workspace ID)
        │   │   └── Input (Base URL - optional)
        │   └── FileUpload
        │       ├── DropZone
        │       └── FilePreview
        │
        ├── StepTwo (Configure Import)
        │   ├── CsvPreview (Table)
        │   ├── ProjectSelector (Dropdown)
        │   ├── ImportModeToggle
        │   ├── CreateNewModelForm (conditional)
        │   │   ├── Input (Model Name)
        │   │   ├── Input (Model Key)
        │   │   └── FieldConfigTable
        │   │       └── FieldConfigRow
        │   │           ├── Checkbox (Include)
        │   │           ├── Input (Field Key)
        │   │           ├── Select (Field Type)
        │   │           ├── Checkbox (Required)
        │   │           └── Checkbox (Multiple)
        │   └── ImportToExistingForm (conditional)
        │       ├── ModelSelector (Dropdown)
        │       └── FieldMappingTable
        │           └── FieldMappingRow
        │               ├── Text (CSV Field Name)
        │               ├── Select (Target Model Field)
        │               └── Icon (Type Compatibility Warning)
        │
        ├── StepThree (Import Process)
        │   ├── ProgressBar
        │   ├── StatusMessage
        │   └── PhaseIndicator (for Create New Model)
        │
        └── StepFour (Results)
            ├── ResultSummary
            │   ├── Icon (Success/Error)
            │   └── Statistics
            ├── ErrorTable (conditional)
            │   └── ErrorRow
            └── ActionButtons
                ├── Button (Download Error Report)
                ├── Button (Import Another CSV)
                └── Button (View in Re:Earth CMS)
```

---

## Shared Components (`src/components/`)

### WizardProvider
**Purpose**: Provides wizard state context to all child components
**Responsibilities**:
- Initialize and maintain wizard state
- Provide state update methods
- Handle step navigation
- Persist state during wizard flow

### WizardContainer
**Purpose**: Main container for the wizard interface
**Responsibilities**:
- Render current step based on state
- Handle step transitions
- Maintain wizard layout

### WizardStepper
**Purpose**: Visual progress indicator for 4-step wizard
**Responsibilities**:
- Display current step (1/4, 2/4, 3/4, 4/4)
- Show completed vs. pending steps
- Provide visual feedback on wizard progress

### Input
**Purpose**: Reusable text input component
**Responsibilities**:
- Handle text input with validation
- Display error messages
- Support optional fields
- Integrate with React Hook Form

### Select/Dropdown
**Purpose**: Reusable dropdown select component
**Responsibilities**:
- Render dropdown options
- Handle selection changes
- Display placeholder/default value
- Integrate with React Hook Form

### Button
**Purpose**: Reusable button component
**Responsibilities**:
- Handle click events
- Support different variants (primary, secondary, danger)
- Show loading state
- Support disabled state

### FileUpload/DropZone
**Purpose**: File upload interface with drag-and-drop
**Responsibilities**:
- Handle file selection (click or drag-drop)
- Validate file type (.csv)
- Display selected file info (name, size)
- Trigger CSV parsing

### Table
**Purpose**: Reusable table component for data display
**Responsibilities**:
- Render table with headers and rows
- Support sorting (optional)
- Handle empty state
- Display loading state

---

## Step Components (`src/steps/`)

### StepOne - Welcome & Setup
**Purpose**: Initial step for credentials and CSV upload
**Responsibilities**:
- Display welcome message and instructions
- Collect API key, workspace ID, base URL
- Handle CSV file upload
- Trigger CSV analysis
- Validate inputs before proceeding to Step 2

**Sub-components**:
- **WelcomeMessage**: Brief introduction and instructions
- **CredentialsForm**: Form for API credentials with validation
- **FileUpload**: Drag-drop and file picker for CSV upload
- **FilePreview**: Display uploaded file name and size

### StepTwo - Configure Import
**Purpose**: Configure import target and field mappings
**Responsibilities**:
- Fetch and display projects
- Allow project selection
- Present import mode choice (Create New / Import to Existing)
- Render appropriate form based on mode selection
- Validate configuration before proceeding to Step 3

**Sub-components**:
- **CsvPreview**: Table showing CSV headers and sample rows
- **ProjectSelector**: Dropdown to select Re:Earth CMS project
- **ImportModeToggle**: Toggle between Create New Model and Import to Existing
- **CreateNewModelForm**: Form for creating new model (name, key, field selection)
  - **FieldConfigTable**: Table to configure fields (key, type, required, multiple)
- **ImportToExistingForm**: Form for selecting existing model and mapping fields
  - **ModelSelector**: Dropdown to select existing model
  - **FieldMappingTable**: Table to map CSV fields to model fields

### StepThree - Import Process
**Purpose**: Display real-time import progress
**Responsibilities**:
- Show progress bar or percentage
- Display current status message
- For Create New Model: show two-phase progress
- Auto-advance to Step 4 when complete
- Handle cancellation (if supported)

**Sub-components**:
- **ProgressBar**: Visual progress indicator (0-100%)
- **StatusMessage**: Text status (e.g., "Importing row 1,234 of 10,000")
- **PhaseIndicator**: Show Phase 1 (Create Model) and Phase 2 (Import Data) for Create New path

### StepFour - Results
**Purpose**: Display import results and next actions
**Responsibilities**:
- Show success or failure summary
- Display statistics (total, success, failed rows)
- Show error details table (if errors exist)
- Provide action buttons for next steps

**Sub-components**:
- **ResultSummary**: Success/failure icon + statistics
- **ErrorTable**: Table showing failed rows with error messages (conditional on errors)
- **ActionButtons**: Buttons for downloading errors, importing another CSV, viewing in CMS

---

## Component Responsibility Matrix

| Component | Rendering | Data Fetching | State Management | Validation | API Calls |
|-----------|-----------|---------------|------------------|------------|-----------|
| WizardProvider | ❌ | ❌ | ✅ | ❌ | ❌ |
| WizardContainer | ✅ | ❌ | ❌ | ❌ | ❌ |
| WizardStepper | ✅ | ❌ | ❌ | ❌ | ❌ |
| StepOne | ✅ | ❌ | ✅ (local) | ✅ | ❌ |
| StepTwo | ✅ | ✅ (projects/models) | ✅ (local) | ✅ | ✅ (via service) |
| StepThree | ✅ | ❌ | ✅ (progress) | ❌ | ✅ (via service) |
| StepFour | ✅ | ❌ | ❌ | ❌ | ❌ |
| Input/Select/Button | ✅ | ❌ | ✅ (local) | ✅ | ❌ |

---

## Component Count Summary

**Total Components**: ~30
- Shared/Reusable: ~8 (WizardProvider, Stepper, Input, Select, Button, FileUpload, Table, etc.)
- Step Components: 4 (StepOne, StepTwo, StepThree, StepFour)
- Sub-components: ~18 (forms, tables, rows, selectors, etc.)

This is a reasonable count for a wizard-based application of this scope.
