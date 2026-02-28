// ============================================================
// Dataverse Metadata Type Definitions
// Mirrors the structure of Power Platform model-driven app tables
// ============================================================

// -- App Module --
export interface AppModule {
  appmoduleid: string;
  appmoduleidunique: string;
  name: string;
  uniquename: string;
  description?: string;
  url?: string;
  clienttype?: number;
  formfactor?: number;
  navigationtype?: number;
  appmoduleversion?: string;
  configxml?: string;
  isdefault?: boolean;
  isfeatured?: boolean;
  publishedon?: string;
  webresourceid?: string;
  statecode: number;
  statuscode: number;
}

// -- App Module Component --
export const ComponentType = {
  Entity: 1,
  View: 26,
  BusinessProcessFlow: 29,
  Command: 46,
  Chart: 59,
  Form: 60,
  SiteMap: 62,
} as const;
export type ComponentType = (typeof ComponentType)[keyof typeof ComponentType];

export interface AppModuleComponent {
  appmodulecomponentid: string;
  appmodulecomponentidunique: string;
  appmoduleidunique: string;
  componenttype: ComponentType;
  objectid: string;
  rootappmodulecomponentid?: string;
  rootcomponentbehavior?: number;
  isdefault?: boolean;
  ismetadata?: boolean;
}

// -- System Form --
export const FormType = {
  Dashboard: 0,
  Main: 2,
  MainInteractiveExperience: 3,
  QuickViewForm: 4,
  QuickCreate: 5,
  Dialog: 8,
  InteractionCentricDashboard: 10,
  Card: 11,
  AppSidePane: 13,
} as const;
export type FormType = (typeof FormType)[keyof typeof FormType];

export interface SystemForm {
  formid: string;
  name: string;
  objecttypecode: string;
  type: FormType;
  formxml: string;
  formjson?: string;
  description?: string;
  formactivationstate: number;
  formpresentation?: number;
  isdefault: boolean;
  isdesktopenabled?: boolean;
  istabletenabled?: boolean;
  ancestorformid?: string;
  uniquename?: string;
  version?: string;
}

// -- Parsed Form XML Structure --
export interface ParsedForm {
  formid: string;
  name: string;
  entityName: string;
  tabs: FormTab[];
  header?: FormSection;
  footer?: FormSection;
}

export interface FormTab {
  id: string;
  name: string;
  label: string;
  visible: boolean;
  expanded: boolean;
  columns: FormColumn[];
}

export interface FormColumn {
  width: string;
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  name: string;
  label: string;
  visible: boolean;
  columns: number;
  rows: FormRow[];
}

export interface FormRow {
  cells: FormCell[];
}

export interface FormCell {
  id: string;
  control?: FormControl;
  label?: string;
  visible: boolean;
  colspan?: number;
  rowspan?: number;
}

export interface FormControl {
  id: string;
  classid?: string;
  datafieldname?: string;
  disabled?: boolean;
  controltype?: string;
  parameters?: Record<string, string>;
}

// -- Saved Query (System View) --
export const QueryType = {
  MainApplicationView: 0,
  AdvancedSearch: 1,
  AssociatedView: 2,
  QuickFindView: 4,
  ReportingView: 8,
  LookupView: 64,
  SubGrid: 2048,
} as const;
export type QueryType = (typeof QueryType)[keyof typeof QueryType];

export interface SavedQuery {
  savedqueryid: string;
  name: string;
  returnedtypecode: string;
  fetchxml: string;
  layoutxml: string;
  layoutjson?: string;
  querytype: QueryType;
  isdefault: boolean;
  isquickfindquery?: boolean;
  description?: string;
  statecode: number;
  statuscode: number;
}

// -- Parsed View Layout --
export interface ParsedViewLayout {
  columns: ViewColumn[];
}

export interface ViewColumn {
  name: string;
  width: number;
  logicalName: string;
  disableSorting?: boolean;
}

// -- Parsed FetchXML --
export interface ParsedFetchXml {
  entity: string;
  attributes: string[];
  filters: FetchFilter[];
  orders: FetchOrder[];
  linkEntities: FetchLinkEntity[];
  count?: number;
  page?: number;
}

export interface FetchFilter {
  type: 'and' | 'or';
  conditions: FetchCondition[];
}

export interface FetchCondition {
  attribute: string;
  operator: string;
  value?: string;
}

export interface FetchOrder {
  attribute: string;
  descending: boolean;
}

export interface FetchLinkEntity {
  name: string;
  from: string;
  to: string;
  alias: string;
  linkType: string;
  attributes: string[];
}

// -- SiteMap --
export interface SiteMap {
  sitemapid: string;
  sitemapxml: string;
  sitemapname?: string;
  sitemapnameunique?: string;
  showhome?: boolean;
  showrecents?: boolean;
  showpinned?: boolean;
  enablecollapsiblegroups?: boolean;
}

// -- Parsed SiteMap --
export interface ParsedSiteMap {
  areas: SiteMapArea[];
}

export interface SiteMapArea {
  id: string;
  title: string;
  icon?: string;
  showGroups?: boolean;
  groups: SiteMapGroup[];
}

export interface SiteMapGroup {
  id: string;
  title: string;
  subareas: SiteMapSubArea[];
}

export interface SiteMapSubArea {
  id: string;
  entity?: string;
  title?: string;
  icon?: string;
  type?: string;
  url?: string;
  defaultDashboard?: string;
}

// -- Entity Metadata --
export interface EntityMetadata {
  metadataId: string;
  logicalName: string;
  schemaName: string;
  displayName: string;
  displayCollectionName: string;
  entitySetName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  objectTypeCode: number;
  isCustomEntity: boolean;
  isActivity: boolean;
  iconSmallName?: string;
  iconMediumName?: string;
  iconLargeName?: string;
  isQuickCreateEnabled?: boolean;
  attributes: AttributeMetadata[];
}

export const AttributeType = {
  String: 'String',
  Integer: 'Integer',
  Decimal: 'Decimal',
  Money: 'Money',
  DateTime: 'DateTime',
  Boolean: 'Boolean',
  Picklist: 'Picklist',
  Lookup: 'Lookup',
  Memo: 'Memo',
  UniqueIdentifier: 'UniqueIdentifier',
  Owner: 'Owner',
  Customer: 'Customer',
  Status: 'Status',
  State: 'State',
  BigInt: 'BigInt',
  Double: 'Double',
  Image: 'Image',
  File: 'File',
  MultiSelectPicklist: 'MultiSelectPicklist',
} as const;
export type AttributeType = (typeof AttributeType)[keyof typeof AttributeType];

export interface AttributeMetadata {
  logicalName: string;
  schemaName: string;
  displayName: string;
  attributeType: AttributeType;
  isRequired: boolean;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: OptionMetadata[];
  targets?: string[]; // For lookup fields
  format?: string;
  precision?: number;
}

export interface OptionMetadata {
  value: number;
  label: string;
  color?: string;
}

// -- Data Record --
export type DataRecord = Record<string, unknown> & {
  _id?: string;
  _entityName?: string;
};

// -- API Response Wrapper --
export interface DataverseResponse<T> {
  value: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}
