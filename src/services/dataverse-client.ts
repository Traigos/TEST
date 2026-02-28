// ============================================================
// Dataverse Web API Client
// Handles authentication and API calls to Dataverse
// ============================================================

import type {
  AppModule,
  AppModuleComponent,
  SystemForm,
  SavedQuery,
  SiteMap,
  EntityMetadata,
  DataRecord,
  DataverseResponse,
} from '../types/dataverse';

export interface DataverseConfig {
  baseUrl: string; // e.g., https://org.crm.dynamics.com
  apiVersion: string; // e.g., v9.2
  accessToken?: string;
}

export class DataverseClient {
  private config: DataverseConfig;

  constructor(config: DataverseConfig) {
    this.config = config;
  }

  private get apiUrl(): string {
    return `${this.config.baseUrl}/api/data/${this.config.apiVersion}`;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    const response = await window.fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new DataverseApiError(
        `Dataverse API error: ${response.status} ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    // 204 No Content responses (e.g. PATCH, DELETE) have no body
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  setAccessToken(token: string): void {
    this.config.accessToken = token;
  }

  // -- App Module --
  async getAppModules(): Promise<AppModule[]> {
    const result = await this.fetch<DataverseResponse<AppModule>>(
      '/appmodules?$select=appmoduleid,appmoduleidunique,name,uniquename,description,url,clienttype,isdefault,statecode,statuscode'
    );
    return result.value;
  }

  async getAppModule(id: string): Promise<AppModule> {
    return this.fetch<AppModule>(`/appmodules(${id})`);
  }

  // -- App Module Components --
  async getAppModuleComponents(appModuleIdUnique: string): Promise<AppModuleComponent[]> {
    const result = await this.fetch<DataverseResponse<AppModuleComponent>>(
      `/appmodulecomponents?$filter=_appmoduleidunique_value eq '${appModuleIdUnique}'`
    );
    return result.value;
  }

  // -- System Forms --
  async getSystemForms(entityName: string, formType?: number): Promise<SystemForm[]> {
    let filter = `objecttypecode eq '${entityName}'`;
    if (formType !== undefined) {
      filter += ` and type eq ${formType}`;
    }
    const result = await this.fetch<DataverseResponse<SystemForm>>(
      `/systemforms?$filter=${filter}&$select=formid,name,objecttypecode,type,formxml,formjson,description,isdefault,formactivationstate`
    );
    return result.value;
  }

  async getSystemForm(formId: string): Promise<SystemForm> {
    return this.fetch<SystemForm>(`/systemforms(${formId})`);
  }

  // -- Saved Queries (Views) --
  async getSavedQueries(entityName: string, queryType?: number): Promise<SavedQuery[]> {
    let filter = `returnedtypecode eq '${entityName}'`;
    if (queryType !== undefined) {
      filter += ` and querytype eq ${queryType}`;
    }
    filter += ' and statecode eq 0'; // Active only
    const result = await this.fetch<DataverseResponse<SavedQuery>>(
      `/savedqueries?$filter=${filter}&$select=savedqueryid,name,returnedtypecode,fetchxml,layoutxml,layoutjson,querytype,isdefault,description`
    );
    return result.value;
  }

  async getSavedQuery(queryId: string): Promise<SavedQuery> {
    return this.fetch<SavedQuery>(`/savedqueries(${queryId})`);
  }

  // -- SiteMap --
  async getSiteMaps(): Promise<SiteMap[]> {
    const result = await this.fetch<DataverseResponse<SiteMap>>('/sitemaps');
    return result.value;
  }

  async getSiteMap(siteMapId: string): Promise<SiteMap> {
    return this.fetch<SiteMap>(`/sitemaps(${siteMapId})`);
  }

  // -- Entity Metadata --
  async getEntityMetadata(logicalName: string): Promise<EntityMetadata> {
    const result = await this.fetch<Record<string, unknown>>(
      `/EntityDefinitions(LogicalName='${logicalName}')?$select=MetadataId,LogicalName,SchemaName,DisplayName,DisplayCollectionName,EntitySetName,PrimaryIdAttribute,PrimaryNameAttribute,ObjectTypeCode,IsCustomEntity,IsActivity,IsQuickCreateEnabled`
    );

    return {
      metadataId: result.MetadataId as string,
      logicalName: result.LogicalName as string,
      schemaName: result.SchemaName as string,
      displayName: (result.DisplayName as Record<string, unknown>)?.UserLocalizedLabel
        ? ((result.DisplayName as Record<string, Record<string, unknown>>).UserLocalizedLabel.Label as string)
        : (result.LogicalName as string),
      displayCollectionName: (result.DisplayCollectionName as Record<string, unknown>)?.UserLocalizedLabel
        ? ((result.DisplayCollectionName as Record<string, Record<string, unknown>>).UserLocalizedLabel.Label as string)
        : (result.LogicalName as string),
      entitySetName: result.EntitySetName as string,
      primaryIdAttribute: result.PrimaryIdAttribute as string,
      primaryNameAttribute: result.PrimaryNameAttribute as string,
      objectTypeCode: result.ObjectTypeCode as number,
      isCustomEntity: result.IsCustomEntity as boolean,
      isActivity: result.IsActivity as boolean,
      isQuickCreateEnabled: result.IsQuickCreateEnabled as boolean,
      attributes: [],
    };
  }

  async getEntityAttributes(logicalName: string): Promise<EntityMetadata['attributes']> {
    const result = await this.fetch<{ value: Record<string, unknown>[] }>(
      `/EntityDefinitions(LogicalName='${logicalName}')/Attributes?$select=LogicalName,SchemaName,DisplayName,AttributeType,IsRequiredForForm,MaxLength`
    );

    return result.value.map((attr) => ({
      logicalName: attr.LogicalName as string,
      schemaName: attr.SchemaName as string,
      displayName: (attr.DisplayName as Record<string, unknown>)?.UserLocalizedLabel
        ? ((attr.DisplayName as Record<string, Record<string, unknown>>).UserLocalizedLabel.Label as string)
        : (attr.LogicalName as string),
      attributeType: (attr.AttributeType as string) || 'String',
      isRequired: (attr.IsRequiredForForm as boolean) || false,
      maxLength: attr.MaxLength as number | undefined,
    })) as EntityMetadata['attributes'];
  }

  // -- Data Operations --
  async getRecords(
    entitySetName: string,
    options?: {
      select?: string[];
      filter?: string;
      orderby?: string;
      top?: number;
      skip?: number;
      count?: boolean;
      savedQuery?: string;
    }
  ): Promise<DataverseResponse<DataRecord>> {
    const params: string[] = [];

    if (options?.select?.length) {
      params.push(`$select=${options.select.join(',')}`);
    }
    if (options?.filter) {
      params.push(`$filter=${options.filter}`);
    }
    if (options?.orderby) {
      params.push(`$orderby=${options.orderby}`);
    }
    if (options?.top) {
      params.push(`$top=${options.top}`);
    }
    if (options?.skip) {
      params.push(`$skip=${options.skip}`);
    }
    if (options?.count) {
      params.push('$count=true');
    }
    if (options?.savedQuery) {
      params.push(`savedQuery=${options.savedQuery}`);
    }

    const queryString = params.length ? `?${params.join('&')}` : '';
    return this.fetch<DataverseResponse<DataRecord>>(`/${entitySetName}${queryString}`);
  }

  async getRecord(entitySetName: string, id: string, select?: string[]): Promise<DataRecord> {
    const params = select?.length ? `?$select=${select.join(',')}` : '';
    return this.fetch<DataRecord>(`/${entitySetName}(${id})${params}`);
  }

  async createRecord(entitySetName: string, data: DataRecord): Promise<DataRecord> {
    return this.fetch<DataRecord>(`/${entitySetName}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(entitySetName: string, id: string, data: Partial<DataRecord>): Promise<void> {
    await this.fetch<void>(`/${entitySetName}(${id})`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(entitySetName: string, id: string): Promise<void> {
    await this.fetch<void>(`/${entitySetName}(${id})`, {
      method: 'DELETE',
    });
  }
}

export class DataverseApiError extends Error {
  statusCode: number;
  body: string;

  constructor(message: string, statusCode: number, body: string) {
    super(message);
    this.name = 'DataverseApiError';
    this.statusCode = statusCode;
    this.body = body;
  }
}
