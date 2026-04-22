# Unit of Work Plan - Re:Earth CMS CSV Importer

## Overview

This document outlines the plan for decomposing the Re:Earth CMS CSV Importer into units of work. Given that this is a **single-page application (SPA)** with a well-defined architecture (React 19 + Vite), the decomposition will focus on logical module organization within a single deployable unit.

---

## Project Context

**Application Type**: Single-Page Application (SPA)
**Architecture**: React 19 + Vite + TypeScript + Tailwind CSS
**Deployment Model**: Static site (Vercel/Netlify)
**Total Stories**: 13 user stories across 4 wizard steps
**Components**: ~30 components
**Services**: 6 services

**Key Insight**: This is NOT a microservices architecture. The entire application will be one deployable unit with logical modules for organization.

---

## Mandatory Artifacts

The following artifacts will be generated as part of Units Generation:

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` with unit definitions and responsibilities
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` with dependency matrix
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` mapping stories to units
- [x] Document code organization strategy in `unit-of-work.md` (greenfield project)
- [x] Validate unit boundaries and dependencies
- [x] Ensure all stories are assigned to units

---

## Planning Questions

### 1. Unit Decomposition Strategy

**Context**: For single-page applications, the typical approach is to define one unit representing the entire SPA, with logical modules for code organization.

**Q1.1**: How would you like to decompose this application into units of work?

- **Option A**: Single unit "CSV Importer SPA" containing all components, services, and steps
- **Option B**: Multiple units separated by major functionality (e.g., "CSV Processing Unit", "CMS Integration Unit", "Wizard UI Unit")
- **Option C**: Custom decomposition strategy

[Answer]: Option A - Single unit "CSV Importer SPA" containing all components, services, and steps. This is the simplest and most appropriate approach for a single-page application.

**Q1.2**: If you chose Option A (Single Unit - recommended), confirm that logical modules within the unit should follow the folder structure defined in Application Design:
- `src/components/` - Shared/reusable components
- `src/steps/` - Step-specific components
- `src/services/` - Business logic services
- `src/types/` - TypeScript interfaces
- `src/hooks/` - Custom React hooks
- `src/utils/` - Helper functions
- `src/workers/` - Web Workers

[Answer]: Yes, confirmed. Use the folder structure exactly as defined in Application Design.

---

### 2. Implementation Order & Priorities

**Context**: Even within a single unit, you may want to prioritize certain modules or stories for implementation first.

**Q2.1**: What implementation order would you prefer?

- **Option A**: Bottom-up (services first, then components, then integration)
- **Option B**: Feature-complete vertical slices (Step 1 end-to-end, then Step 2, etc.)
- **Option C**: Core infrastructure first (context, routing, shared components), then feature steps
- **Option D**: No specific preference - implement in logical dependency order

[Answer]: Option C - Core infrastructure first (WizardContext, shared components, types), then implement wizard steps sequentially (Step 1 → Step 2 → Step 3 → Step 4) along with their required services.

**Q2.2**: Are there any specific user stories or features that should be prioritized or deprioritized?

[Answer]: No specific priorities. Implement user stories in their natural sequential order following the 4-step wizard flow. All stories are essential for the core functionality.

---

### 3. Code Organization (Greenfield)

**Context**: The Application Design already defined a hybrid folder structure. This confirms the deployment and organization model.

**Q3.1**: Deployment model confirmation - the application will be deployed as:

- **Single static bundle** via Vite build → Vercel/Netlify hosting
- **Code splitting**: Lazy-loaded step components for optimal bundle size
- **Web Worker**: Separate bundle for CSV parsing worker

Confirm this matches your expectations?

[Answer]: Yes, confirmed. Single static bundle via Vite with code splitting for step components and a separate Web Worker bundle for CSV parsing.

**Q3.2**: Directory structure adjustments - the Application Design proposed:

```
src/
├── components/          # Shared/reusable components
├── steps/               # Step-specific components
├── services/            # Business logic services
├── types/               # TypeScript interfaces
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
├── workers/             # Web Workers
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles + Tailwind
```

Do you want to make any adjustments to this structure?

[Answer]: No adjustments needed. Use the proposed directory structure as-is.

---

### 4. Dependencies & Integration

**Context**: The Application Design already defined clear service dependencies and data flow via WizardContext.

**Q4.1**: The current dependency strategy is:
- All components access WizardContext for shared state
- Services are independent (except ImportService depends on CmsApi + FieldMapper)
- No circular dependencies

Are there any dependency concerns or preferences you'd like to address?

[Answer]: No concerns. The defined dependency strategy is clear and appropriate. Maintain the unidirectional data flow with WizardContext as the central state hub.

---

### 5. Testing Strategy

**Context**: Testing approach can influence how units are structured and tested.

**Q5.1**: What testing scope would you prefer for this project?

- **Option A**: Unit tests for services only (simplest)
- **Option B**: Unit tests for services + component tests for critical components
- **Option C**: Full coverage (unit + component + integration tests)
- **Option D**: Minimal testing (manual testing only)

[Answer]: Option B - Unit tests for services + component tests for critical components. This provides a good balance between quality assurance and development speed. Focus testing on services (CsvParser, CmsApi, FieldMapper, ImportService) and critical UI components (FileUpload, FieldMappingTable).

---

## Generation Execution Plan

Once the above questions are answered and approved, the following steps will be executed:

### Phase 1: Define Units
- [x] Create unit definitions based on approved decomposition strategy
- [x] Define responsibilities and boundaries for each unit
- [x] Document module organization within units

### Phase 2: Map Dependencies
- [x] Create dependency matrix between units (if multi-unit)
- [x] Document inter-module dependencies within units
- [x] Identify shared resources and communication patterns

### Phase 3: Map Stories to Units
- [x] Assign all 13 user stories to units
- [x] Ensure complete story coverage
- [x] Document story-to-module mappings for implementation clarity

### Phase 4: Document Code Organization
- [x] Finalize folder structure and conventions
- [x] Define file naming patterns
- [x] Document import/export patterns
- [x] Specify code splitting strategy

### Phase 5: Validation
- [x] Verify all stories are assigned
- [x] Validate dependency relationships
- [x] Ensure no circular dependencies
- [x] Confirm alignment with Application Design

---

## Approval

Once all questions are answered and the plan is reviewed, explicit approval is required before proceeding to Generation Phase.

**Instructions**:
1. Review all questions above
2. Fill in each `[Answer]:` tag with your response
3. Notify when ready for review
4. Approve the plan to proceed to Units Generation

---

## Notes

- **Single-page application context**: This is not a microservices architecture. Focus is on logical module organization, not service decomposition.
- **Application Design alignment**: Units should align with the component hierarchy, service layer, and folder structure already defined in Application Design phase.
- **Simplicity preferred**: Based on user feedback throughout the project, simpler approaches are preferred over complex abstractions.
