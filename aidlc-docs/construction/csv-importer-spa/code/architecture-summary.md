# Architecture Summary - Re:Earth CMS CSV Importer

## Overview

The Re:Earth CMS CSV Importer is a single-page React application that enables users to import CSV data into Re:Earth CMS models through a 4-step wizard interface.

## Architecture Highlights

### Technology Stack
- **React 19** with TypeScript
- **Vite** for build and development
- **Tailwind CSS** for styling
- **@reearth/cms-api** SDK for CMS integration
- **Web Workers** for non-blocking CSV parsing

### Module Structure (8 Modules)

1. **Core Infrastructure** (`src/`)
   - App.tsx: Application shell with lazy-loaded routes
   - main.tsx: Entry point

2. **Context & State** (`src/components/WizardProvider.tsx`, `src/hooks/useWizard.ts`)
   - WizardProvider: Central state management
   - useWizard: Type-safe context access hook

3. **Shared Components** (`src/components/`)
   - Input, Select, Button, FileUpload, Table, ProgressBar
   - WizardStepper, WizardContainer

4. **Step Components** (`src/steps/`)
   - StepOne: Credentials & CSV upload
   - StepTwo: Project selection & import configuration
   - StepThree: Import progress visualization
   - StepFour: Results display

5. **Services Layer** (`src/services/`)
   - CsvParserService: CSV parsing with Web Worker
   - CmsApiService: Re:Earth CMS API integration with rate limiting
   - FieldMapperService: Field mapping and type coercion
   - ImportService: Import orchestration
   - ValidatorService: Input validation
   - StorageService: sessionStorage management

6. **Types** (`src/types/`)
   - ~30 TypeScript interfaces for type safety

7. **Utilities** (`src/utils/`)
   - Formatters for file size, dates, numbers, percentages

8. **Web Workers** (`src/workers/`)
   - csvParser.worker.ts: Background CSV parsing

## Data Flow

```
User Input → Component → Service → Context → Re-render
```

### Wizard Flow
1. **Step 1**: User enters credentials → CSV uploaded → Parsed in Web Worker → Stored in Context
2. **Step 2**: Fetch projects → User configures import → Mappings stored in Context
3. **Step 3**: ImportService orchestrates → Progress updates → Results stored in Context
4. **Step 4**: Display results → User actions (download errors, import another)

## Key Design Patterns

### 1. Wizard Pattern
- 4-step linear progression
- Context-based state sharing
- Visual progress indicator

### 2. Service Layer Pattern
- Business logic separated from UI
- Services are framework-independent
- Testable in isolation

### 3. Context Provider Pattern
- WizardProvider wraps entire app
- No prop drilling
- Single source of truth for wizard state

### 4. Async Operation Pattern
- All API calls in services
- Loading/error states managed in components
- Progress callbacks for long-running operations

### 5. Lazy Loading Pattern
- Step components lazy-loaded with React.lazy()
- Suspense fallback for loading states
- Optimized bundle size

## Performance Optimizations

1. **Web Worker**: CSV parsing runs in background thread
2. **Code Splitting**: Lazy-loaded step components
3. **Rate Limiting**: p-queue throttles API requests (5-10 req/sec)
4. **Batch Progress Updates**: UI updates every 10 rows (not every row)
5. **Vendor Chunk Splitting**: Separate bundles for React, CMS SDK, CSV library

## Security Measures

1. **Credential Storage**: sessionStorage (cleared on tab close)
2. **Input Validation**: All user inputs validated
3. **XSS Prevention**: Data sanitized before display
4. **Privacy-First**: CSV data never leaves browser

## Testing Strategy

- **Unit Tests**: Services (csvParser, fieldMapper, validators, importService)
- **Component Tests**: Critical components (FileUpload, StepOne)
- **Test Setup**: Vitest with jsdom, @testing-library/react
- **Mocks**: sessionStorage, File API

## Deployment

- **Build Output**: Static files (index.html + bundled JS/CSS)
- **Hosting**: Vercel or Netlify
- **CDN**: Automatic via hosting platform
- **HTTPS**: Automatic via hosting platform

## Folder Structure

```
/Users/liubingyang/html/eukarya/reearth-cms-csv-importer/
├── src/
│   ├── components/      # Shared UI components
│   ├── steps/           # Wizard steps
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilities
│   ├── workers/         # Web Workers
│   ├── test/            # Test utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── aidlc-docs/          # AI-DLC documentation
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Metrics

- **Total Components**: ~30
- **Services**: 6
- **Wizard Steps**: 4
- **TypeScript Interfaces**: ~30
- **Supported CSV Rows**: Up to 50,000
- **Bundle Size**: Optimized with code splitting

## Future Enhancements

- Save import configurations for reuse
- Batch import from multiple CSV files
- Advanced CSV transformations
- Export from Re:Earth CMS to CSV
