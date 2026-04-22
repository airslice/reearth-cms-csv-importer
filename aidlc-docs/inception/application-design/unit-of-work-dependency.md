# Unit of Work Dependencies - Re:Earth CMS CSV Importer

## Overview

This document defines the dependencies between modules within the CSV Importer SPA unit. Since this is a single-page application with one deployable unit, all dependencies are **internal** within the codebase.

---

## Unit-Level Dependencies

Since there is only **one unit** (CSV Importer SPA), there are no inter-unit dependencies. All dependencies exist at the module level within the unit.

**External Dependencies** (3rd-party packages):
- React 19+ (UI framework)
- @reearth/cms-api (Re:Earth CMS SDK)
- PapaParse (CSV parsing)
- React Hook Form (form validation)
- p-queue (rate limiting)
- Tailwind CSS (styling)

---

## Module Dependency Matrix

### Modules Overview

| Module ID | Module Name | Location |
|-----------|-------------|----------|
| M1 | Core Infrastructure | `src/` (root) |
| M2 | Context & State Management | `src/components/WizardProvider.tsx`, `src/hooks/useWizard.ts` |
| M3 | Shared Components | `src/components/` |
| M4 | Step Components | `src/steps/` |
| M5 | Services Layer | `src/services/` |
| M6 | Types & Interfaces | `src/types/` |
| M7 | Utilities & Helpers | `src/utils/` |
| M8 | Web Workers | `src/workers/` |

---

## Dependency Matrix

**Legend**:
- ✅ **Direct Dependency** - Module directly imports from dependency
- 🟡 **Indirect Dependency** - Module depends via another module
- ❌ **No Dependency** - Module does not use dependency
- — **Self** - Diagonal (module itself)

| Module ↓ | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 |
|----------|----|----|----|----|----|----|----|----|
| **M1: Core Infrastructure** | — | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **M2: Context & State** | ❌ | — | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **M3: Shared Components** | ❌ | ❌ | — | ❌ | ❌ | ✅ | ✅ | ❌ |
| **M4: Step Components** | ❌ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ❌ |
| **M5: Services Layer** | ❌ | ❌ | ❌ | ❌ | — | ✅ | ✅ | ✅ |
| **M6: Types & Interfaces** | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| **M7: Utilities & Helpers** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | — | ❌ |
| **M8: Web Workers** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | — |

---

## Detailed Module Dependencies

### M1: Core Infrastructure
**Depends on**:
- M2 (Context & State) - Uses WizardProvider to wrap application
- M3 (Shared Components) - Uses WizardContainer, WizardStepper
- M4 (Step Components) - Lazy loads StepOne, StepTwo, StepThree, StepFour
- M6 (Types) - Imports type definitions

**Used by**:
- None (entry point of application)

**Example**:
```typescript
// App.tsx
import { WizardProvider } from '@/components'; // M2
import { WizardContainer, WizardStepper } from '@/components'; // M3
import { lazy, Suspense } from 'react';

const StepOne = lazy(() => import('@/steps/StepOne')); // M4
const StepTwo = lazy(() => import('@/steps/StepTwo')); // M4
// ...
```

---

### M2: Context & State Management
**Depends on**:
- M5 (Services) - Uses StorageService for credential persistence
- M6 (Types) - Imports WizardState, WizardContextValue interfaces

**Used by**:
- M1 (Core Infrastructure) - WizardProvider wraps App
- M4 (Step Components) - All steps access context via useWizard hook

**Example**:
```typescript
// WizardProvider.tsx
import { storage } from '@/services'; // M5
import { WizardState, WizardContextValue } from '@/types'; // M6

export const WizardProvider = ({ children }) => {
  const [state, setState] = useState<WizardState>({
    credentials: storage.loadCredentials(), // Use M5
    // ...
  });
  // ...
};
```

---

### M3: Shared Components
**Depends on**:
- M6 (Types) - Imports interface types for props
- M7 (Utilities) - Uses formatters for display

**Used by**:
- M1 (Core Infrastructure) - Uses WizardContainer, WizardStepper
- M4 (Step Components) - Uses Input, Select, Button, FileUpload, Table, ProgressBar

**Example**:
```typescript
// Input.tsx
import { InputProps } from '@/types'; // M6
import { formatErrorMessage } from '@/utils'; // M7 (if needed)

export const Input: React.FC<InputProps> = ({ ... }) => {
  // ...
};
```

---

### M4: Step Components
**Depends on**:
- M2 (Context) - Accesses wizard state via useWizard hook
- M3 (Shared Components) - Uses Input, Select, Button, FileUpload, Table, etc.
- M5 (Services) - Calls service methods (csvParser, cmsApi, importService)
- M6 (Types) - Imports type definitions
- M7 (Utilities) - Uses formatters for display

**Used by**:
- M1 (Core Infrastructure) - Lazy loaded in App.tsx

**Example**:
```typescript
// StepOne.tsx
import { useWizard } from '@/hooks/useWizard'; // M2
import { Input, Button, FileUpload } from '@/components'; // M3
import { csvParser, validators } from '@/services'; // M5
import { CsvData } from '@/types'; // M6
import { formatFileSize } from '@/utils'; // M7

export const StepOne = () => {
  const { state, setCsvData } = useWizard(); // M2

  const handleFileUpload = async (file: File) => {
    const csvData = await csvParser.parseFile(file); // M5
    setCsvData(csvData); // M2
  };
  // ...
};
```

---

### M5: Services Layer
**Depends on**:
- M6 (Types) - Imports interfaces for method signatures
- M7 (Utilities) - Uses utility functions for data transformation
- M8 (Web Workers) - CsvParserService instantiates CSV worker

**Used by**:
- M2 (Context) - Uses StorageService
- M4 (Step Components) - Uses all services

**Internal Service Dependencies**:
- ImportService depends on CmsApiService + FieldMapperService
- All other services are independent

**Example**:
```typescript
// importService.ts
import { cmsApi } from './cmsApi'; // M5 internal
import { fieldMapper } from './fieldMapper'; // M5 internal
import { ImportProgress, ImportResults } from '@/types'; // M6

export class ImportService {
  async executeCreateNewImport(config, onProgress) {
    await cmsApi.createModel(...); // Use M5 internal
    const fields = fieldMapper.mapRowToFields(...); // Use M5 internal
    // ...
  }
}
```

---

### M6: Types & Interfaces
**Depends on**:
- None (pure type definitions)

**Used by**:
- M1 (Core Infrastructure) - Imports types
- M2 (Context) - Imports WizardState, WizardContextValue
- M3 (Shared Components) - Imports prop types
- M4 (Step Components) - Imports data types
- M5 (Services) - Imports method signature types
- M7 (Utilities) - Imports types for parameters
- M8 (Web Workers) - Imports message types

**Example**:
```typescript
// types/index.ts
export interface WizardState {
  currentStep: 1 | 2 | 3 | 4;
  credentials: Credentials;
  csvData: CsvData | null;
  // ...
}

export interface CsvData {
  headers: string[];
  fields: CsvField[];
  rows: CsvRow[];
  rowCount: number;
}
// ... all type definitions
```

---

### M7: Utilities & Helpers
**Depends on**:
- M6 (Types) - Imports types for function parameters

**Used by**:
- M3 (Shared Components) - Uses formatters for display
- M4 (Step Components) - Uses formatters
- M5 (Services) - Uses utility functions

**Example**:
```typescript
// formatters.ts
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

---

### M8: Web Workers
**Depends on**:
- M6 (Types) - Imports message types for worker communication

**Used by**:
- M5 (Services) - CsvParserService instantiates worker

**Example**:
```typescript
// csvParser.worker.ts
import Papa from 'papaparse';
import { CsvData } from '@/types'; // M6

self.onmessage = (e) => {
  const { file } = e.data;

  Papa.parse(file, {
    header: true,
    complete: (results) => {
      const csvData: CsvData = {
        // ... transform results
      };
      self.postMessage({ csvData });
    }
  });
};
```

---

## Service Layer Internal Dependencies

### Service Dependency Graph

```
Components (M4)
    ↓
ImportService
    ↓
    ├── CmsApiService → @reearth/cms-api SDK
    └── FieldMapperService → ValidatorService

CsvParserService → PapaParse + Web Worker (M8)
StorageService → sessionStorage API
```

### Detailed Service Dependencies

| Service ↓ / Depends on → | CsvParser | CmsApi | FieldMapper | ImportService | Validators | Storage |
|---------------------------|-----------|--------|-------------|---------------|------------|---------|
| **CsvParserService** | — | ❌ | ❌ | ❌ | ❌ | ❌ |
| **CmsApiService** | ❌ | — | ❌ | ❌ | ❌ | ❌ |
| **FieldMapperService** | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| **ImportService** | ❌ | ✅ | ✅ | — | ❌ | ❌ |
| **ValidatorService** | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **StorageService** | ❌ | ❌ | ❌ | ❌ | ❌ | — |

**Observations**:
- No circular dependencies
- Services are mostly independent
- ImportService is the only service that depends on other services (orchestration)
- CsvParser, CmsApi, FieldMapper, Validators, Storage are fully independent

---

## External Package Dependencies

### Runtime Dependencies

| Package | Version | Used By | Purpose |
|---------|---------|---------|---------|
| `react` | 19+ | M1, M2, M3, M4 | UI framework |
| `react-dom` | 19+ | M1 | DOM rendering |
| `@reearth/cms-api` | latest | M5 (CmsApiService) | Re:Earth CMS SDK |
| `papaparse` | ^5.4.0 | M5 (CsvParserService), M8 | CSV parsing |
| `react-hook-form` | ^7.x | M4 (Step Components) | Form validation |
| `p-queue` | ^7.x | M5 (CmsApiService) | Rate limiting |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^5.x | Build tool |
| `typescript` | ^5.x | Type checking |
| `tailwindcss` | ^3.x | Styling |
| `@types/react` | ^19.x | React types |
| `@types/papaparse` | ^5.x | PapaParse types |
| `vitest` | latest | Testing framework |
| `@testing-library/react` | latest | Component testing |

---

## Dependency Rules & Constraints

### Allowed Dependencies
1. ✅ **Top-down dependencies**: Higher-level modules can depend on lower-level modules (M1 → M2/M3/M4)
2. ✅ **Horizontal dependencies**: Modules at same level can depend on each other (M3 ← → M4)
3. ✅ **Type dependencies**: All modules can depend on M6 (Types)
4. ✅ **Utility dependencies**: All modules can depend on M7 (Utilities)

### Forbidden Dependencies
1. ❌ **Circular dependencies**: No module should create circular import chains
2. ❌ **Upward dependencies**: Lower-level modules should not depend on higher-level (e.g., M5 should not import M4)
3. ❌ **Direct M8 access**: Only M5 should instantiate Web Workers, not M4 directly

### Special Cases
- **M2 (Context)** is used by M1 and M4, but not by M3, M5, M6, M7, M8
- **M5 (Services)** is only accessed by M2 (StorageService) and M4 (all services)
- **M6 (Types)** has no dependencies (pure type definitions)

---

## Data Flow Patterns

### Pattern 1: User Input → Service → Context → UI Update
```
User interacts with Component (M4)
    ↓
Component calls Service (M5)
    ↓
Service processes data, returns result
    ↓
Component updates Context (M2)
    ↓
Context triggers re-render
    ↓
All consuming components update
```

**Example**: CSV file upload
```
StepOne (M4) → csvParser (M5) → setCsvData (M2) → Re-render
```

---

### Pattern 2: Context Read → Component Render
```
Component mounts (M4)
    ↓
Component reads from Context (M2) via useWizard
    ↓
Component renders with state data
```

**Example**: Display CSV preview
```
StepTwo (M4) reads state.csvData from Context (M2) → Renders preview
```

---

### Pattern 3: Service Orchestration (ImportService)
```
Component (M4) calls ImportService
    ↓
ImportService coordinates multiple services:
    ├── CmsApi.createModel() (M5)
    ├── CmsApi.createFields() (M5)
    └── For each row:
        ├── FieldMapper.mapRowToFields() (M5)
        └── CmsApi.createItem() (M5)
    ↓
ImportService aggregates results
    ↓
Component receives final results
    ↓
Component updates Context (M2)
```

---

## Validation: No Circular Dependencies

### Dependency Chain Analysis

**M1 → M2, M3, M4, M6**
- M2 → M5, M6 → ✅ (M5 does not depend on M1, M2, M3, M4)
- M3 → M6, M7 → ✅ (M6, M7 independent)
- M4 → M2, M3, M5, M6, M7 → ✅ (no circular chain)

**M4 → M5 → M6**
- M6 has no dependencies → ✅ (terminates, no cycle)

**M5 → M8 → M6**
- M6 has no dependencies → ✅ (terminates, no cycle)

**Conclusion**: ✅ No circular dependencies detected

---

## Summary

**Unit-Level Dependencies**: None (single unit)
**Module-Level Dependencies**: 8 modules with clear hierarchy
**Service-Level Dependencies**: Mostly independent, ImportService coordinates others
**External Dependencies**: 6 runtime packages, 6 dev packages

**Dependency Characteristics**:
- ✅ Unidirectional data flow
- ✅ No circular dependencies
- ✅ Clear separation of concerns
- ✅ Context as central state hub
- ✅ Services independent of UI
- ✅ Types shared across all modules

This dependency structure supports maintainability, testability, and scalability while keeping the architecture simple and focused.
