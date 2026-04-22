/// <reference types="vite/client" />
import { CMS } from '@reearth/cms-api';
import PQueue from 'p-queue';
import type {
  CmsApiConfig,
  Project,
  Model,
  SchemaField,
  CreateModelRequest,
  CreateFieldRequest,
  ItemField,
  Item,
  ImportProgress,
  ImportResults,
  ImportError,
  CsvRow,
} from '@/types';

/**
 * CMS API Service
 * Wrapper for @reearth/cms-api SDK with rate limiting
 */

export class CmsApiService {
  private cms: CMS | null = null;
  private config: CmsApiConfig | null = null;
  private queue: PQueue;

  constructor() {
    // Initialize rate-limited queue (5-10 requests per second)
    this.queue = new PQueue({
      concurrency: 5,
      interval: 1000,
      intervalCap: 10,
    });
  }

  /**
   * Initialize the CMS API client
   */
  initialize(config: CmsApiConfig): void {
    this.config = config;

    // Use proxy in both development and production to avoid CORS issues
    // In development: Vite dev server proxy at /api/*
    // In production (Vercel): Serverless function at /api/*
    // The proxy forwards requests to https://api.cms.reearth.io
    // Add /api prefix so SDK requests go through the proxy
    const baseURL = `${window.location.origin}/api`;

    const sdkConfig = {
      baseURL,
      token: config.apiKey,
      workspace: config.workspaceId,
    };

    console.log('[CMS API] Initializing with config:', {
      baseURL: sdkConfig.baseURL,
      workspace: sdkConfig.workspace,
      hasToken: !!sdkConfig.token,
      tokenLength: sdkConfig.token?.length,
      isDev: import.meta.env.DEV,
    });

    this.cms = new CMS(sdkConfig);
  }

  /**
   * Ensure CMS is initialized
   */
  private ensureInitialized(): void {
    if (!this.cms || !this.config) {
      throw new Error(
        'CMS API not initialized. Call initialize() first.'
      );
    }
  }

  /**
   * Fetch all projects accessible to the user
   */
  async fetchProjects(): Promise<Project[]> {
    this.ensureInitialized();

    try {
      console.log('[CMS API] Fetching projects with config:', {
        baseURL: this.config!.baseUrl || 'https://api.cms.reearth.io',
        workspace: this.config!.workspaceId,
        hasToken: !!this.config!.apiKey,
      });

      const { data, error } = await this.cms!.api.GET(
        '/{workspace}/projects' as any,
        {
          params: {
            path: {
              workspace: this.config!.workspaceId,
            },
          },
        } as any
      );

      console.log('[CMS API] Fetch projects response:', { data, error });

      if (error) {
        throw new Error(`Failed to fetch projects: ${JSON.stringify(error)}`);
      }

      return (
        (data as any)?.projects?.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          alias: p.alias,
        })) || []
      );
    } catch (error) {
      console.error('[CMS API] Fetch projects error:', error);
      throw new Error(
        `Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetch all models in a project
   */
  async fetchModels(projectId: string): Promise<Model[]> {
    this.ensureInitialized();

    try {
      const { data, error } = await this.cms!.api.GET(
        '/{workspace}/projects/{project}/models' as any,
        {
          params: {
            path: {
              workspace: this.config!.workspaceId,
              project: projectId,
            },
          },
        } as any
      );

      if (error) {
        throw new Error(`Failed to fetch models: ${JSON.stringify(error)}`);
      }

      return (
        (data as any)?.models?.map((m: any) => ({
          id: m.id,
          name: m.name,
          key: m.key,
          description: m.description,
          schemaId: m.schemaId,
        })) || []
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetch model details including schema
   */
  async fetchModel(modelId: string, projectId: string): Promise<Model> {
    this.ensureInitialized();

    try {
      const { data, error } = await this.cms!.api.GET(
        '/{workspace}/projects/{project}/models/{model}' as any,
        {
          params: {
            path: {
              workspace: this.config!.workspaceId,
              project: projectId,
              model: modelId,
            },
          },
        } as any
      );

      if (error) {
        throw new Error(`Failed to fetch model: ${JSON.stringify(error)}`);
      }

      const model = data as any;
      if (!model || !model.id) {
        throw new Error('Model not found');
      }

      // Schema is already included in the model response
      const schema = model.schema ? {
        id: model.schema.id,
        fields:
          model.schema.fields?.map((f: any) => ({
            id: f.id,
            key: f.key,
            type: f.type,
            title: f.title,
            description: f.description,
            required: f.required || false,
            multiple: f.multiple || false,
            unique: f.unique || false,
          })) || [],
      } : undefined;

      return {
        id: model.id,
        name: model.name,
        key: model.key,
        description: model.description,
        schemaId: model.schemaId,
        schema,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch model: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a new model in a project
   */
  async createModel(
    projectId: string,
    config: CreateModelRequest
  ): Promise<Model> {
    this.ensureInitialized();

    try {
      const { data, error } = await this.cms!.api.POST(
        '/{workspace}/projects/{project}/models' as any,
        {
          params: {
            path: {
              workspace: this.config!.workspaceId,
              project: projectId,
            },
          },
          body: {
            name: config.name,
            key: config.key,
            description: config.description || '',
          } as any,
        } as any
      );

      if (error) {
        throw new Error(`Failed to create model: ${JSON.stringify(error)}`);
      }

      const model = data as any;
      if (!model || !model.id) {
        throw new Error('Model creation failed - no model returned');
      }

      return {
        id: model.id,
        name: model.name,
        key: model.key,
        description: model.description,
        schemaId: model.schemaId,
      };
    } catch (error) {
      throw new Error(
        `Failed to create model: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a field in a model schema
   */
  async createField(
    projectId: string,
    schemaId: string,
    fieldConfig: CreateFieldRequest
  ): Promise<SchemaField> {
    this.ensureInitialized();

    try {
      const { data, error } = await this.cms!.api.POST(
        '/{workspace}/projects/{project}/schemata/{schema}/fields' as any,
        {
          params: {
            path: {
              workspace: this.config!.workspaceId,
              project: projectId,
              schema: schemaId,
            },
          },
          body: {
            key: fieldConfig.key,
            type: fieldConfig.type,
            title: fieldConfig.title || fieldConfig.key,
            description: fieldConfig.description || '',
            required: fieldConfig.required,
            multiple: fieldConfig.multiple,
          } as any,
        } as any
      );

      if (error) {
        throw new Error(`Failed to create field: ${JSON.stringify(error)}`);
      }

      const field = data as any;
      if (!field || !field.id) {
        throw new Error('Field creation failed - no field returned');
      }

      return {
        id: field.id,
        key: field.key,
        type: field.type,
        title: field.title,
        description: field.description,
        required: field.required || false,
        multiple: field.multiple || false,
      };
    } catch (error) {
      throw new Error(
        `Failed to create field: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create multiple fields in a model schema
   */
  async createFields(
    projectId: string,
    schemaId: string,
    fieldsConfig: CreateFieldRequest[]
  ): Promise<SchemaField[]> {
    const fields: SchemaField[] = [];

    for (const fieldConfig of fieldsConfig) {
      const field = await this.createField(projectId, schemaId, fieldConfig);
      fields.push(field);
    }

    return fields;
  }

  /**
   * Import a single item to a model
   */
  async createItem(modelId: string, projectId: string, fields: ItemField[]): Promise<Item> {
    this.ensureInitialized();

    return this.queue.add(async () => {
      const item = await this.cms!.createItem({
        project: projectId,
        model: modelId,
        fields: fields.map((f) => ({
          key: f.key,
          value: f.value,
        })) as any,
      });

      return {
        id: item.id,
        modelId,
        fields,
      };
    }) as Promise<Item>;
  }

  /**
   * Import multiple items with rate limiting and progress tracking
   */
  async importItems(
    modelId: string,
    projectId: string,
    items: ItemField[][],
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResults> {
    this.ensureInitialized();

    const totalRows = items.length;
    let processedRows = 0;
    let successCount = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        await this.createItem(modelId, projectId, items[i]);
        successCount++;
      } catch (error) {
        errors.push({
          rowIndex: i,
          rowData: items[i].reduce((acc, field) => {
            acc[field.key] = field.value;
            return acc;
          }, {} as CsvRow),
          error:
            error instanceof Error ? error.message : 'Unknown error',
        });
      }

      processedRows++;

      // Report progress every 10 rows or on last row
      if (processedRows % 10 === 0 || processedRows === totalRows) {
        onProgress?.({
          phase: 'importingData',
          totalRows,
          processedRows,
          successCount,
          errorCount: errors.length,
          currentMessage: `Importing row ${processedRows} of ${totalRows}`,
        });
      }
    }

    return {
      success: errors.length === 0,
      totalRows,
      successCount,
      errorCount: errors.length,
      errors,
    };
  }
}

// Export singleton instance
export const cmsApi = new CmsApiService();
