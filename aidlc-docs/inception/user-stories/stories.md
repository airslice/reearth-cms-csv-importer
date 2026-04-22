# User Stories - Re:Earth CMS CSV Importer

## Organization

Stories are organized by the 4-step wizard user journey:
1. **Step 1: Welcome & Setup** - Initial configuration and CSV upload
2. **Step 2: Configure Import** - Project/model selection and field mapping (dual paths)
3. **Step 3: Import Process** - Real-time import progress
4. **Step 4: Results** - Import outcome and next actions

---

## Step 1: Welcome & Setup

### US-1.1: Provide API Credentials

**As a** user,
**I want to** input my Re:Earth CMS API key and Workspace ID,
**so that** the application can authenticate and access my CMS instance.

**Acceptance Criteria**:
- Given I am on the welcome screen
- When I enter my API key and Workspace ID
- Then the inputs are validated for non-empty values
- And the credentials are stored securely in sessionStorage
- And helpful hints explain where to find these credentials
- And an error message is shown if credentials are missing or invalid

---

### US-1.2: Upload CSV File

**As a** user,
**I want to** upload a CSV file via drag-and-drop or file picker,
**so that** I can import my data into Re:Earth CMS.

**Acceptance Criteria**:
- Given I have provided valid API credentials
- When I drag-and-drop a CSV file or click to browse and select a file
- Then the file is accepted if it has a `.csv` extension
- And the file name and size are displayed
- And an error message is shown for non-CSV files
- And files up to 10MB / 50,000 rows are supported
- And I can proceed to the next step when a valid file is uploaded

---

### US-1.3: Analyze CSV Structure

**As a** user,
**I want to** automatically analyze my CSV file's structure,
**so that** I can see the fields and sample data before configuring the import.

**Acceptance Criteria**:
- Given I have uploaded a valid CSV file
- When the file is analyzed (using Web Workers to avoid blocking UI)
- Then CSV headers are extracted as field names
- And data types are detected for each field (text, number, date, boolean)
- And a preview of the first 5-10 rows is displayed
- And common CSV formats are supported (comma, semicolon, tab-delimited)
- And CSV files with and without headers are handled correctly

---

## Step 2: Configure Import

### US-2.1: Select Project

**As a** user,
**I want to** select which Re:Earth CMS project to import data into,
**so that** my data goes to the correct location.

**Acceptance Criteria**:
- Given I have completed Step 1 with valid credentials and CSV file
- When I reach Step 2
- Then my accessible projects are fetched from Re:Earth CMS API
- And a dropdown list displays all projects (name and description)
- And I can select a target project
- And an error message is shown if no projects are found or API call fails
- And I can proceed once a project is selected

---

### US-2.2: Choose Import Mode

**As a** user,
**I want to** choose between creating a new model or importing to an existing model,
**so that** I can either set up new data structures or add to existing ones.

**Acceptance Criteria**:
- Given I have selected a project
- When I view the import mode options
- Then I see two clear options: "Create New Model" and "Import to Existing Model"
- And each option has a description explaining when to use it
- And I can select one option to proceed
- And the UI adapts based on my selection (different fields shown)

---

### US-2.3: Configure New Model (Create New Model Path)

**As a** user,
**I want to** specify the name and structure for a new model,
**so that** I can create a custom data model based on my CSV fields.

**Acceptance Criteria**:
- Given I chose "Create New Model" mode
- When I configure the new model
- Then I can specify a model name and key (unique identifier)
- And I can select which CSV fields to include in the model
- And for each selected field, I can specify:
  - Target field key (defaults to CSV header name, editable)
  - Field type (text, number, date, bool, etc.) with type dropdown
  - Required flag (checkbox)
  - Multiple values flag (checkbox)
- And I see a preview of the model schema before proceeding
- And validation prevents duplicate field keys
- And I can proceed once all required fields are configured

---

### US-2.4: Select Existing Model (Import to Existing Model Path)

**As a** user,
**I want to** select an existing model from my project,
**so that** I can import CSV data into an already-defined structure.

**Acceptance Criteria**:
- Given I chose "Import to Existing Model" mode
- When I view the model selection
- Then models from the selected project are fetched from Re:Earth CMS API
- And a dropdown displays all models (name, key, description)
- And I can select a target model
- And the selected model's schema/fields are fetched and displayed
- And an error message is shown if no models exist or API call fails
- And I can proceed once a model is selected

---

### US-2.5: Map CSV Fields to Model Fields (Import to Existing Model Path)

**As a** user,
**I want to** map my CSV fields to the existing model's fields,
**so that** data is imported into the correct fields.

**Acceptance Criteria**:
- Given I have selected an existing model
- When I configure field mappings
- Then I see a mapping table with all CSV fields
- And for each CSV field, I can select a target model field from a dropdown
- And I can skip/ignore CSV fields that don't need importing
- And field type compatibility indicators warn about mismatches (e.g., CSV text → model number)
- And validation ensures all required model fields are mapped
- And warnings are shown for unmapped model fields
- And I can proceed once all required mappings are complete

---

## Step 3: Import Process

### US-3.1: Monitor Import Progress

**As a** user,
**I want to** see real-time progress while my data is being imported,
**so that** I know the import is working and how long it will take.

**Acceptance Criteria**:
- Given I have confirmed my configuration and started the import
- When the import process runs
- Then I see a progress bar or percentage indicator
- And current status text updates (e.g., "Importing row 1,234 of 10,000")
- And for "Create New Model" path, I see two phases:
  - Phase 1: "Creating model in Re:Earth CMS"
  - Phase 2: "Importing data to new model"
- And for "Import to Existing Model" path, I see one phase:
  - "Importing data to existing model"
- And the UI remains responsive during the import
- And the progress automatically advances to Step 4 when complete

---

## Step 4: Results

### US-4.1: View Import Results

**As a** user,
**I want to** see a summary of the import outcome,
**so that** I know whether the import succeeded and if there were any issues.

**Acceptance Criteria**:
- Given the import process has completed
- When I view the results page
- Then I see a clear success or failure indicator (visual checkmark or error icon)
- And import statistics are displayed:
  - Total rows processed
  - Successfully imported rows
  - Failed rows (if any)
- And if there were errors, I see an error details table with:
  - Row number
  - Error message
  - Data preview
- And the results are easy to understand at a glance

---

### US-4.2: Download Error Report

**As a** user,
**I want to** download a report of failed rows and errors,
**so that** I can fix the issues and re-import the corrected data.

**Acceptance Criteria**:
- Given the import completed with some errors
- When I click "Download Error Report"
- Then a CSV file is downloaded containing:
  - Failed row data
  - Error message for each row
- And the filename includes a timestamp
- And the button is only visible when errors exist

---

### US-4.3: Take Next Actions

**As a** user,
**I want to** choose what to do after the import completes,
**so that** I can import more data or view my imported data in Re:Earth CMS.

**Acceptance Criteria**:
- Given the import has completed (with or without errors)
- When I view the results page
- Then I see action buttons:
  - "Import Another CSV" - restarts from Step 1
  - "View in Re:Earth CMS" - link to the project/model (if possible)
- And clicking "Import Another CSV" clears the current session and starts fresh
- And all buttons are clearly labeled and easy to find

---

## Story Summary

**Total Stories**: 13 user stories

**By Step**:
- Step 1: Welcome & Setup - 3 stories
- Step 2: Configure Import - 5 stories (2 common, 1 for Create New, 2 for Existing Model)
- Step 3: Import Process - 1 story
- Step 4: Results - 3 stories

**Coverage**:
- ✅ Complete 4-step wizard workflow
- ✅ Dual-path support (Create New Model + Import to Existing Model)
- ✅ Error handling (embedded in acceptance criteria)
- ✅ Performance requirements (Web Workers mentioned in US-1.3)
- ✅ Security (secure storage mentioned in US-1.1)
- ✅ User guidance (helpful hints, validation, warnings)

All stories follow the INVEST criteria:
- **Independent**: Stories can be implemented in logical order
- **Negotiable**: Details can be refined during development
- **Valuable**: Each story delivers user value
- **Estimable**: Scope is clear and estimable
- **Small**: Medium-grained scope, manageable size
- **Testable**: Clear acceptance criteria for validation
