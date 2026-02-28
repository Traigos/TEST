// ============================================================
// Mock Data for Demo Mode
// Simulates Dataverse metadata tables for local development
// ============================================================

import type {
  AppModule,
  AppModuleComponent,
  SystemForm,
  SavedQuery,
  SiteMap,
  EntityMetadata,
  DataRecord,
} from '../types/dataverse';
import { ComponentType, FormType, QueryType, AttributeType } from '../types/dataverse';

// -- App Module --
export const mockAppModule: AppModule = {
  appmoduleid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  appmoduleidunique: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Sales Hub',
  uniquename: 'msdyn_SalesHub',
  description: 'Manage your sales pipeline with the Sales Hub',
  url: '/main.aspx?appid=a1b2c3d4',
  clienttype: 4,
  isdefault: true,
  statecode: 0,
  statuscode: 1,
};

// -- SiteMap --
export const mockSiteMap: SiteMap = {
  sitemapid: 'sm-001',
  sitemapxml: `<SiteMap>
  <Area Id="Sales" Title="Sales" Icon="/_imgs/sales_24x24.png">
    <Group Id="MyWork" Title="My Work">
      <SubArea Id="nav_dashboards" Title="Dashboards" Entity="" Type="2" DefaultDashboard="dash-001" Icon="dashboard" />
      <SubArea Id="nav_activities" Title="Activities" Entity="activitypointer" Icon="activity" />
    </Group>
    <Group Id="Customers" Title="Customers">
      <SubArea Id="nav_accounts" Title="Accounts" Entity="account" Icon="building" />
      <SubArea Id="nav_contacts" Title="Contacts" Entity="contact" Icon="users" />
    </Group>
    <Group Id="SalesRecords" Title="Sales">
      <SubArea Id="nav_leads" Title="Leads" Entity="lead" Icon="target" />
      <SubArea Id="nav_opportunities" Title="Opportunities" Entity="opportunity" Icon="trophy" />
    </Group>
  </Area>
  <Area Id="Service" Title="Service" Icon="/_imgs/service_24x24.png">
    <Group Id="ServiceRecords" Title="Service">
      <SubArea Id="nav_cases" Title="Cases" Entity="incident" Icon="inbox" />
      <SubArea Id="nav_kb" Title="Knowledge Base" Entity="knowledgearticle" Icon="book-open" />
    </Group>
  </Area>
  <Area Id="Settings" Title="Settings" Icon="/_imgs/settings_24x24.png">
    <Group Id="SystemSettings" Title="System">
      <SubArea Id="nav_settings" Title="Settings" Entity="" Type="3" Url="/settings" Icon="settings" />
    </Group>
  </Area>
</SiteMap>`,
  sitemapname: 'Sales Hub SiteMap',
  showhome: true,
  showrecents: true,
  showpinned: true,
  enablecollapsiblegroups: true,
};

// -- App Module Components --
export const mockAppModuleComponents: AppModuleComponent[] = [
  { appmodulecomponentid: 'amc-001', appmodulecomponentidunique: 'amc-001', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.SiteMap, objectid: mockSiteMap.sitemapid, isdefault: true },
  { appmodulecomponentid: 'amc-002', appmodulecomponentidunique: 'amc-002', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.Entity, objectid: 'account', isdefault: true },
  { appmodulecomponentid: 'amc-003', appmodulecomponentidunique: 'amc-003', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.Entity, objectid: 'contact', isdefault: true },
  { appmodulecomponentid: 'amc-004', appmodulecomponentidunique: 'amc-004', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.Entity, objectid: 'lead', isdefault: true },
  { appmodulecomponentid: 'amc-005', appmodulecomponentidunique: 'amc-005', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.Entity, objectid: 'opportunity', isdefault: true },
  { appmodulecomponentid: 'amc-006', appmodulecomponentidunique: 'amc-006', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.Entity, objectid: 'incident', isdefault: true },
  { appmodulecomponentid: 'amc-010', appmodulecomponentidunique: 'amc-010', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.Form, objectid: 'form-account-main', isdefault: true },
  { appmodulecomponentid: 'amc-011', appmodulecomponentidunique: 'amc-011', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.Form, objectid: 'form-contact-main', isdefault: true },
  { appmodulecomponentid: 'amc-020', appmodulecomponentidunique: 'amc-020', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.View, objectid: 'view-account-active', isdefault: true },
  { appmodulecomponentid: 'amc-021', appmodulecomponentidunique: 'amc-021', appmoduleidunique: mockAppModule.appmoduleidunique, componenttype: ComponentType.View, objectid: 'view-contact-active', isdefault: true },
];

// -- System Forms --
export const mockSystemForms: SystemForm[] = [
  {
    formid: 'form-account-main',
    name: 'Account',
    objecttypecode: 'account',
    type: FormType.Main,
    isdefault: true,
    formactivationstate: 1,
    formxml: `<form>
  <tabs>
    <tab id="tab_general" name="General" visible="true" expanded="true">
      <labels><label description="General" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section id="sec_general" name="General" columns="2" visible="true">
              <labels><label description="Account Information" /></labels>
              <rows>
                <row>
                  <cell id="cell_name" visible="true">
                    <labels><label description="Account Name" /></labels>
                    <control id="name" datafieldname="name" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                  <cell id="cell_phone" visible="true">
                    <labels><label description="Phone" /></labels>
                    <control id="telephone1" datafieldname="telephone1" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                </row>
                <row>
                  <cell id="cell_email" visible="true">
                    <labels><label description="Email" /></labels>
                    <control id="emailaddress1" datafieldname="emailaddress1" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                  <cell id="cell_website" visible="true">
                    <labels><label description="Website" /></labels>
                    <control id="websiteurl" datafieldname="websiteurl" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                </row>
                <row>
                  <cell id="cell_industry" visible="true">
                    <labels><label description="Industry" /></labels>
                    <control id="industrycode" datafieldname="industrycode" classid="{3EF39988-22BB-4f0b-BBBE-64B5A3748AEE}" />
                  </cell>
                  <cell id="cell_revenue" visible="true">
                    <labels><label description="Annual Revenue" /></labels>
                    <control id="revenue" datafieldname="revenue" classid="{533B9E00-756B-4312-95A0-DC888F364F1B}" />
                  </cell>
                </row>
                <row>
                  <cell id="cell_employees" visible="true">
                    <labels><label description="Number of Employees" /></labels>
                    <control id="numberofemployees" datafieldname="numberofemployees" classid="{C6D124CA-7EDA-4a60-AEA9-7FB8D318B68F}" />
                  </cell>
                  <cell id="cell_owner" visible="true">
                    <labels><label description="Owner" /></labels>
                    <control id="ownerid" datafieldname="ownerid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" />
                  </cell>
                </row>
              </rows>
            </section>
            <section id="sec_address" name="Address" columns="2" visible="true">
              <labels><label description="Address" /></labels>
              <rows>
                <row>
                  <cell id="cell_street" visible="true">
                    <labels><label description="Street" /></labels>
                    <control id="address1_line1" datafieldname="address1_line1" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                  <cell id="cell_city" visible="true">
                    <labels><label description="City" /></labels>
                    <control id="address1_city" datafieldname="address1_city" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                </row>
                <row>
                  <cell id="cell_state" visible="true">
                    <labels><label description="State/Province" /></labels>
                    <control id="address1_stateorprovince" datafieldname="address1_stateorprovince" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                  <cell id="cell_country" visible="true">
                    <labels><label description="Country" /></labels>
                    <control id="address1_country" datafieldname="address1_country" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab id="tab_details" name="Details" visible="true" expanded="true">
      <labels><label description="Details" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section id="sec_description" name="Description" columns="1" visible="true">
              <labels><label description="Description" /></labels>
              <rows>
                <row>
                  <cell id="cell_description" visible="true">
                    <labels><label description="Description" /></labels>
                    <control id="description" datafieldname="description" classid="{E0DECE4B-6FC8-4a8f-A065-082708572369}" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>`,
  },
  {
    formid: 'form-contact-main',
    name: 'Contact',
    objecttypecode: 'contact',
    type: FormType.Main,
    isdefault: true,
    formactivationstate: 1,
    formxml: `<form>
  <tabs>
    <tab id="tab_general" name="General" visible="true" expanded="true">
      <labels><label description="General" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section id="sec_contact_info" name="ContactInfo" columns="2" visible="true">
              <labels><label description="Contact Information" /></labels>
              <rows>
                <row>
                  <cell id="cell_firstname" visible="true">
                    <labels><label description="First Name" /></labels>
                    <control id="firstname" datafieldname="firstname" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                  <cell id="cell_lastname" visible="true">
                    <labels><label description="Last Name" /></labels>
                    <control id="lastname" datafieldname="lastname" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                </row>
                <row>
                  <cell id="cell_email" visible="true">
                    <labels><label description="Email" /></labels>
                    <control id="emailaddress1" datafieldname="emailaddress1" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                  <cell id="cell_phone" visible="true">
                    <labels><label description="Business Phone" /></labels>
                    <control id="telephone1" datafieldname="telephone1" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                </row>
                <row>
                  <cell id="cell_jobtitle" visible="true">
                    <labels><label description="Job Title" /></labels>
                    <control id="jobtitle" datafieldname="jobtitle" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                  </cell>
                  <cell id="cell_company" visible="true">
                    <labels><label description="Company" /></labels>
                    <control id="parentcustomerid" datafieldname="parentcustomerid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>`,
  },
  {
    formid: 'form-lead-main',
    name: 'Lead',
    objecttypecode: 'lead',
    type: FormType.Main,
    isdefault: true,
    formactivationstate: 1,
    formxml: `<form>
  <tabs>
    <tab id="tab_general" name="General" visible="true" expanded="true">
      <labels><label description="Lead Information" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section id="sec_lead" name="LeadInfo" columns="2" visible="true">
              <labels><label description="Lead Details" /></labels>
              <rows>
                <row>
                  <cell id="cell_fn" visible="true"><labels><label description="First Name" /></labels><control id="firstname" datafieldname="firstname" /></cell>
                  <cell id="cell_ln" visible="true"><labels><label description="Last Name" /></labels><control id="lastname" datafieldname="lastname" /></cell>
                </row>
                <row>
                  <cell id="cell_topic" visible="true"><labels><label description="Topic" /></labels><control id="subject" datafieldname="subject" /></cell>
                  <cell id="cell_status" visible="true"><labels><label description="Status" /></labels><control id="statuscode" datafieldname="statuscode" /></cell>
                </row>
                <row>
                  <cell id="cell_email" visible="true"><labels><label description="Email" /></labels><control id="emailaddress1" datafieldname="emailaddress1" /></cell>
                  <cell id="cell_phone" visible="true"><labels><label description="Phone" /></labels><control id="telephone1" datafieldname="telephone1" /></cell>
                </row>
                <row>
                  <cell id="cell_company" visible="true"><labels><label description="Company" /></labels><control id="companyname" datafieldname="companyname" /></cell>
                  <cell id="cell_revenue" visible="true"><labels><label description="Est. Revenue" /></labels><control id="estimatedvalue" datafieldname="estimatedvalue" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>`,
  },
  {
    formid: 'form-opportunity-main',
    name: 'Opportunity',
    objecttypecode: 'opportunity',
    type: FormType.Main,
    isdefault: true,
    formactivationstate: 1,
    formxml: `<form>
  <tabs>
    <tab id="tab_general" name="General" visible="true" expanded="true">
      <labels><label description="Opportunity" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section id="sec_opp" name="OppInfo" columns="2" visible="true">
              <labels><label description="Opportunity Details" /></labels>
              <rows>
                <row>
                  <cell id="cell_name" visible="true"><labels><label description="Topic" /></labels><control id="name" datafieldname="name" /></cell>
                  <cell id="cell_customer" visible="true"><labels><label description="Account" /></labels><control id="parentaccountid" datafieldname="parentaccountid" /></cell>
                </row>
                <row>
                  <cell id="cell_amount" visible="true"><labels><label description="Est. Revenue" /></labels><control id="estimatedvalue" datafieldname="estimatedvalue" /></cell>
                  <cell id="cell_close" visible="true"><labels><label description="Est. Close Date" /></labels><control id="estimatedclosedate" datafieldname="estimatedclosedate" /></cell>
                </row>
                <row>
                  <cell id="cell_prob" visible="true"><labels><label description="Probability" /></labels><control id="closeprobability" datafieldname="closeprobability" /></cell>
                  <cell id="cell_stage" visible="true"><labels><label description="Sales Stage" /></labels><control id="salesstage" datafieldname="salesstage" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>`,
  },
  {
    formid: 'form-incident-main',
    name: 'Case',
    objecttypecode: 'incident',
    type: FormType.Main,
    isdefault: true,
    formactivationstate: 1,
    formxml: `<form>
  <tabs>
    <tab id="tab_general" name="General" visible="true" expanded="true">
      <labels><label description="Case" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section id="sec_case" name="CaseInfo" columns="2" visible="true">
              <labels><label description="Case Details" /></labels>
              <rows>
                <row>
                  <cell id="cell_title" visible="true"><labels><label description="Case Title" /></labels><control id="title" datafieldname="title" /></cell>
                  <cell id="cell_customer" visible="true"><labels><label description="Customer" /></labels><control id="customerid" datafieldname="customerid" /></cell>
                </row>
                <row>
                  <cell id="cell_priority" visible="true"><labels><label description="Priority" /></labels><control id="prioritycode" datafieldname="prioritycode" /></cell>
                  <cell id="cell_status" visible="true"><labels><label description="Status" /></labels><control id="statuscode" datafieldname="statuscode" /></cell>
                </row>
                <row>
                  <cell id="cell_description" visible="true"><labels><label description="Description" /></labels><control id="description" datafieldname="description" /></cell>
                  <cell id="cell_origin" visible="true"><labels><label description="Origin" /></labels><control id="caseorigincode" datafieldname="caseorigincode" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>`,
  },
];

// -- Saved Queries (Views) --
export const mockSavedQueries: SavedQuery[] = [
  {
    savedqueryid: 'view-account-active',
    name: 'Active Accounts',
    returnedtypecode: 'account',
    querytype: QueryType.MainApplicationView,
    isdefault: true,
    statecode: 0,
    statuscode: 1,
    fetchxml: `<fetch><entity name="account"><attribute name="name"/><attribute name="telephone1"/><attribute name="emailaddress1"/><attribute name="address1_city"/><attribute name="revenue"/><attribute name="industrycode"/><filter><condition attribute="statecode" operator="eq" value="0"/></filter><order attribute="name"/></entity></fetch>`,
    layoutxml: `<grid><row><cell name="name" width="200"/><cell name="telephone1" width="150"/><cell name="emailaddress1" width="200"/><cell name="address1_city" width="150"/><cell name="revenue" width="120"/></row></grid>`,
  },
  {
    savedqueryid: 'view-contact-active',
    name: 'Active Contacts',
    returnedtypecode: 'contact',
    querytype: QueryType.MainApplicationView,
    isdefault: true,
    statecode: 0,
    statuscode: 1,
    fetchxml: `<fetch><entity name="contact"><attribute name="fullname"/><attribute name="emailaddress1"/><attribute name="telephone1"/><attribute name="jobtitle"/><attribute name="parentcustomerid"/><filter><condition attribute="statecode" operator="eq" value="0"/></filter><order attribute="fullname"/></entity></fetch>`,
    layoutxml: `<grid><row><cell name="fullname" width="200"/><cell name="emailaddress1" width="200"/><cell name="telephone1" width="150"/><cell name="jobtitle" width="180"/><cell name="parentcustomerid" width="180"/></row></grid>`,
  },
  {
    savedqueryid: 'view-lead-active',
    name: 'Open Leads',
    returnedtypecode: 'lead',
    querytype: QueryType.MainApplicationView,
    isdefault: true,
    statecode: 0,
    statuscode: 1,
    fetchxml: `<fetch><entity name="lead"><attribute name="fullname"/><attribute name="subject"/><attribute name="emailaddress1"/><attribute name="telephone1"/><attribute name="companyname"/><attribute name="estimatedvalue"/><attribute name="statuscode"/><filter><condition attribute="statecode" operator="eq" value="0"/></filter><order attribute="fullname"/></entity></fetch>`,
    layoutxml: `<grid><row><cell name="fullname" width="180"/><cell name="subject" width="200"/><cell name="companyname" width="160"/><cell name="emailaddress1" width="200"/><cell name="estimatedvalue" width="120"/><cell name="statuscode" width="120"/></row></grid>`,
  },
  {
    savedqueryid: 'view-opportunity-active',
    name: 'Open Opportunities',
    returnedtypecode: 'opportunity',
    querytype: QueryType.MainApplicationView,
    isdefault: true,
    statecode: 0,
    statuscode: 1,
    fetchxml: `<fetch><entity name="opportunity"><attribute name="name"/><attribute name="estimatedvalue"/><attribute name="estimatedclosedate"/><attribute name="parentaccountid"/><attribute name="closeprobability"/><attribute name="salesstage"/><filter><condition attribute="statecode" operator="eq" value="0"/></filter><order attribute="estimatedclosedate" descending="true"/></entity></fetch>`,
    layoutxml: `<grid><row><cell name="name" width="220"/><cell name="parentaccountid" width="160"/><cell name="estimatedvalue" width="130"/><cell name="closeprobability" width="100"/><cell name="salesstage" width="140"/><cell name="estimatedclosedate" width="140"/></row></grid>`,
  },
  {
    savedqueryid: 'view-incident-active',
    name: 'Active Cases',
    returnedtypecode: 'incident',
    querytype: QueryType.MainApplicationView,
    isdefault: true,
    statecode: 0,
    statuscode: 1,
    fetchxml: `<fetch><entity name="incident"><attribute name="title"/><attribute name="customerid"/><attribute name="prioritycode"/><attribute name="statuscode"/><attribute name="createdon"/><attribute name="caseorigincode"/><filter><condition attribute="statecode" operator="eq" value="0"/></filter><order attribute="createdon" descending="true"/></entity></fetch>`,
    layoutxml: `<grid><row><cell name="title" width="250"/><cell name="customerid" width="160"/><cell name="prioritycode" width="100"/><cell name="statuscode" width="120"/><cell name="createdon" width="140"/></row></grid>`,
  },
];

// -- Entity Metadata --
export const mockEntityMetadata: Record<string, EntityMetadata> = {
  account: {
    metadataId: 'em-account',
    logicalName: 'account',
    schemaName: 'Account',
    displayName: 'Account',
    displayCollectionName: 'Accounts',
    entitySetName: 'accounts',
    primaryIdAttribute: 'accountid',
    primaryNameAttribute: 'name',
    objectTypeCode: 1,
    isCustomEntity: false,
    isActivity: false,
    isQuickCreateEnabled: true,
    attributes: [
      { logicalName: 'accountid', schemaName: 'AccountId', displayName: 'Account', attributeType: AttributeType.UniqueIdentifier, isRequired: false },
      { logicalName: 'name', schemaName: 'Name', displayName: 'Account Name', attributeType: AttributeType.String, isRequired: true, maxLength: 160 },
      { logicalName: 'telephone1', schemaName: 'Telephone1', displayName: 'Phone', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'emailaddress1', schemaName: 'EMailAddress1', displayName: 'Email', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'websiteurl', schemaName: 'WebSiteURL', displayName: 'Website', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'address1_line1', schemaName: 'Address1_Line1', displayName: 'Street 1', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'address1_city', schemaName: 'Address1_City', displayName: 'City', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'address1_stateorprovince', schemaName: 'Address1_StateOrProvince', displayName: 'State/Province', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'address1_country', schemaName: 'Address1_Country', displayName: 'Country', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'revenue', schemaName: 'Revenue', displayName: 'Annual Revenue', attributeType: AttributeType.Money, isRequired: false },
      { logicalName: 'numberofemployees', schemaName: 'NumberOfEmployees', displayName: 'Number of Employees', attributeType: AttributeType.Integer, isRequired: false },
      { logicalName: 'industrycode', schemaName: 'IndustryCode', displayName: 'Industry', attributeType: AttributeType.Picklist, isRequired: false, options: [
        { value: 1, label: 'Accounting' }, { value: 2, label: 'Agriculture' }, { value: 3, label: 'Broadcasting' },
        { value: 4, label: 'Consulting' }, { value: 5, label: 'Education' }, { value: 6, label: 'Financial Services' },
        { value: 7, label: 'Government' }, { value: 8, label: 'Healthcare' }, { value: 9, label: 'Technology' },
        { value: 10, label: 'Manufacturing' }, { value: 11, label: 'Retail' }, { value: 12, label: 'Real Estate' },
      ]},
      { logicalName: 'ownerid', schemaName: 'OwnerId', displayName: 'Owner', attributeType: AttributeType.Owner, isRequired: false },
      { logicalName: 'description', schemaName: 'Description', displayName: 'Description', attributeType: AttributeType.Memo, isRequired: false },
      { logicalName: 'statecode', schemaName: 'StateCode', displayName: 'Status', attributeType: AttributeType.State, isRequired: false, options: [
        { value: 0, label: 'Active', color: '#34C759' }, { value: 1, label: 'Inactive', color: '#FF3B30' },
      ]},
    ],
  },
  contact: {
    metadataId: 'em-contact',
    logicalName: 'contact',
    schemaName: 'Contact',
    displayName: 'Contact',
    displayCollectionName: 'Contacts',
    entitySetName: 'contacts',
    primaryIdAttribute: 'contactid',
    primaryNameAttribute: 'fullname',
    objectTypeCode: 2,
    isCustomEntity: false,
    isActivity: false,
    isQuickCreateEnabled: true,
    attributes: [
      { logicalName: 'contactid', schemaName: 'ContactId', displayName: 'Contact', attributeType: AttributeType.UniqueIdentifier, isRequired: false },
      { logicalName: 'firstname', schemaName: 'FirstName', displayName: 'First Name', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'lastname', schemaName: 'LastName', displayName: 'Last Name', attributeType: AttributeType.String, isRequired: true },
      { logicalName: 'fullname', schemaName: 'FullName', displayName: 'Full Name', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'emailaddress1', schemaName: 'EMailAddress1', displayName: 'Email', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'telephone1', schemaName: 'Telephone1', displayName: 'Business Phone', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'jobtitle', schemaName: 'JobTitle', displayName: 'Job Title', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'parentcustomerid', schemaName: 'ParentCustomerId', displayName: 'Company', attributeType: AttributeType.Customer, isRequired: false },
    ],
  },
  lead: {
    metadataId: 'em-lead',
    logicalName: 'lead',
    schemaName: 'Lead',
    displayName: 'Lead',
    displayCollectionName: 'Leads',
    entitySetName: 'leads',
    primaryIdAttribute: 'leadid',
    primaryNameAttribute: 'fullname',
    objectTypeCode: 4,
    isCustomEntity: false,
    isActivity: false,
    isQuickCreateEnabled: true,
    attributes: [
      { logicalName: 'leadid', schemaName: 'LeadId', displayName: 'Lead', attributeType: AttributeType.UniqueIdentifier, isRequired: false },
      { logicalName: 'firstname', schemaName: 'FirstName', displayName: 'First Name', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'lastname', schemaName: 'LastName', displayName: 'Last Name', attributeType: AttributeType.String, isRequired: true },
      { logicalName: 'fullname', schemaName: 'FullName', displayName: 'Full Name', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'subject', schemaName: 'Subject', displayName: 'Topic', attributeType: AttributeType.String, isRequired: true },
      { logicalName: 'emailaddress1', schemaName: 'EMailAddress1', displayName: 'Email', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'telephone1', schemaName: 'Telephone1', displayName: 'Phone', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'companyname', schemaName: 'CompanyName', displayName: 'Company', attributeType: AttributeType.String, isRequired: false },
      { logicalName: 'estimatedvalue', schemaName: 'EstimatedValue', displayName: 'Est. Revenue', attributeType: AttributeType.Money, isRequired: false },
      { logicalName: 'statuscode', schemaName: 'StatusCode', displayName: 'Status', attributeType: AttributeType.Status, isRequired: false, options: [
        { value: 1, label: 'New', color: '#007AFF' }, { value: 2, label: 'Contacted', color: '#5856D6' },
        { value: 3, label: 'Qualified', color: '#34C759' }, { value: 4, label: 'Disqualified', color: '#FF3B30' },
      ]},
    ],
  },
  opportunity: {
    metadataId: 'em-opportunity',
    logicalName: 'opportunity',
    schemaName: 'Opportunity',
    displayName: 'Opportunity',
    displayCollectionName: 'Opportunities',
    entitySetName: 'opportunities',
    primaryIdAttribute: 'opportunityid',
    primaryNameAttribute: 'name',
    objectTypeCode: 3,
    isCustomEntity: false,
    isActivity: false,
    isQuickCreateEnabled: true,
    attributes: [
      { logicalName: 'opportunityid', schemaName: 'OpportunityId', displayName: 'Opportunity', attributeType: AttributeType.UniqueIdentifier, isRequired: false },
      { logicalName: 'name', schemaName: 'Name', displayName: 'Topic', attributeType: AttributeType.String, isRequired: true },
      { logicalName: 'estimatedvalue', schemaName: 'EstimatedValue', displayName: 'Est. Revenue', attributeType: AttributeType.Money, isRequired: false },
      { logicalName: 'estimatedclosedate', schemaName: 'EstimatedCloseDate', displayName: 'Est. Close Date', attributeType: AttributeType.DateTime, isRequired: false },
      { logicalName: 'parentaccountid', schemaName: 'ParentAccountId', displayName: 'Account', attributeType: AttributeType.Lookup, isRequired: false },
      { logicalName: 'closeprobability', schemaName: 'CloseProbability', displayName: 'Probability', attributeType: AttributeType.Integer, isRequired: false },
      { logicalName: 'salesstage', schemaName: 'SalesStage', displayName: 'Sales Stage', attributeType: AttributeType.Picklist, isRequired: false, options: [
        { value: 0, label: 'Qualify', color: '#5AC8FA' }, { value: 1, label: 'Develop', color: '#007AFF' },
        { value: 2, label: 'Propose', color: '#5856D6' }, { value: 3, label: 'Close', color: '#34C759' },
      ]},
    ],
  },
  incident: {
    metadataId: 'em-incident',
    logicalName: 'incident',
    schemaName: 'Incident',
    displayName: 'Case',
    displayCollectionName: 'Cases',
    entitySetName: 'incidents',
    primaryIdAttribute: 'incidentid',
    primaryNameAttribute: 'title',
    objectTypeCode: 112,
    isCustomEntity: false,
    isActivity: false,
    isQuickCreateEnabled: true,
    attributes: [
      { logicalName: 'incidentid', schemaName: 'IncidentId', displayName: 'Case', attributeType: AttributeType.UniqueIdentifier, isRequired: false },
      { logicalName: 'title', schemaName: 'Title', displayName: 'Case Title', attributeType: AttributeType.String, isRequired: true },
      { logicalName: 'customerid', schemaName: 'CustomerId', displayName: 'Customer', attributeType: AttributeType.Customer, isRequired: false },
      { logicalName: 'prioritycode', schemaName: 'PriorityCode', displayName: 'Priority', attributeType: AttributeType.Picklist, isRequired: false, options: [
        { value: 1, label: 'High', color: '#FF3B30' }, { value: 2, label: 'Normal', color: '#FF9500' }, { value: 3, label: 'Low', color: '#34C759' },
      ]},
      { logicalName: 'statuscode', schemaName: 'StatusCode', displayName: 'Status Reason', attributeType: AttributeType.Status, isRequired: false, options: [
        { value: 1, label: 'In Progress', color: '#007AFF' }, { value: 2, label: 'On Hold', color: '#FF9500' },
        { value: 3, label: 'Waiting', color: '#5856D6' }, { value: 5, label: 'Resolved', color: '#34C759' },
      ]},
      { logicalName: 'description', schemaName: 'Description', displayName: 'Description', attributeType: AttributeType.Memo, isRequired: false },
      { logicalName: 'caseorigincode', schemaName: 'CaseOriginCode', displayName: 'Origin', attributeType: AttributeType.Picklist, isRequired: false, options: [
        { value: 1, label: 'Phone' }, { value: 2, label: 'Email' }, { value: 3, label: 'Web' }, { value: 4, label: 'Social' },
      ]},
      { logicalName: 'createdon', schemaName: 'CreatedOn', displayName: 'Created On', attributeType: AttributeType.DateTime, isRequired: false },
    ],
  },
};

// -- Mock Data Records --
export const mockRecords: Record<string, DataRecord[]> = {
  account: [
    { accountid: 'acc-001', name: 'Contoso Ltd', telephone1: '+1 (425) 555-0100', emailaddress1: 'info@contoso.com', address1_city: 'Seattle', revenue: 5200000, industrycode: 9, websiteurl: 'https://contoso.com', numberofemployees: 250, statecode: 0 },
    { accountid: 'acc-002', name: 'Fabrikam Inc', telephone1: '+1 (312) 555-0150', emailaddress1: 'sales@fabrikam.com', address1_city: 'Chicago', revenue: 3800000, industrycode: 10, websiteurl: 'https://fabrikam.com', numberofemployees: 180, statecode: 0 },
    { accountid: 'acc-003', name: 'Adventure Works', telephone1: '+1 (650) 555-0175', emailaddress1: 'hello@adventureworks.com', address1_city: 'San Francisco', revenue: 12500000, industrycode: 11, websiteurl: 'https://adventureworks.com', numberofemployees: 520, statecode: 0 },
    { accountid: 'acc-004', name: 'Northwind Traders', telephone1: '+1 (206) 555-0125', emailaddress1: 'contact@northwind.com', address1_city: 'Portland', revenue: 8900000, industrycode: 11, websiteurl: 'https://northwind.com', numberofemployees: 340, statecode: 0 },
    { accountid: 'acc-005', name: 'Tailspin Toys', telephone1: '+1 (512) 555-0190', emailaddress1: 'info@tailspintoys.com', address1_city: 'Austin', revenue: 2100000, industrycode: 10, websiteurl: 'https://tailspintoys.com', numberofemployees: 95, statecode: 0 },
    { accountid: 'acc-006', name: 'Woodgrove Bank', telephone1: '+1 (212) 555-0145', emailaddress1: 'support@woodgrovebank.com', address1_city: 'New York', revenue: 45000000, industrycode: 6, websiteurl: 'https://woodgrovebank.com', numberofemployees: 1200, statecode: 0 },
    { accountid: 'acc-007', name: 'Litware Inc', telephone1: '+1 (408) 555-0160', emailaddress1: 'hello@litware.com', address1_city: 'San Jose', revenue: 7200000, industrycode: 9, websiteurl: 'https://litware.com', numberofemployees: 310, statecode: 0 },
    { accountid: 'acc-008', name: 'Proseware Inc', telephone1: '+1 (617) 555-0180', emailaddress1: 'info@proseware.com', address1_city: 'Boston', revenue: 4100000, industrycode: 9, websiteurl: 'https://proseware.com', numberofemployees: 155, statecode: 0 },
  ],
  contact: [
    { contactid: 'con-001', firstname: 'Yvonne', lastname: 'McKay', fullname: 'Yvonne McKay', emailaddress1: 'yvonne@contoso.com', telephone1: '+1 (425) 555-0101', jobtitle: 'CEO', parentcustomerid: 'Contoso Ltd' },
    { contactid: 'con-002', firstname: 'Susanna', lastname: 'Stubberod', fullname: 'Susanna Stubberod', emailaddress1: 'susanna@contoso.com', telephone1: '+1 (425) 555-0102', jobtitle: 'VP Sales', parentcustomerid: 'Contoso Ltd' },
    { contactid: 'con-003', firstname: 'Nancy', lastname: 'Anderson', fullname: 'Nancy Anderson', emailaddress1: 'nancy@fabrikam.com', telephone1: '+1 (312) 555-0151', jobtitle: 'Director', parentcustomerid: 'Fabrikam Inc' },
    { contactid: 'con-004', firstname: 'Maria', lastname: 'Campbell', fullname: 'Maria Campbell', emailaddress1: 'maria@adventureworks.com', telephone1: '+1 (650) 555-0176', jobtitle: 'CTO', parentcustomerid: 'Adventure Works' },
    { contactid: 'con-005', firstname: 'Sidney', lastname: 'Higa', fullname: 'Sidney Higa', emailaddress1: 'sidney@northwind.com', telephone1: '+1 (206) 555-0126', jobtitle: 'Buyer', parentcustomerid: 'Northwind Traders' },
    { contactid: 'con-006', firstname: 'Robert', lastname: 'Lyon', fullname: 'Robert Lyon', emailaddress1: 'robert@tailspintoys.com', telephone1: '+1 (512) 555-0191', jobtitle: 'Marketing Manager', parentcustomerid: 'Tailspin Toys' },
  ],
  lead: [
    { leadid: 'lead-001', firstname: 'Patrick', lastname: 'Sands', fullname: 'Patrick Sands', subject: 'Enterprise Licensing', emailaddress1: 'patrick@alpine.com', telephone1: '+1 (555) 100-0001', companyname: 'Alpine Ski House', estimatedvalue: 150000, statuscode: 1 },
    { leadid: 'lead-002', firstname: 'Jim', lastname: 'Glynn', fullname: 'Jim Glynn', subject: 'Cloud Migration', emailaddress1: 'jim@blueyonder.com', telephone1: '+1 (555) 100-0002', companyname: 'Blue Yonder Airlines', estimatedvalue: 320000, statuscode: 2 },
    { leadid: 'lead-003', firstname: 'Cathan', lastname: 'Cook', fullname: 'Cathan Cook', subject: 'Digital Transformation', emailaddress1: 'cathan@coho.com', telephone1: '+1 (555) 100-0003', companyname: 'Coho Winery', estimatedvalue: 85000, statuscode: 1 },
    { leadid: 'lead-004', firstname: 'Rene', lastname: 'Valdes', fullname: 'Rene Valdes', subject: 'Platform Upgrade', emailaddress1: 'rene@treyresearch.com', telephone1: '+1 (555) 100-0004', companyname: 'Trey Research', estimatedvalue: 210000, statuscode: 3 },
  ],
  opportunity: [
    { opportunityid: 'opp-001', name: 'Contoso ERP Implementation', estimatedvalue: 850000, estimatedclosedate: '2026-04-15', parentaccountid: 'Contoso Ltd', closeprobability: 75, salesstage: 2 },
    { opportunityid: 'opp-002', name: 'Fabrikam Cloud Suite', estimatedvalue: 420000, estimatedclosedate: '2026-03-28', parentaccountid: 'Fabrikam Inc', closeprobability: 60, salesstage: 1 },
    { opportunityid: 'opp-003', name: 'Adventure Works Analytics', estimatedvalue: 1200000, estimatedclosedate: '2026-06-30', parentaccountid: 'Adventure Works', closeprobability: 40, salesstage: 0 },
    { opportunityid: 'opp-004', name: 'Northwind Supply Chain', estimatedvalue: 680000, estimatedclosedate: '2026-05-10', parentaccountid: 'Northwind Traders', closeprobability: 85, salesstage: 3 },
    { opportunityid: 'opp-005', name: 'Woodgrove Digital Banking', estimatedvalue: 2500000, estimatedclosedate: '2026-08-01', parentaccountid: 'Woodgrove Bank', closeprobability: 30, salesstage: 0 },
  ],
  incident: [
    { incidentid: 'case-001', title: 'Login issues with SSO', customerid: 'Contoso Ltd', prioritycode: 1, statuscode: 1, createdon: '2026-02-25T10:30:00Z', caseorigincode: 2, description: 'Users unable to authenticate via SSO after recent update.' },
    { incidentid: 'case-002', title: 'Data export not working', customerid: 'Fabrikam Inc', prioritycode: 2, statuscode: 1, createdon: '2026-02-26T14:15:00Z', caseorigincode: 3, description: 'CSV export returns empty file for large datasets.' },
    { incidentid: 'case-003', title: 'Dashboard loading slowly', customerid: 'Adventure Works', prioritycode: 3, statuscode: 3, createdon: '2026-02-24T09:00:00Z', caseorigincode: 1, description: 'Executive dashboard takes over 30 seconds to load.' },
    { incidentid: 'case-004', title: 'Permission error on reports', customerid: 'Northwind Traders', prioritycode: 2, statuscode: 2, createdon: '2026-02-27T08:45:00Z', caseorigincode: 2, description: 'Manager role cannot access quarterly reports section.' },
    { incidentid: 'case-005', title: 'Mobile app crash on iOS', customerid: 'Tailspin Toys', prioritycode: 1, statuscode: 1, createdon: '2026-02-28T07:20:00Z', caseorigincode: 4, description: 'App crashes on launch on iOS 26 devices.' },
  ],
};
