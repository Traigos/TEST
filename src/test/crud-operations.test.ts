import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockDataverseClient } from '../services/mock-dataverse-client';
import { DataverseClient, DataverseApiError } from '../services/dataverse-client';
import type { DataRecord } from '../types/dataverse';

// ============================================================
// Tests for MockDataverseClient CRUD operations
// ============================================================
describe('MockDataverseClient', () => {
  let client: MockDataverseClient;

  beforeEach(() => {
    client = new MockDataverseClient();
  });

  // -- Read operations --
  describe('getAppModules', () => {
    it('returns a list of app modules', async () => {
      const modules = await client.getAppModules();
      expect(modules).toHaveLength(1);
      expect(modules[0].name).toBe('Sales Hub');
      expect(modules[0].uniquename).toBe('msdyn_SalesHub');
    });
  });

  describe('getAppModule', () => {
    it('returns a single app module by id', async () => {
      const module = await client.getAppModule('any-id');
      expect(module.name).toBe('Sales Hub');
    });
  });

  describe('getAppModuleComponents', () => {
    it('returns components for an app module', async () => {
      const components = await client.getAppModuleComponents('any-id');
      expect(components.length).toBeGreaterThan(0);
      // Should include entities, forms, views, sitemap
      const componentTypes = new Set(components.map((c) => c.componenttype));
      expect(componentTypes.has(1)).toBe(true);   // Entity
      expect(componentTypes.has(60)).toBe(true);  // Form
      expect(componentTypes.has(26)).toBe(true);  // View
      expect(componentTypes.has(62)).toBe(true);  // SiteMap
    });
  });

  describe('getSystemForms', () => {
    it('returns forms for a given entity', async () => {
      const forms = await client.getSystemForms('account');
      expect(forms.length).toBeGreaterThan(0);
      expect(forms[0].objecttypecode).toBe('account');
      expect(forms[0].formxml).toBeTruthy();
    });

    it('returns empty array for unknown entity', async () => {
      const forms = await client.getSystemForms('nonexistent');
      expect(forms).toHaveLength(0);
    });

    it('returns forms with valid formxml containing tabs', async () => {
      const forms = await client.getSystemForms('account');
      expect(forms[0].formxml).toContain('<tab');
      expect(forms[0].formxml).toContain('<section');
      expect(forms[0].formxml).toContain('datafieldname');
    });
  });

  describe('getSystemForm', () => {
    it('returns a specific form by id', async () => {
      const form = await client.getSystemForm('form-account-main');
      expect(form.formid).toBe('form-account-main');
      expect(form.name).toBe('Account');
    });

    it('throws for unknown form id', async () => {
      await expect(client.getSystemForm('invalid-id')).rejects.toThrow('Form not found');
    });
  });

  describe('getSavedQueries (views)', () => {
    it('returns views for a given entity', async () => {
      const views = await client.getSavedQueries('account');
      expect(views.length).toBeGreaterThan(0);
      expect(views[0].returnedtypecode).toBe('account');
      expect(views[0].fetchxml).toBeTruthy();
      expect(views[0].layoutxml).toBeTruthy();
    });

    it('returns the default view', async () => {
      const views = await client.getSavedQueries('account');
      const defaultView = views.find((v) => v.isdefault);
      expect(defaultView).toBeDefined();
      expect(defaultView!.name).toBe('Active Accounts');
    });

    it('returns views with valid fetchxml', async () => {
      const views = await client.getSavedQueries('account');
      expect(views[0].fetchxml).toContain('<entity');
      expect(views[0].fetchxml).toContain('<attribute');
    });

    it('returns views with valid layoutxml', async () => {
      const views = await client.getSavedQueries('account');
      expect(views[0].layoutxml).toContain('<grid>');
      expect(views[0].layoutxml).toContain('<cell');
    });

    it('returns empty array for unknown entity', async () => {
      const views = await client.getSavedQueries('nonexistent');
      expect(views).toHaveLength(0);
    });
  });

  describe('getSavedQuery', () => {
    it('returns a specific view by id', async () => {
      const view = await client.getSavedQuery('view-account-active');
      expect(view.savedqueryid).toBe('view-account-active');
      expect(view.name).toBe('Active Accounts');
    });

    it('throws for unknown query id', async () => {
      await expect(client.getSavedQuery('invalid-id')).rejects.toThrow('Query not found');
    });
  });

  describe('getSiteMaps', () => {
    it('returns site maps', async () => {
      const siteMaps = await client.getSiteMaps();
      expect(siteMaps).toHaveLength(1);
      expect(siteMaps[0].sitemapxml).toContain('<SiteMap>');
    });
  });

  describe('getEntityMetadata', () => {
    it('returns metadata for account', async () => {
      const meta = await client.getEntityMetadata('account');
      expect(meta.logicalName).toBe('account');
      expect(meta.displayName).toBe('Account');
      expect(meta.entitySetName).toBe('accounts');
      expect(meta.primaryIdAttribute).toBe('accountid');
      expect(meta.primaryNameAttribute).toBe('name');
    });

    it('returns metadata for contact', async () => {
      const meta = await client.getEntityMetadata('contact');
      expect(meta.logicalName).toBe('contact');
      expect(meta.displayCollectionName).toBe('Contacts');
    });

    it('throws for unknown entity', async () => {
      await expect(client.getEntityMetadata('nonexistent')).rejects.toThrow('Entity not found');
    });

    it('includes attribute metadata', async () => {
      const meta = await client.getEntityMetadata('account');
      expect(meta.attributes.length).toBeGreaterThan(0);

      const nameAttr = meta.attributes.find((a) => a.logicalName === 'name');
      expect(nameAttr).toBeDefined();
      expect(nameAttr!.displayName).toBe('Account Name');
      expect(nameAttr!.attributeType).toBe('String');
      expect(nameAttr!.isRequired).toBe(true);
    });

    it('includes picklist options in attribute metadata', async () => {
      const meta = await client.getEntityMetadata('account');
      const industryAttr = meta.attributes.find((a) => a.logicalName === 'industrycode');
      expect(industryAttr).toBeDefined();
      expect(industryAttr!.attributeType).toBe('Picklist');
      expect(industryAttr!.options).toBeDefined();
      expect(industryAttr!.options!.length).toBeGreaterThan(0);
      expect(industryAttr!.options!.find((o) => o.label === 'Technology')).toBeDefined();
    });
  });

  describe('getEntityAttributes', () => {
    it('returns attribute list for an entity', async () => {
      const attrs = await client.getEntityAttributes('account');
      expect(attrs.length).toBeGreaterThan(0);
      expect(attrs.find((a) => a.logicalName === 'name')).toBeDefined();
    });

    it('throws for unknown entity', async () => {
      await expect(client.getEntityAttributes('nonexistent')).rejects.toThrow('Entity not found');
    });
  });

  // -- List records --
  describe('getRecords', () => {
    it('returns records for accounts', async () => {
      const result = await client.getRecords('accounts');
      expect(result.value.length).toBeGreaterThan(0);
      expect(result['@odata.count']).toBe(result.value.length);
    });

    it('returns records for contacts', async () => {
      const result = await client.getRecords('contacts');
      expect(result.value.length).toBeGreaterThan(0);
    });

    it('returns records for leads', async () => {
      const result = await client.getRecords('leads');
      expect(result.value.length).toBeGreaterThan(0);
    });

    it('returns records for opportunities', async () => {
      const result = await client.getRecords('opportunities');
      expect(result.value.length).toBeGreaterThan(0);
    });

    it('returns records for incidents', async () => {
      const result = await client.getRecords('incidents');
      expect(result.value.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown entity set', async () => {
      const result = await client.getRecords('unknownentities');
      expect(result.value).toHaveLength(0);
    });

    it('account records contain expected fields', async () => {
      const result = await client.getRecords('accounts');
      const first = result.value[0];
      expect(first).toHaveProperty('accountid');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('telephone1');
      expect(first).toHaveProperty('emailaddress1');
    });
  });

  // -- Get single record --
  describe('getRecord', () => {
    it('returns a specific account record', async () => {
      const record = await client.getRecord('accounts', 'acc-001');
      expect(record.name).toBe('Contoso Ltd');
      expect(record.accountid).toBe('acc-001');
    });

    it('returns a specific contact record', async () => {
      const record = await client.getRecord('contacts', 'con-001');
      expect(record.fullname).toBe('Yvonne McKay');
    });

    it('throws for unknown record id', async () => {
      await expect(client.getRecord('accounts', 'nonexistent-id')).rejects.toThrow('Record not found');
    });
  });

  // -- Create --
  describe('createRecord', () => {
    it('returns the created record with a generated id', async () => {
      const data: DataRecord = { name: 'New Account', telephone1: '555-0001' };
      const result = await client.createRecord('accounts', data);
      expect(result.name).toBe('New Account');
      expect(result.telephone1).toBe('555-0001');
      expect(result._id).toBeDefined();
      expect(typeof result._id).toBe('string');
    });

    it('preserves all provided fields', async () => {
      const data: DataRecord = {
        name: 'Test',
        emailaddress1: 'test@example.com',
        revenue: 1000000,
      };
      const result = await client.createRecord('accounts', data);
      expect(result.name).toBe('Test');
      expect(result.emailaddress1).toBe('test@example.com');
      expect(result.revenue).toBe(1000000);
    });
  });

  // -- Update --
  describe('updateRecord', () => {
    it('resolves without error', async () => {
      await expect(
        client.updateRecord('accounts', 'acc-001', { name: 'Updated' })
      ).resolves.toBeUndefined();
    });
  });

  // -- Delete --
  describe('deleteRecord', () => {
    it('resolves without error', async () => {
      await expect(
        client.deleteRecord('accounts', 'acc-001')
      ).resolves.toBeUndefined();
    });
  });

  // -- Misc --
  describe('setAccessToken', () => {
    it('is a no-op that does not throw', () => {
      expect(() => client.setAccessToken('some-token')).not.toThrow();
    });
  });
});

// ============================================================
// Tests for DataverseClient (real client - request construction)
// ============================================================
describe('DataverseClient', () => {
  let client: DataverseClient;

  beforeEach(() => {
    client = new DataverseClient({
      baseUrl: 'https://org.crm.dynamics.com',
      apiVersion: 'v9.2',
      accessToken: 'test-token',
    });
  });

  describe('setAccessToken', () => {
    it('updates the access token used in requests', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      client.setAccessToken('new-token');
      await client.getAppModules();

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/appmodules'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer new-token',
          }),
        })
      );

      fetchSpy.mockRestore();
    });
  });

  describe('getAppModules', () => {
    it('sends correct request to /appmodules endpoint', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [{ name: 'App1' }] }), { status: 200 })
      );

      const result = await client.getAppModules();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('App1');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://org.crm.dynamics.com/api/data/v9.2/appmodules'),
        expect.any(Object)
      );

      fetchSpy.mockRestore();
    });
  });

  describe('getSystemForms', () => {
    it('filters by entity name and form type', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await client.getSystemForms('account', 2);

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("objecttypecode eq 'account'");
      expect(url).toContain('type eq 2');

      fetchSpy.mockRestore();
    });

    it('omits form type filter when not provided', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await client.getSystemForms('account');

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("objecttypecode eq 'account'");
      expect(url).not.toContain('type eq');

      fetchSpy.mockRestore();
    });
  });

  describe('getSavedQueries', () => {
    it('filters by entity name and active state', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await client.getSavedQueries('contact', 0);

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("returnedtypecode eq 'contact'");
      expect(url).toContain('querytype eq 0');
      expect(url).toContain('statecode eq 0');

      fetchSpy.mockRestore();
    });
  });

  describe('getRecords', () => {
    it('builds query string from options', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await client.getRecords('accounts', {
        select: ['name', 'telephone1'],
        filter: "statecode eq 0",
        orderby: 'name asc',
        top: 50,
        count: true,
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('$select=name,telephone1');
      expect(url).toContain('$filter=statecode eq 0');
      expect(url).toContain('$orderby=name asc');
      expect(url).toContain('$top=50');
      expect(url).toContain('$count=true');

      fetchSpy.mockRestore();
    });

    it('sends no query string when no options provided', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await client.getRecords('accounts');

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toMatch(/\/accounts$/);

      fetchSpy.mockRestore();
    });
  });

  describe('getRecord', () => {
    it('fetches a record by entity set name and id', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ name: 'Test' }), { status: 200 })
      );

      const result = await client.getRecord('accounts', 'abc-123');
      expect(result.name).toBe('Test');
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/accounts(abc-123)'),
        expect.any(Object)
      );

      fetchSpy.mockRestore();
    });

    it('appends $select when provided', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ name: 'Test' }), { status: 200 })
      );

      await client.getRecord('accounts', 'abc-123', ['name', 'telephone1']);

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('$select=name,telephone1');

      fetchSpy.mockRestore();
    });
  });

  describe('createRecord', () => {
    it('sends POST request with data', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ accountid: 'new-1', name: 'New' }), { status: 200 })
      );

      const result = await client.createRecord('accounts', { name: 'New' });
      expect(result.name).toBe('New');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/accounts'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New' }),
        })
      );

      fetchSpy.mockRestore();
    });
  });

  describe('updateRecord', () => {
    it('sends PATCH request with data', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 204 })
      );

      await client.updateRecord('accounts', 'abc-123', { name: 'Updated' });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/accounts(abc-123)'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated' }),
        })
      );

      fetchSpy.mockRestore();
    });
  });

  describe('deleteRecord', () => {
    it('sends DELETE request', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 204 })
      );

      await client.deleteRecord('accounts', 'abc-123');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/accounts(abc-123)'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      fetchSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('throws DataverseApiError on 404', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Not Found', { status: 404, statusText: 'Not Found' })
      );

      await expect(client.getRecord('accounts', 'bad-id')).rejects.toThrow(DataverseApiError);

      vi.restoreAllMocks();
    });

    it('includes status code in error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
      );

      try {
        await client.getAppModules();
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(DataverseApiError);
        expect((err as DataverseApiError).statusCode).toBe(403);
      }

      vi.restoreAllMocks();
    });

    it('includes response body in error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{"error":"bad request"}', { status: 400, statusText: 'Bad Request' })
      );

      try {
        await client.getAppModules();
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(DataverseApiError);
        expect((err as DataverseApiError).body).toContain('bad request');
      }

      vi.restoreAllMocks();
    });
  });

  describe('request headers', () => {
    it('includes OData and auth headers', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await client.getAppModules();

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['OData-MaxVersion']).toBe('4.0');
      expect(headers['OData-Version']).toBe('4.0');
      expect(headers['Accept']).toBe('application/json');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer test-token');

      fetchSpy.mockRestore();
    });
  });
});
