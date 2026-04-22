# Re:Earth CMS API Integration Notes

## Using @reearth/cms-api SDK

**Package**: `@reearth/cms-api` (Official TypeScript SDK)
- **npm**: `npm install @reearth/cms-api`
- **GitHub**: https://github.com/reearth/reearth-cms-api
- **TypeScript**: Full TypeScript support with OpenAPI-generated types
- **Browser Compatible**: Works in browser, Node 18+, Cloudflare Workers, Bun, Deno

## API Endpoint Reference

Based on `docs/cms-integration.yml` OpenAPI specification and `@reearth/cms-api` SDK.

### Base URL
- Default: `https://api.cms.reearth.io` (configurable by user)
- All endpoints require authentication via Bearer token (API key)
- All endpoints require `{workspaceIdOrAlias}` path parameter

### Required User Inputs
1. **API Key** (Bearer token)
2. **Workspace ID or Alias**
3. **Base URL** (optional, defaults to https://api.cms.reearth.io)

### SDK Initialization

```typescript
import { CMS } from "@reearth/cms-api";

const cms = new CMS({
  baseURL: "https://api.cms.reearth.io", // or user-provided
  token: userApiKey,
  workspace: userWorkspaceId,
});
```

---

## Endpoint Mappings for CSV Importer

### 1. Fetch Projects
**SDK Method**: Use low-level API client
```typescript
const { data } = await cms.api.GET("/{workspace}/projects", {
  params: {
    path: { workspace: workspaceId },
    query: { page: 1, perPage: 50 }
  }
});
```

**Endpoint**: `GET /{workspaceIdOrAlias}/projects`

**Parameters**:
- Query: `page`, `perPage`, `sort`, `dir`, `keyword`

**Response**:
```json
{
  "projects": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "alias": "string",
      "workspaceId": "string",
      "createdAt": "date-time",
      "updatedAt": "date-time"
    }
  ],
  "page": 1,
  "perPage": 50,
  "totalCount": 10
}
```

---

### 2. Fetch Models (Existing Model Path)
**SDK Method**: High-level convenience method
```typescript
const models = await cms.getAllModels({
  project: projectId
});
```

**Endpoint**: `GET /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models`

**Parameters**:
- Query: `page`, `perPage`, `sort`, `dir`, `keyword`

**Response**:
```json
{
  "models": [
    {
      "id": "string",
      "name": "string",
      "key": "string",
      "description": "string",
      "projectId": "string",
      "schemaId": "string",
      "metadataSchemaId": "string",
      "createdAt": "date-time",
      "updatedAt": "date-time",
      "lastModified": "date-time"
    }
  ],
  "totalCount": 5
}
```

---

### 3. Get Model with Schema
**SDK Method**: High-level convenience method
```typescript
const model = await cms.getModel({
  model: modelIdOrKey
});
// Access schema: model.schema.fields
```

**Endpoint**: `GET /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}`

**Response**:
```json
{
  "id": "string",
  "name": "string",
  "key": "string",
  "description": "string",
  "projectId": "string",
  "schemaId": "string",
  "schema": {
    "id": "string",
    "projectId": "string",
    "fields": [
      {
        "id": "string",
        "key": "string",
        "name": "string",
        "type": "text|number|date|bool|...",
        "required": true,
        "multiple": false
      }
    ],
    "titleField": "string",
    "createdAt": "date-time"
  }
}
```

---

### 4. Create Model (New Model Path - Step 1)
**SDK Method**: Use low-level API client
```typescript
const { data } = await cms.api.POST("/{workspace}/projects/{project}/models", {
  params: {
    path: { workspace: workspaceId, project: projectId }
  },
  body: { name, key, description }
});
const schemaId = data.schemaId;
```

**Endpoint**: `POST /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models`

**Request Body**:
```json
{
  "name": "string",
  "key": "string",
  "description": "string"
}
```

**Response**: Returns full model object with `schemaId`

---

### 5. Create Field (New Model Path - Step 2)
**SDK Method**: Use low-level API client
```typescript
await cms.api.POST("/{workspace}/projects/{project}/schemata/{schema}/fields", {
  params: {
    path: { workspace: workspaceId, project: projectId, schema: schemaId }
  },
  body: { key, type, required, multiple }
});
```

**Endpoint**: `POST /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/schemata/{schemaId}/fields`

**Request Body**:
```json
{
  "key": "string",
  "type": "text|number|date|bool|...",
  "required": true,
  "multiple": false
}
```

**Response**:
```json
{
  "id": "string",
  "key": "string",
  "name": "string",
  "type": "text",
  "required": true,
  "multiple": false
}
```

**Repeat** this endpoint for each CSV field to include in the model.

---

### 6. Create Item (Import Data)
**SDK Method**: High-level convenience method (RECOMMENDED)
```typescript
const item = await cms.createItem({
  model: modelIdOrKey,
  fields: [
    { key: "fieldKey1", value: "fieldValue1" },
    { key: "fieldKey2", value: 123 }
  ]
});
```

**With Rate Limiting** (using p-queue):
```typescript
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 10 });

for (const row of csvRows) {
  queue.add(async () => {
    try {
      await cms.createItem({
        model: modelIdOrKey,
        fields: transformRowToFields(row)
      });
      successCount++;
    } catch (error) {
      errorCount++;
      errors.push({ row, error });
    }
  });
}

await queue.onIdle();
```

**Endpoint**: `POST /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items`

**Request Body**:
```json
{
  "fields": [
    {
      "key": "fieldKey1",
      "value": "fieldValue1"
    },
    {
      "key": "fieldKey2",
      "value": 123
    }
  ],
  "metadataFields": []
}
```

**Response**: Returns created item with version info

**Import Strategy**:
- Call this endpoint **once per CSV row**
- Build `fields` array from CSV row data according to field mappings
- Implement client-side throttling (5-10 requests/sec)
- Track success/failure per row for detailed error reporting

---

## Field Types Reference

Re:Earth CMS supports these field types (from `valueType` enum):

| Type | Description |
|------|-------------|
| `text` | Short text field |
| `textArea` | Long text field |
| `richText` | Rich text editor |
| `markdown` | Markdown editor |
| `checkbox` | Checkbox input |
| `bool` | Boolean value |
| `asset` | File/image asset reference |
| `date` | Date/datetime value |
| `select` | Dropdown select |
| `integer` | Integer number |
| `number` | Decimal number |
| `reference` | Reference to another item |
| `url` | URL field |
| `group` | Group of fields |
| `tag` | Tag field |
| `geometryObject` | GeoJSON geometry |
| `geometryEditor` | Geometry editor |

---

## CSV to CMS Type Mapping

| CSV Detected Type | Default CMS Type | Alternative Types |
|-------------------|------------------|-------------------|
| Text/String | `text` | `textArea`, `markdown`, `url`, `select` |
| Integer | `integer` | `number`, `text` |
| Decimal/Float | `number` | `text` |
| Date/DateTime | `date` | `text` |
| Boolean | `bool` | `checkbox`, `text` |

---

## Rate Limiting Strategy

While Re:Earth CMS API has **no official rate limits**, implement client-side throttling:

**Recommended Settings**:
- **Max concurrent requests**: 5-10
- **Delay between requests**: 100-200ms
- **Batch size for UI updates**: Update progress every 10-50 rows

**Implementation**:
- Use `p-queue` library or custom promise queue
- Queue all item creation requests
- Process with concurrency limit
- Update progress bar in batches to avoid UI jank

**Example** (conceptual):
```javascript
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 10 });

for (const row of csvRows) {
  queue.add(() => createItem(row));
}
```

---

## Error Handling

### Common Error Responses
- `400`: Invalid request parameter value
- `401`: Unauthorized (invalid API key or workspace access)
- `404`: Not found (project, model, or resource)
- `500`: Internal server error

### Import Error Scenarios
1. **Field type mismatch**: CSV value doesn't match field type (e.g., text → integer)
2. **Required field missing**: Required model field not mapped from CSV
3. **Network failure**: Connection timeout or error
4. **API validation error**: Invalid field key, duplicate key, etc.

### Error Recovery
- Log failed rows with error details
- Continue importing remaining rows (don't abort entire import)
- Display error summary at end with row numbers and error messages
- Allow user to download error report (CSV with failed rows + error column)

---

## Authentication

The SDK handles authentication automatically when you initialize with the token:

```typescript
const cms = new CMS({
  token: userApiKey,  // SDK adds this as Bearer token to all requests
  workspace: userWorkspaceId,
  baseURL: "https://api.cms.reearth.io"
});
```

All API requests automatically include:
```http
Authorization: Bearer {user-api-key}
```

Store API key in `sessionStorage` (cleared on tab close for security).

---

## CORS Support

Re:Earth CMS API supports CORS for frontend applications.

**Assumed CORS headers**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

If CORS is blocked, user must configure CORS on their Re:Earth CMS instance or use a proxy.
