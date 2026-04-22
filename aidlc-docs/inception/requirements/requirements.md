# Requirements Document

## Intent Analysis Summary

### User Request
Create a CSV importer web application for Re:Earth CMS that allows users to:
1. Load their CSV files
2. Analyze CSV field structure
3. **Choose import target**: Create new CMS model OR select existing project/model
4. Map source fields to target field names and types
5. For new models: Create the model with selected fields first, then import data
6. For existing models: Map to existing fields, then import data
7. Import mapped data to Re:Earth CMS via the integration API

### Request Classification
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: Single application with dual-path workflow
- **Complexity Estimate**: Moderate to Complex
  - File processing with Web Workers
  - Dual-path workflow (create new model vs. use existing)
  - Dynamic field mapping UI with two modes
  - External API integration (fetch projects/models, create models, import data)
  - CSV parsing up to 50,000 rows

### Target Users
- External users (Re:Earth CMS customers and clients)
- Users who need to import CSV data into their Re:Earth CMS instances
- Users provide their own API keys for authentication

---

## UI/UX Structure

The application uses a **4-step wizard interface** with clear progression:

### Step 1: Welcome & Setup
**Purpose**: Initialize the import process
- Welcome message and brief instructions
- Input field for Re:Earth CMS API key (required)
- Input field for Re:Earth CMS Workspace ID or alias (required)
- Input field for Re:Earth CMS base URL (optional if standardized, e.g., default to https://api.cms.reearth.io)
- CSV file upload (drag-and-drop or file picker)
- Helpful hints/tooltips explaining where to find API key and Workspace ID
- "Next" button (enabled when API key + Workspace ID + CSV file are provided)

### Step 2: Configure Import Target & Field Mapping
**Purpose**: Define where and how to import data
- Display CSV analysis results (field names, types, sample data preview)
- Fetch and display projects (using API key from Step 1)
- Project selection dropdown
- Import mode selection: "Create New Model" or "Import to Existing Model"
- **If "Create New Model"**:
  - Input field for new model name
  - Field selection and configuration table:
    - Checkbox to include/exclude each CSV field
    - Editable target field name
    - Field type dropdown (text, number, date, boolean, etc.)
- **If "Import to Existing Model"**:
  - Model selection dropdown (fetched from selected project)
  - Field mapping table:
    - CSV field name → Target model field dropdown
    - Type compatibility indicators
    - Skip/ignore option for each CSV field
- "Back" button (return to Step 1)
- "Import" button (enabled when all mappings are valid)

### Step 3: Import Process Visualization
**Purpose**: Show real-time import progress
- Progress bar or percentage indicator
- Current status text (e.g., "Creating model...", "Importing row 1,234 of 10,000...")
- Animation/spinner for visual feedback
- **For "Create New Model" path**: Show two phases:
  - Phase 1: Creating model in Re:Earth CMS
  - Phase 2: Importing data to new model
- **For "Import to Existing Model" path**: Show one phase:
  - Importing data to existing model
- Optional: Cancel button (if cancellation is supported)
- Auto-advance to Step 4 when complete

### Step 4: Results Page
**Purpose**: Display import outcome and next actions
- Success/failure summary with visual indicator (✓ or ✗)
- Statistics:
  - Total rows processed
  - Successfully imported rows
  - Failed rows (if any)
- Error details table (if failures occurred):
  - Row number
  - Error message
  - Data preview
- Action buttons:
  - "Download Error Report" (if errors exist)
  - "Import Another CSV" (restart from Step 1)
  - "View in Re:Earth CMS" (link to the model/project if possible)

---

## Core User Workflow

The application supports two distinct import workflows with a common project selection step:

```
1. User uploads CSV file
   ↓
2. System analyzes CSV (fields, types, sample data)
   ↓
3. System fetches user's projects (API using provided API key)
   ↓
4. User selects target project
   ↓
5. User chooses import mode:
   ├─→ Option A: Create New Model in Selected Project
   │   ├─ User specifies new model name
   │   ├─ User selects CSV fields to include
   │   ├─ User defines field names and types
   │   ├─ System creates model in selected project (API)
   │   └─ System imports data to newly created model
   │
   └─→ Option B: Import to Existing Model in Selected Project
       ├─ System fetches models in selected project (API)
       ├─ User selects target model
       ├─ System fetches model schema
       ├─ User maps CSV fields to model fields
       └─ System imports data to existing model
   ↓
6. Display import results (success/errors)
```

---

## Functional Requirements

### FR-01: CSV File Upload
**Description**: Users must be able to upload CSV files from their local system.

**Acceptance Criteria**:
- Support drag-and-drop file upload
- Support file input click-to-browse
- Accept .csv file format
- File size limit: Support files up to 50,000 rows (approximately 5-10MB)
- Display file name and size after upload
- Validate file format before processing

### FR-02: CSV Field Analysis
**Description**: System must automatically analyze the uploaded CSV file and extract field information.

**Acceptance Criteria**:
- Parse CSV headers to identify field names
- Detect data types for each field (text, number, date, boolean)
- Display sample data preview (first 5-10 rows)
- Handle common CSV formats (comma, semicolon, tab-delimited)
- Detect and handle CSV files with/without headers
- Handle quoted fields and escaped characters

### FR-03: Project Selection
**Description**: After CSV analysis, system must fetch user's projects and allow project selection.

**Acceptance Criteria**:
- User inputs Re:Earth CMS API key, Workspace ID, and base URL (if not already provided in Step 1)
- Validate API key and Workspace ID before proceeding
- Fetch and display list of user's accessible projects via Re:Earth CMS API: `GET /{workspaceId}/projects`
- Display project names and relevant metadata (id, name, description, alias)
- Allow user to select a target project
- Handle scenarios: empty project list, API errors, network failures
- Store selected project ID/alias for subsequent operations

### FR-04: Import Mode Selection
**Description**: After project selection, users must choose whether to create a new model or import to an existing model.

**Acceptance Criteria**:
- Display two clear options: "Create New Model" or "Import to Existing Model"
- Both options operate within the selected project context

**For "Create New Model"**:
- Allow user to specify new model name and key (unique identifier)
- Validate model name and key (no duplicates in project)
- Allow user to select which CSV fields to include in the model
- For each selected CSV field, user defines:
  - Field key (unique identifier, default to CSV header name)
  - Field type (map to Re:Earth CMS field types: text, number, date, bool, etc.)
  - Required flag (checkbox)
  - Multiple flag (checkbox for array values)
- Preview model schema before creation
- System creates the model in a **two-step process**:
  1. **Create model shell**: `POST /{workspaceId}/projects/{projectId}/models` with name, key, description → returns model with schemaId
  2. **Create fields**: For each selected CSV field, `POST /{workspaceId}/projects/{projectId}/schemata/{schemaId}/fields` with field definition
- Handle model creation errors (e.g., name/key conflicts, validation errors)

**For "Import to Existing Model"**:
- Fetch and display list of models: `GET /{workspaceId}/projects/{projectId}/models`
- Display model names and metadata (id, name, key, description)
- Allow user to select a target model
- Fetch existing model with schema: `GET /{workspaceId}/projects/{projectId}/models/{modelId}`
- Parse schema.fields to display available target fields
- Handle scenarios: no models in project, API errors

### FR-05: Field Mapping Interface
**Description**: Users must be able to map source CSV fields to target Re:Earth CMS fields (behavior varies by import mode).

**Acceptance Criteria**:
- Display list of all source CSV fields with sample data preview

**Mode A - Create New Model**:
- Allow user to select which CSV fields to include in new model
- For each selected field:
  - Specify target field name (default to CSV header name, allow editing)
  - Choose field type (text, number, date, boolean, etc.)
  - Mark fields as required/optional (if supported by Re:Earth CMS)
- Allow users to skip/exclude specific CSV fields
- Preview the model schema before creation

**Mode B - Import to Existing Model**:
- Display existing model fields fetched from Re:Earth CMS API (schema.fields array)
- For each CSV field, provide dropdown to select matching model field by key
- Show field type compatibility warnings (e.g., CSV text → model integer/number field)
- Allow users to skip CSV fields that don't map to model fields
- Validate that all required model fields (field.required = true) are mapped
- Show unmapped model fields as warnings
- Re:Earth CMS field types for reference:
  - text, textArea, richText, markdown
  - checkbox, bool
  - asset, date
  - select, integer, number
  - reference, url
  - group, tag
  - geometryObject, geometryEditor

**Common**:
- Save mapping configuration in browser session
- Optional: Allow export/import of mapping configurations for reuse
- Validate mappings before proceeding to import

### FR-06: Re:Earth CMS API Integration
**Description**: System must integrate with Re:Earth CMS API to fetch projects/models, create models, and import data.

**Acceptance Criteria**:
- Users input their own Re:Earth CMS API key and base URL
- API key stored securely in sessionStorage (cleared on tab close)
- Validate API key and connectivity before workflow begins

**API Operations Required** (using `@reearth/cms-api`):

**Initialization**:
```typescript
import { CMS } from "@reearth/cms-api";

const cms = new CMS({
  baseURL: "https://api.cms.reearth.io", // or user-provided
  token: userApiKey,
  workspace: userWorkspaceId,
});
```

1. **Fetch Projects** (required for both paths):
   - Use: `await cms.api.GET("/{workspace}/projects")`
   - Display project list for user selection
   - Handle empty project list scenario
   - Execute immediately after CSV analysis in Step 2

2. **Fetch Models** (for existing model path):
   - Use: `await cms.getAllModels({ project: projectId })`
   - Display model list for user selection
   - Use: `await cms.getModel({ model: modelIdOrKey })` - fetch full model with schema
   - Parse `schema.fields` array to get field definitions (id, key, type, required, multiple, name)

3. **Create Model** (for new model path) - **Two-step process**:
   - **Step 1**: Create model shell
     ```typescript
     const { data } = await cms.api.POST("/{workspace}/projects/{project}/models", {
       params: { path: { workspace: workspaceId, project: projectId } },
       body: { name, key, description }
     });
     const schemaId = data.schemaId;
     ```
   - **Step 2**: For each CSV field to include:
     ```typescript
     await cms.api.POST("/{workspace}/projects/{project}/schemata/{schema}/fields", {
       params: { path: { workspace: workspaceId, project: projectId, schema: schemaId } },
       body: { key, type, required, multiple }
     });
     ```
   - Validate each field creation was successful
   - Handle errors (e.g., key conflicts, invalid field types)

4. **Import Data** (both paths) - **Individual item creation approach**:
   - Parse CSV rows in browser
   - For each CSV row:
     - Transform row data according to field mappings
     - Build fields array: `[{ key: "fieldKey", value: "fieldValue" }, ...]`
     ```typescript
     await cms.createItem({
       model: modelIdOrKey,
       fields: mappedFields
     });
     ```
   - **Client-side rate limiting**:
     - Wrap `cms.createItem()` calls in p-queue with concurrency limit
     - Configure: `new PQueue({ concurrency: 5, interval: 1000, intervalCap: 10 })`
     - Or use manual delay between batches
   - Display import progress (e.g., "Importing row 1,234 of 10,000")
   - Track success/failure per row
   - Display import results (success count, error count, error details with row numbers)
   - Allow partial success (some rows imported, some failed)

**Error Handling**:
- Handle API authentication errors
- Handle network failures with retry options
- Display clear error messages with API response details

### FR-07: Error Handling
**Description**: System must handle errors gracefully and provide clear feedback.

**Acceptance Criteria**:
- Display clear error messages for invalid CSV format
- Display API errors with actionable guidance
- Allow users to retry failed imports
- Validate data types before import (warn about type mismatches)
- Handle network failures gracefully

---

## Non-Functional Requirements

### NFR-01: Performance
**Priority**: High

**Requirements**:
- CSV parsing must not block the UI (use Web Workers)
- Support files up to 50,000 rows without browser crashes
- Initial page load time < 3 seconds
- CSV parsing for 10,000 rows < 5 seconds
- Responsive UI during file processing
- **API rate limiting**: Implement client-side throttling during import
  - Limit to 5-10 requests per second (configurable)
  - Prevents overwhelming Re:Earth CMS API even though no official rate limit exists
  - Maintains UI responsiveness during import

**Technical Approach**:
- Use Web Workers for CSV parsing to keep main thread responsive
- Implement chunked processing for large files
- Use PapaParse or similar efficient CSV library
- Display loading indicators during processing
- Use `@reearth/cms-api` SDK with custom request throttling:
  - Wrap `cms.createItem()` calls in p-queue or custom rate limiter
  - Configure concurrency limit (5-10 concurrent requests)
  - Add delay between batches if needed
- Batch status updates to UI (e.g., update progress every 10 rows instead of every row)

### NFR-02: Security
**Priority**: Critical

**Requirements**:
- User CSV data must never leave the browser (privacy-first design)
- API keys must be stored securely and cleared on session end
- Input validation to prevent XSS attacks
- Sanitize CSV data before display
- No hardcoded credentials or secrets
- Implement Content Security Policy headers
- Follow OWASP security baseline (Security Extension enabled)

**Security Rules Applied** (from Security Baseline Extension):
- **SECURITY-04**: HTTP Security Headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)
- **SECURITY-05**: Input Validation (validate all CSV data, sanitize for XSS)
- **SECURITY-09**: Security Hardening (no exposed errors, secure error handling)
- **SECURITY-10**: Software Supply Chain Security (dependency pinning, vulnerability scanning)
- **SECURITY-12**: Credential Management (secure API key storage in sessionStorage)
- **SECURITY-15**: Exception Handling (global error handler, fail-safe defaults)

**Note**: Rules SECURITY-01, 02, 03, 06, 07, 08, 13, 14 are N/A (no backend, databases, or infrastructure)

### NFR-03: Usability
**Priority**: High

**Requirements**:
- **4-step wizard interface** with clear step indicators (1/4, 2/4, 3/4, 4/4)
- Step progression: linear forward flow with back navigation where appropriate
- Clear visual hierarchy and layout for each step
- Intuitive UI with helpful hints and tooltips
- Responsive design (desktop and tablet support)
- Clear error messages and inline validation feedback
- Accessible UI (WCAG 2.1 Level AA where feasible)
- Mobile-friendly layout (optional: full mobile support)
- Prevent accidental navigation away during import process (Step 3)

### NFR-04: Reliability
**Priority**: Medium

**Requirements**:
- Handle malformed CSV files gracefully
- Recover from API failures without data loss
- Validate data before import to prevent partial imports
- Provide clear status updates during import process

### NFR-05: Maintainability
**Priority**: Medium

**Requirements**:
- Clean, modular code structure
- Component-based architecture (React)
- Clear separation of concerns (CSV parsing, UI, API client)
- ESLint and Prettier for code quality
- TypeScript for type safety (recommended)

---

## Technical Stack

### UI Components & Libraries
- **Step wizard/stepper component** for 4-step navigation
- **Form components**: Input fields, dropdowns, checkboxes
- **Data table component** for field mapping interface
- **Progress indicators**: Progress bar, spinners, loading states
- **Modal/dialog components** for confirmations and errors
- Recommended: headlessUI, Radix UI, or shadcn/ui for accessible components

### Frontend Framework
- **React 19+** with **Vite** as build tool
- **TypeScript** (recommended for type safety)
- **React Hooks** for state management

### Styling
- **Tailwind CSS** for utility-first styling
- Responsive design utilities
- Custom CSS for step wizard progression indicators

### CSV Processing
- **PapaParse** library for CSV parsing
- **Web Workers** for background processing

### API Integration
- **@reearth/cms-api** - Official Re:Earth CMS TypeScript SDK
  - Typed API client with OpenAPI-generated types
  - High-level methods: `createItem()`, `getModel()`, `getAllModels()`
  - Low-level typed access: `cms.api.GET/POST()` for projects, models, fields
  - Built-in concurrency control for batch operations
  - Browser compatible (uses openapi-fetch, minimal dependencies)
- **Request throttling**: Use built-in concurrency control in `getAllItems()` or p-queue for custom operations

### Storage
- **sessionStorage** for temporary credentials storage (API key + Workspace ID, cleared on tab close)
- No database required
- No persistent storage (all data in-memory)

### Build & Development
- **Vite** for fast development and optimized builds
- **ESLint** + **Prettier** for code quality
- **Vitest** or **Jest** for unit testing (optional)

---

## Deployment

### Target Platform
- **Vercel** or **Netlify** (static site hosting)
- Free tier available
- Automatic deployments from Git repository
- HTTPS enabled by default

### Build Output
- Static HTML, CSS, JS files
- Single-page application (SPA)
- CDN distribution for global availability

---

## Data Privacy & Security Considerations

### Privacy-First Design
- **No server-side processing**: All CSV processing happens in the browser
- **User data never uploaded**: CSV files remain on user's device
- **No tracking or analytics**: Respect user privacy (unless explicitly added)

### API Key Security
- **User-provided keys**: Each user inputs their own Re:Earth CMS API key
- **Session-only storage**: Keys stored in sessionStorage (not localStorage)
- **Automatic cleanup**: Keys cleared when browser tab closes
- **No transmission**: API keys sent only to Re:Earth CMS API (CORS-enabled)

### Input Validation
- Validate and sanitize all CSV data before display
- Prevent XSS through proper escaping
- Validate API responses before processing

---

## Out of Scope (V1)

The following features are explicitly **not included** in the first version:

- User authentication system
- Saving import history or configurations to a database
- Batch imports from multiple CSV files simultaneously
- Real-time collaboration features
- Advanced CSV transformations (formulas, computed fields)
- Backend server or database
- Scheduled/automated imports
- CSV export from Re:Earth CMS

---

## Success Criteria

The CSV importer is considered successful when:

1. ✅ Users can upload CSV files up to 50,000 rows
2. ✅ System accurately parses and displays CSV field structure
3. ✅ Users can map CSV fields to Re:Earth CMS fields
4. ✅ Data imports successfully to Re:Earth CMS via API
5. ✅ UI remains responsive during file processing
6. ✅ Clear error messages guide users through issues
7. ✅ Application deploys successfully to Vercel/Netlify
8. ✅ Security baseline requirements are met
9. ✅ CSV data remains private (never leaves browser)
10. ✅ API keys are handled securely

---

## Assumptions & Constraints

### Assumptions
- Re:Earth CMS API supports CORS requests from frontend
- Users have valid Re:Earth CMS API keys and know their Workspace ID
- CSV files follow standard format (RFC 4180 or common variants)
- Users access the app via modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- File sizes are small to medium (up to ~10MB / 50,000 rows)
- Re:Earth CMS API has no official rate limits, but client-side throttling is good practice

### Constraints
- No backend server (frontend-only architecture)
- No persistent storage (no database)
- Limited to browser memory capacity for file processing
- Dependent on Re:Earth CMS API availability
- CORS policy must allow browser requests

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large CSV files crash browser | High | Use Web Workers, chunked processing, display file size warnings |
| Re:Earth CMS API changes | Medium | Version API calls, provide clear error messages, document API version compatibility |
| CORS blocked by Re:Earth CMS | High | Verify CORS support before development, provide fallback guidance if needed |
| Malformed CSV files cause errors | Medium | Robust parsing library (PapaParse), clear validation messages |
| API key security concerns | High | Use sessionStorage (not localStorage), clear on tab close, educate users on key security |
| Browser compatibility issues | Low | Use modern browser features with polyfills, test on major browsers |

---

## Extension Configuration

### Security Baseline Extension: ENABLED
All applicable security rules will be enforced during design and code generation phases. See NFR-02 for specific rules applied.

### Property-Based Testing Extension: DISABLED
Standard unit and integration tests will be sufficient for this CSV importer tool.

---

## Next Steps

1. Proceed to **Workflow Planning** to determine execution phases
2. Design UI/UX mockups for field mapping interface (if Application Design phase is executed)
3. Select and configure React component library
4. Set up Vite + React + Tailwind project structure
5. Implement core CSV parsing functionality
6. Build field mapping UI
7. Integrate Re:Earth CMS API
8. Deploy to Vercel/Netlify
