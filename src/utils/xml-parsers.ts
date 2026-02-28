// ============================================================
// XML Parsers for Dataverse metadata
// Parses FormXml, SiteMapXml, FetchXml, LayoutXml
// ============================================================

import { XMLParser } from 'fast-xml-parser';
import type {
  ParsedForm,
  FormTab,
  FormColumn,
  FormSection,
  FormRow,
  FormCell,
  FormControl,
  ParsedSiteMap,
  SiteMapArea,
  SiteMapGroup,
  SiteMapSubArea,
  ParsedViewLayout,
  ViewColumn,
  ParsedFetchXml,
  FetchFilter,
  FetchCondition,
  FetchOrder,
  FetchLinkEntity,
} from '../types/dataverse';

type XmlNode = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseAttributeValue: true,
});

function ensureArray(value: unknown): XmlNode[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value as XmlNode[];
  return [value as XmlNode];
}

// ============================================================
// Form XML Parser
// ============================================================
export function parseFormXml(formXml: string, formId: string, formName: string, entityName: string): ParsedForm {
  const parsed = parser.parse(formXml);
  const form = (parsed.form || parsed.Form || {}) as XmlNode;
  const tabs = (form.tabs || form.Tabs || {}) as XmlNode;
  const tabList = ensureArray(tabs.tab || tabs.Tab);

  const parsedTabs: FormTab[] = tabList.map((tab) => {
    const tabLabels = (tab.labels || tab.Labels || {}) as XmlNode;
    const labelList = ensureArray(tabLabels.label || tabLabels.Label);
    const firstLabel = labelList[0] as XmlNode | undefined;

    const columns = (tab.columns || tab.Columns || {}) as XmlNode;
    const columnList = ensureArray(columns.column || columns.Column);

    const parsedColumns: FormColumn[] = columnList.map((col) => {
      const sections = (col.sections || col.Sections || {}) as XmlNode;
      const sectionList = ensureArray(sections.section || sections.Section);

      const parsedSections: FormSection[] = sectionList.map((section) => {
        const sectionLabels = (section.labels || section.Labels || {}) as XmlNode;
        const sectionLabelList = ensureArray(sectionLabels.label || sectionLabels.Label);
        const firstSectionLabel = sectionLabelList[0] as XmlNode | undefined;

        const rows = (section.rows || section.Rows || {}) as XmlNode;
        const rowList = ensureArray(rows.row || rows.Row);

        const parsedRows: FormRow[] = rowList.map((row) => {
          const cells = row.cell || row.Cell;
          const cellList = ensureArray(cells);

          const parsedCells: FormCell[] = cellList.map((cell) => {
            const cellLabels = (cell.labels || cell.Labels || {}) as XmlNode;
            const cellLabelList = ensureArray(cellLabels.label || cellLabels.Label);
            const firstCellLabel = cellLabelList[0] as XmlNode | undefined;

            let control: FormControl | undefined;
            const controlNode = cell.control || cell.Control;
            if (controlNode) {
              const ctrl = controlNode as XmlNode;
              const params = ctrl.parameters || ctrl.Parameters;
              control = {
                id: (ctrl['@_id'] as string) || '',
                classid: ctrl['@_classid'] as string,
                datafieldname: (ctrl['@_datafieldname'] as string) || (ctrl['@_indicationOfSubgrid'] as string),
                disabled: ctrl['@_disabled'] === 'true' || ctrl['@_disabled'] === true,
                controltype: ctrl['@_uniqueid'] as string,
                parameters: params ? (params as Record<string, string>) : undefined,
              };
            }

            return {
              id: (cell['@_id'] as string) || '',
              control,
              label: firstCellLabel
                ? (firstCellLabel['@_description'] as string) || ''
                : '',
              visible: cell['@_visible'] !== 'false' && cell['@_visible'] !== false,
              colspan: cell['@_colspan'] ? Number(cell['@_colspan']) : undefined,
              rowspan: cell['@_rowspan'] ? Number(cell['@_rowspan']) : undefined,
            } as FormCell;
          });

          return { cells: parsedCells };
        });

        return {
          id: (section['@_id'] as string) || '',
          name: (section['@_name'] as string) || '',
          label: firstSectionLabel
            ? (firstSectionLabel['@_description'] as string) || ''
            : '',
          visible: section['@_visible'] !== 'false' && section['@_visible'] !== false,
          columns: section['@_columns'] ? Number(section['@_columns']) : 1,
          rows: parsedRows,
        } as FormSection;
      });

      return {
        width: (col['@_width'] as string) || '100%',
        sections: parsedSections,
      } as FormColumn;
    });

    return {
      id: (tab['@_id'] as string) || '',
      name: (tab['@_name'] as string) || '',
      label: firstLabel
        ? (firstLabel['@_description'] as string) || ''
        : '',
      visible: tab['@_visible'] !== 'false' && tab['@_visible'] !== false,
      expanded: tab['@_expanded'] !== 'false' && tab['@_expanded'] !== false,
      columns: parsedColumns,
    } as FormTab;
  });

  return {
    formid: formId,
    name: formName,
    entityName,
    tabs: parsedTabs,
  };
}

// ============================================================
// SiteMap XML Parser
// ============================================================
export function parseSiteMapXml(siteMapXml: string): ParsedSiteMap {
  const parsed = parser.parse(siteMapXml);
  const siteMap = (parsed.SiteMap || parsed.sitemap || {}) as XmlNode;
  const areaList = ensureArray(siteMap.Area || siteMap.area);

  const areas: SiteMapArea[] = areaList.map((area) => {
    const groupList = ensureArray(area.Group || area.group);

    const groups: SiteMapGroup[] = groupList.map((group) => {
      const subAreaList = ensureArray(group.SubArea || group.subarea);

      const subareas: SiteMapSubArea[] = subAreaList.map((sub) => ({
        id: (sub['@_Id'] as string) || (sub['@_id'] as string) || '',
        entity: (sub['@_Entity'] as string) || (sub['@_entity'] as string),
        title: (sub['@_Title'] as string) || (sub['@_title'] as string),
        icon: (sub['@_Icon'] as string) || (sub['@_icon'] as string),
        type: sub['@_Type'] as string,
        url: sub['@_Url'] as string,
        defaultDashboard: sub['@_DefaultDashboard'] as string,
      }));

      return {
        id: (group['@_Id'] as string) || (group['@_id'] as string) || '',
        title: (group['@_Title'] as string) || (group['@_title'] as string) || '',
        subareas,
      } as SiteMapGroup;
    });

    return {
      id: (area['@_Id'] as string) || (area['@_id'] as string) || '',
      title: (area['@_Title'] as string) || (area['@_title'] as string) || '',
      icon: (area['@_Icon'] as string) || (area['@_icon'] as string),
      showGroups: area['@_ShowGroups'] === 'true' || area['@_ShowGroups'] === true,
      groups,
    } as SiteMapArea;
  });

  return { areas };
}

// ============================================================
// LayoutXml Parser (View Column Layout)
// ============================================================
export function parseLayoutXml(layoutXml: string): ParsedViewLayout {
  const parsed = parser.parse(layoutXml);
  const grid = (parsed.grid || {}) as XmlNode;
  const row = (grid.row || {}) as XmlNode;
  const cellList = ensureArray(row.cell);

  const columns: ViewColumn[] = cellList.map((cell) => ({
    name: (cell['@_name'] as string) || '',
    width: Number(cell['@_width']) || 150,
    logicalName: (cell['@_name'] as string) || '',
    disableSorting: cell['@_disableSorting'] === '1' || cell['@_disableSorting'] === true,
  }));

  return { columns };
}

// ============================================================
// FetchXml Parser
// ============================================================
export function parseFetchXml(fetchXml: string): ParsedFetchXml {
  const parsed = parser.parse(fetchXml);
  const fetch = (parsed.fetch || {}) as XmlNode;
  const entity = (fetch.entity || {}) as XmlNode;

  const attributes = ensureArray(entity.attribute || entity.Attribute).map(
    (attr) => (attr['@_name'] as string) || ''
  );

  const filterNodes = ensureArray(entity.filter);
  const filters: FetchFilter[] = filterNodes.map((f) => {
    const conditions = ensureArray(f.condition).map((c) => ({
      attribute: (c['@_attribute'] as string) || '',
      operator: (c['@_operator'] as string) || 'eq',
      value: c['@_value'] as string | undefined,
    })) as FetchCondition[];

    return {
      type: ((f['@_type'] as string) || 'and') as 'and' | 'or',
      conditions,
    } as FetchFilter;
  });

  const orderNodes = ensureArray(entity.order);
  const orders: FetchOrder[] = orderNodes.map((o) => ({
    attribute: (o['@_attribute'] as string) || '',
    descending: o['@_descending'] === 'true' || o['@_descending'] === true,
  }));

  const linkEntityNodes = ensureArray(entity['link-entity']);
  const linkEntities: FetchLinkEntity[] = linkEntityNodes.map((le) => {
    const leAttrs = ensureArray(le.attribute || le.Attribute).map(
      (a) => (a['@_name'] as string) || ''
    );
    return {
      name: (le['@_name'] as string) || '',
      from: (le['@_from'] as string) || '',
      to: (le['@_to'] as string) || '',
      alias: (le['@_alias'] as string) || '',
      linkType: (le['@_link-type'] as string) || 'inner',
      attributes: leAttrs,
    };
  });

  return {
    entity: (entity['@_name'] as string) || '',
    attributes,
    filters,
    orders,
    linkEntities,
    count: fetch['@_count'] ? Number(fetch['@_count']) : undefined,
    page: fetch['@_page'] ? Number(fetch['@_page']) : undefined,
  };
}
