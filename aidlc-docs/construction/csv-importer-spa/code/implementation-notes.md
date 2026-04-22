# Implementation Notes - Re:Earth CMS CSV Importer

## Key Implementation Decisions

### 1. React 19 Features

**Decision**: Use React 19 with latest features
**Rationale**:
- Improved performance with automatic batching
- Better TypeScript support
- Latest React ecosystem compatibility

**Implementation**:
- Strict mode enabled in main.tsx
- Functional components with hooks throughout
- No class components

### 2. Web Worker for CSV Parsing

**Decision**: Offload CSV parsing to Web Worker
**Rationale**:
- Prevents UI blocking for large files (up to 50,000 rows)
- Better user experience with responsive UI
- Efficient use of multi-core processors

**Implementation**:
```typescript
// src/workers/csvParser.worker.ts
- Uses PapaParse library
- Detects field types automatically
- Posts results back to main thread
- Handles errors gracefully

// src/services/csvParser.ts
- Creates worker instance
- Manages worker lifecycle
- Provides promise-based API
```

### 3. Context-Based State Management

**Decision**: Use React Context instead of external state library
**Rationale**:
- Simpler architecture for single-unit SPA
- No additional dependencies
- Sufficient for wizard flow

**Implementation**:
```typescript
// WizardProvider manages all state
- currentStep: navigation
- credentials, csvData: Step 1
- project, importMode, mappings: Step 2
- progress: Step 3
- results: Step 4

// Methods for atomic updates
- updateCredentials, setCsvFile, etc.
- Navigation: goToStep, nextStep, previousStep
- reset: clear all state
```

### 4. Service Layer Architecture

**Decision**: Separate business logic into services
**Rationale**:
- Testable in isolation
- Reusable across components
- Framework-independent
- Clear separation of concerns

**Implementation**:
- All services exported as singletons
- No direct API calls in components
- ImportService orchestrates other services
- No circular dependencies

### 5. Lazy Loading for Performance

**Decision**: Lazy load step components
**Rationale**:
- Smaller initial bundle
- Faster first paint
- Better code splitting

**Implementation**:
```typescript
const StepOne = lazy(() => import('./steps/StepOne').then(m => ({ default: m.StepOne })));
// Wrapped in Suspense with loading fallback
```

### 6. Rate Limiting with p-queue

**Decision**: Throttle API requests
**Rationale**:
- Prevent overwhelming Re:Earth CMS API
- More predictable load
- Better error handling

**Implementation**:
```typescript
// CmsApiService constructor
this.queue = new PQueue({
  concurrency: 5,        // Max 5 concurrent requests
  interval: 1000,        // Per second
  intervalCap: 10,       // Max 10 requests per interval
});

// All createItem calls go through queue
await this.queue.add(() => this.cms!.createItem(...));
```

### 7. Field Type Detection

**Decision**: Automatic CSV field type detection
**Rationale**:
- Better user experience
- Reduces configuration effort
- Suggests appropriate CMS field types

**Implementation**:
```typescript
// Detects: text, number, date, boolean
// Samples first 100 rows for detection
// Uses regex patterns for validation
// Falls back to 'text' if ambiguous
```

### 8. Dual Import Paths

**Decision**: Support both "Create New Model" and "Import to Existing"
**Rationale**:
- Flexibility for different use cases
- Common workflow in CMS systems
- User requested feature

**Implementation**:
```typescript
// StepTwo conditionally renders forms
if (importMode === 'createNew') {
  // CreateNewModelForm: model name, key, field configuration
}
if (importMode === 'existing') {
  // ImportToExistingForm: model selection, field mapping
}

// ImportService has separate methods for each path
- executeCreateNewImport: create model + fields + import
- executeExistingModelImport: import only
```

### 9. Error Handling Strategy

**Decision**: Partial success support with detailed error reporting
**Rationale**:
- Don't fail entire import for a few bad rows
- Provide actionable error messages
- Allow user to fix and re-import

**Implementation**:
```typescript
// Import continues even with row errors
for (let i = 0; i < items.length; i++) {
  try {
    await this.createItem(modelId, items[i]);
    successCount++;
  } catch (error) {
    errors.push({ rowIndex: i, rowData: items[i], error: ... });
  }
}

// Results show success/error counts
// Error report downloadable as CSV
```

### 10. sessionStorage for Credentials

**Decision**: Use sessionStorage instead of localStorage
**Rationale**:
- Security: credentials cleared when tab closes
- Privacy: data not persisted across sessions
- Convenience: saves re-entering credentials during session

**Implementation**:
```typescript
// StorageService
saveCredentials(credentials) {
  sessionStorage.setItem('reearth-cms-csv-importer-credentials', JSON.stringify(credentials));
}

// WizardProvider loads on mount
const savedCredentials = storage.loadCredentials();
```

## Performance Considerations

### 1. Batch Progress Updates
- Update UI every 10 rows (not every row)
- Reduces re-render overhead during import
- Still provides responsive progress feedback

### 2. Memoization Opportunities
- React.memo() for Table component (used in multiple steps)
- useMemo() for expensive computations (field type mapping)
- useCallback() for event handlers passed as props

### 3. Code Splitting
- Vendor chunks: react-vendor, cms-vendor, csv-vendor
- Lazy-loaded step components
- Separate Web Worker bundle

## Security Considerations

### 1. Input Validation
- All user inputs validated before processing
- Model keys validated (alphanumeric, starts with letter)
- API credentials validated before initialization
- CSV file validated (extension, size, structure)

### 2. XSS Prevention
- No dangerouslySetInnerHTML used
- All user data rendered safely through React
- CSV data sanitized before display

### 3. API Security
- Official @reearth/cms-api SDK used (handles auth headers)
- No hardcoded credentials
- User provides their own API key
- Credentials never transmitted except to Re:Earth CMS API

## Testing Approach

### Unit Tests
- Services tested in isolation
- Mocked dependencies (API, File API, sessionStorage)
- Focus on business logic correctness

### Component Tests
- Critical components tested (FileUpload, StepOne)
- User interactions tested
- Loading and error states tested

### Test Utilities
- Custom render function with WizardProvider
- Sample CSV data fixtures
- Mocked CMS API responses

## Known Limitations

1. **File Size**: Maximum 10MB CSV files
2. **Row Limit**: Maximum 50,000 rows
3. **Browser Support**: Modern browsers only (ES2020+)
4. **No Offline Support**: Requires internet connection for API calls
5. **No Retry Logic**: Failed API calls not automatically retried (could be added)

## Deployment Considerations

### Build Configuration
- Production build creates optimized bundles
- Source maps excluded from production
- Asset hashing for cache busting

### Environment Variables
- BASE_URL could be configurable via .env
- Currently hardcoded to https://api.cms.reearth.io

### Monitoring
- No error tracking integrated (could add Sentry)
- No analytics integrated (could add Google Analytics)

## Code Quality

### TypeScript
- Strict mode enabled
- No explicit 'any' without justification
- All interfaces defined in types/index.ts

### Linting
- ESLint configured with recommended rules
- React hooks plugin for hooks rules
- TypeScript ESLint for type-aware linting

### Code Style
- Prettier not configured (could be added)
- Consistent 2-space indentation
- Functional components with hooks

## Future Improvements

1. **Add Retry Logic**: Retry failed API calls with exponential backoff
2. **Improve Field Mapping UI**: Drag-and-drop interface for field mapping
3. **Add Validation Preview**: Show validation errors before import
4. **Support More Field Types**: Handle complex CMS field types (Asset, Reference)
5. **Add Import History**: Track previous imports
6. **Add CSV Export**: Export CMS data to CSV
7. **Add Batch Operations**: Process multiple CSV files
8. **Add Advanced Filtering**: Filter CSV rows before import

## Lessons Learned

1. **Web Workers**: Significantly improved UX for large files
2. **Rate Limiting**: Essential for production API usage
3. **Context vs Redux**: Context sufficient for wizard-style apps
4. **TypeScript**: Caught many bugs during development
5. **Lazy Loading**: Noticeable performance improvement on initial load
