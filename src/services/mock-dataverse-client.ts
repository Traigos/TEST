// ============================================================
// Mock Dataverse Client for Demo Mode
// Returns mock data when no live Dataverse connection
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
import {
  mockAppModule,
  mockAppModuleComponents,
  mockSystemForms,
  mockSavedQueries,
  mockSiteMap,
  mockEntityMetadata,
  mockRecords,
} from '../mock/mock-data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockDataverseClient {
  async getAppModules(): Promise<AppModule[]> {
    await delay(200);
    return [mockAppModule];
  }

  async getAppModule(_id: string): Promise<AppModule> {
    await delay(100);
    return mockAppModule;
  }

  async getAppModuleComponents(_appModuleIdUnique: string): Promise<AppModuleComponent[]> {
    await delay(150);
    return mockAppModuleComponents;
  }

  async getSystemForms(entityName: string, _formType?: number): Promise<SystemForm[]> {
    await delay(150);
    return mockSystemForms.filter((f) => f.objecttypecode === entityName);
  }

  async getSystemForm(formId: string): Promise<SystemForm> {
    await delay(100);
    const form = mockSystemForms.find((f) => f.formid === formId);
    if (!form) throw new Error(`Form not found: ${formId}`);
    return form;
  }

  async getSavedQueries(entityName: string, _queryType?: number): Promise<SavedQuery[]> {
    await delay(150);
    return mockSavedQueries.filter((q) => q.returnedtypecode === entityName);
  }

  async getSavedQuery(queryId: string): Promise<SavedQuery> {
    await delay(100);
    const query = mockSavedQueries.find((q) => q.savedqueryid === queryId);
    if (!query) throw new Error(`Query not found: ${queryId}`);
    return query;
  }

  async getSiteMaps(): Promise<SiteMap[]> {
    await delay(100);
    return [mockSiteMap];
  }

  async getSiteMap(_siteMapId: string): Promise<SiteMap> {
    await delay(100);
    return mockSiteMap;
  }

  async getEntityMetadata(logicalName: string): Promise<EntityMetadata> {
    await delay(100);
    const meta = mockEntityMetadata[logicalName];
    if (!meta) throw new Error(`Entity not found: ${logicalName}`);
    return meta;
  }

  async getEntityAttributes(logicalName: string): Promise<EntityMetadata['attributes']> {
    await delay(100);
    const meta = mockEntityMetadata[logicalName];
    if (!meta) throw new Error(`Entity not found: ${logicalName}`);
    return meta.attributes;
  }

  async getRecords(
    entitySetName: string,
    _options?: Record<string, unknown>
  ): Promise<DataverseResponse<DataRecord>> {
    await delay(300);
    // Map entity set name back to logical name
    const entityMap: Record<string, string> = {
      accounts: 'account',
      contacts: 'contact',
      leads: 'lead',
      opportunities: 'opportunity',
      incidents: 'incident',
    };
    const logicalName = entityMap[entitySetName] || entitySetName;
    const records = mockRecords[logicalName] || [];
    return {
      value: records,
      '@odata.count': records.length,
    };
  }

  async getRecord(entitySetName: string, id: string): Promise<DataRecord> {
    await delay(100);
    const entityMap: Record<string, string> = {
      accounts: 'account',
      contacts: 'contact',
      leads: 'lead',
      opportunities: 'opportunity',
      incidents: 'incident',
    };
    const logicalName = entityMap[entitySetName] || entitySetName;
    const records = mockRecords[logicalName] || [];
    const record = records.find((r) => {
      const meta = mockEntityMetadata[logicalName];
      return meta && r[meta.primaryIdAttribute] === id;
    });
    if (!record) throw new Error(`Record not found: ${id}`);
    return record;
  }

  async createRecord(_entitySetName: string, data: DataRecord): Promise<DataRecord> {
    await delay(200);
    return { ...data, _id: crypto.randomUUID() };
  }

  async updateRecord(_entitySetName: string, _id: string, _data: Partial<DataRecord>): Promise<void> {
    await delay(200);
  }

  async deleteRecord(_entitySetName: string, _id: string): Promise<void> {
    await delay(200);
  }

  setAccessToken(_token: string): void {
    // no-op for mock
  }
}
