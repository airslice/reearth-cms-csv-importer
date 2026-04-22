# Application Design Plan - Re:Earth CMS CSV Importer

## Context

Designing a React 19+ application with Vite build tool for CSV import to Re:Earth CMS. The application follows a 4-step wizard workflow and uses the official `@reearth/cms-api` SDK.

## Planning Questions

### Q1: Component Organization

For a 4-step wizard React application, components can be organized in different ways:

**A) Flat Structure** - All components in single `src/components/` folder
```
src/components/
  - WizardStepper.tsx
  - StepOne.tsx
  - StepTwo.tsx
  - ...
```

**B) Feature-Based** - Components grouped by wizard step
```
src/features/
  step1-setup/
    - SetupForm.tsx
    - FileUpload.tsx
  step2-configure/
    - ProjectSelector.tsx
    - FieldMapper.tsx
  ...
```

**C) Hybrid** - Shared components separate from step-specific ones
```
src/components/  (shared: Stepper, Button, Input, etc.)
src/steps/       (step-specific components)
```

**Question**: Which folder organization do you prefer?

[Answer]: C - Hybrid (shared components in src/components/, step-specific in src/steps/, services in src/services/, types in src/types/)

---

### Q2: State Management

**A) React Context** - Simple, built-in state management
**B) Zustand** - Lightweight state library
**C) Component State + Props** - Pass data through props (simpler for wizard flow)
**D) Other** - Specify preference

**Question**: How should we manage state across the 4 steps (CSV data, config, API credentials)?

[Answer]: A - React Context (create WizardContext to hold CSV data, configuration, API credentials, and current step)

---

### Q3: Form Handling

**A) React Hook Form** - Popular form library with validation
**B) Formik** - Another popular form library
**C) Native React state** - Manual form handling
**D) Other** - Specify preference

**Question**: How should we handle forms (API key input, field mapping, etc.)?

[Answer]: A - React Hook Form (industry standard, great validation support, TypeScript support, works well with controlled inputs)

---

### Q4: CSV Processing Location

**A) Dedicated service file** - `src/services/csvParser.ts`
**B) Custom React hook** - `src/hooks/useCsvParser.ts`
**C) Utility function** - `src/utils/csvParser.ts`
**D) Other** - Specify preference

**Question**: Where should CSV parsing logic live?

[Answer]: A - Dedicated service file (src/services/csvParser.ts - clean separation, easy to test, can initialize Web Worker)

---

### Q5: API Client Structure

**A) Wrapper service** - `src/services/cmsApi.ts` wrapping `@reearth/cms-api`
**B) Direct usage** - Use SDK directly in components
**C) Custom hook** - `src/hooks/useCmsApi.ts` wrapping SDK
**D) Other** - Specify preference

**Question**: How should we integrate the `@reearth/cms-api` SDK?

[Answer]: A - Wrapper service (src/services/cmsApi.ts - wraps SDK with app-specific methods, easier error handling, cleaner mocking)

---

## Application Design Execution Plan

Once questions are answered, design generation will proceed:

- [ ] **Step 1**: Define Application Structure
  - Create folder organization based on Q1
  - Define component hierarchy for 4-step wizard
  - Identify shared vs. step-specific components

- [ ] **Step 2**: Design Component Architecture
  - **Wizard Framework**:
    - Stepper/Progress indicator component
    - Step container component
    - Navigation buttons (Next/Back/Submit)
  - **Step 1 Components**:
    - API credentials input form
    - CSV file upload (drag-drop + file picker)
    - CSV preview table
  - **Step 2 Components**:
    - Project selector dropdown
    - Import mode toggle (Create New / Existing)
    - New model configuration form
    - Existing model selector
    - Field mapping table
  - **Step 3 Components**:
    - Progress bar
    - Status message display
    - Phase indicator (for create new model)
  - **Step 4 Components**:
    - Results summary
    - Error table
    - Action buttons

- [ ] **Step 3**: Design Service Layer
  - **CSV Parser Service**: Parse CSV, detect types, extract headers
  - **Field Mapper Service**: Map CSV fields to CMS fields, validate types
  - **CMS API Client**: Wrapper for `@reearth/cms-api` SDK
  - **Import Service**: Orchestrate model creation and data import
  - **Validator Service**: Input validation, field type validation

- [ ] **Step 4**: Define Component Methods & Interfaces
  - Component props interfaces
  - Event handler signatures
  - State shape definitions
  - Service method signatures

- [ ] **Step 5**: Design Component Dependencies
  - Data flow from Step 1 → Step 2 → Step 3 → Step 4
  - Service dependencies (which components use which services)
  - Component communication patterns
  - State lifting and prop drilling strategy

- [ ] **Step 6**: Design Type Definitions
  - TypeScript interfaces for:
    - CSV data structure
    - Re:Earth CMS types (from SDK)
    - Field mapping configuration
    - Import progress state
    - Import results

- [ ] **Step 7**: Generate Design Artifacts
  - Create `components.md` with component hierarchy
  - Create `component-methods.md` with interfaces and methods
  - Create `services.md` with service layer design
  - Create `component-dependency.md` with data flow
  - Create consolidated `application-design.md`

- [ ] **Step 8**: Validate Design Completeness
  - All 13 user stories covered by components
  - All requirements addressed in design
  - No circular dependencies
  - Clear separation of concerns

---

**Instructions**: Please answer the 5 questions above by filling in the [Answer]: tags. I'll use your answers to generate the detailed application design.
