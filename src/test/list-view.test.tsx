import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseLayoutXml, parseFetchXml, parseSiteMapXml } from '../utils/xml-parsers';
import { EntityView } from '../components/views/EntityView';
import { renderWithDataverse } from './test-utils';

// ============================================================
// Unit tests for LayoutXml parsing
// ============================================================
describe('parseLayoutXml', () => {
  it('parses columns from layout XML', () => {
    const layoutXml = `<grid>
      <row>
        <cell name="name" width="200"/>
        <cell name="telephone1" width="150"/>
        <cell name="emailaddress1" width="200"/>
      </row>
    </grid>`;

    const result = parseLayoutXml(layoutXml);
    expect(result.columns).toHaveLength(3);
    expect(result.columns[0]).toEqual({
      name: 'name',
      width: 200,
      logicalName: 'name',
      disableSorting: false,
    });
    expect(result.columns[1].width).toBe(150);
    expect(result.columns[2].logicalName).toBe('emailaddress1');
  });

  it('defaults width to 150 when not specified', () => {
    const layoutXml = `<grid><row><cell name="test"/></row></grid>`;
    const result = parseLayoutXml(layoutXml);
    expect(result.columns[0].width).toBe(150);
  });

  it('parses disableSorting flag', () => {
    const layoutXml = `<grid><row>
      <cell name="sortable" width="100"/>
      <cell name="unsortable" width="100" disableSorting="1"/>
    </row></grid>`;

    const result = parseLayoutXml(layoutXml);
    expect(result.columns[0].disableSorting).toBeFalsy();
    expect(result.columns[1].disableSorting).toBeTruthy();
  });

  it('handles empty grid gracefully', () => {
    const layoutXml = `<grid><row></row></grid>`;
    const result = parseLayoutXml(layoutXml);
    expect(result.columns).toHaveLength(0);
  });

  it('handles single column', () => {
    const layoutXml = `<grid><row><cell name="only" width="300"/></row></grid>`;
    const result = parseLayoutXml(layoutXml);
    expect(result.columns).toHaveLength(1);
    expect(result.columns[0].name).toBe('only');
  });
});

// ============================================================
// Unit tests for FetchXml parsing
// ============================================================
describe('parseFetchXml', () => {
  it('parses entity name and attributes', () => {
    const fetchXml = `<fetch>
      <entity name="account">
        <attribute name="name"/>
        <attribute name="telephone1"/>
        <attribute name="emailaddress1"/>
      </entity>
    </fetch>`;

    const result = parseFetchXml(fetchXml);
    expect(result.entity).toBe('account');
    expect(result.attributes).toEqual(['name', 'telephone1', 'emailaddress1']);
  });

  it('parses filters and conditions', () => {
    const fetchXml = `<fetch>
      <entity name="account">
        <attribute name="name"/>
        <filter>
          <condition attribute="statecode" operator="eq" value="0"/>
        </filter>
      </entity>
    </fetch>`;

    const result = parseFetchXml(fetchXml);
    expect(result.filters).toHaveLength(1);
    expect(result.filters[0].conditions).toHaveLength(1);
    expect(result.filters[0].conditions[0].attribute).toBe('statecode');
    expect(result.filters[0].conditions[0].operator).toBe('eq');
    // fast-xml-parser parses numeric attribute values as numbers
    expect(String(result.filters[0].conditions[0].value)).toBe('0');
  });

  it('parses order clauses', () => {
    const fetchXml = `<fetch>
      <entity name="account">
        <attribute name="name"/>
        <order attribute="name"/>
        <order attribute="createdon" descending="true"/>
      </entity>
    </fetch>`;

    const result = parseFetchXml(fetchXml);
    expect(result.orders).toHaveLength(2);
    expect(result.orders[0]).toEqual({ attribute: 'name', descending: false });
    expect(result.orders[1]).toEqual({ attribute: 'createdon', descending: true });
  });

  it('parses link-entity joins', () => {
    const fetchXml = `<fetch>
      <entity name="contact">
        <attribute name="fullname"/>
        <link-entity name="account" from="accountid" to="parentcustomerid" alias="acct" link-type="outer">
          <attribute name="name"/>
        </link-entity>
      </entity>
    </fetch>`;

    const result = parseFetchXml(fetchXml);
    expect(result.linkEntities).toHaveLength(1);
    expect(result.linkEntities[0]).toEqual({
      name: 'account',
      from: 'accountid',
      to: 'parentcustomerid',
      alias: 'acct',
      linkType: 'outer',
      attributes: ['name'],
    });
  });

  it('parses count and page from fetch attributes', () => {
    const fetchXml = `<fetch count="50" page="2">
      <entity name="account"><attribute name="name"/></entity>
    </fetch>`;

    const result = parseFetchXml(fetchXml);
    expect(result.count).toBe(50);
    expect(result.page).toBe(2);
  });

  it('defaults filter type to "and"', () => {
    const fetchXml = `<fetch>
      <entity name="account">
        <filter>
          <condition attribute="statecode" operator="eq" value="0"/>
        </filter>
      </entity>
    </fetch>`;

    const result = parseFetchXml(fetchXml);
    expect(result.filters[0].type).toBe('and');
  });
});

// ============================================================
// Unit tests for SiteMap XML parsing
// ============================================================
describe('parseSiteMapXml', () => {
  const siteMapXml = `<SiteMap>
    <Area Id="Sales" Title="Sales">
      <Group Id="Customers" Title="Customers">
        <SubArea Id="nav_accounts" Title="Accounts" Entity="account" Icon="building" />
        <SubArea Id="nav_contacts" Title="Contacts" Entity="contact" Icon="users" />
      </Group>
    </Area>
    <Area Id="Service" Title="Service">
      <Group Id="ServiceRecords" Title="Service">
        <SubArea Id="nav_cases" Title="Cases" Entity="incident" />
      </Group>
    </Area>
  </SiteMap>`;

  it('parses areas', () => {
    const result = parseSiteMapXml(siteMapXml);
    expect(result.areas).toHaveLength(2);
    expect(result.areas[0].id).toBe('Sales');
    expect(result.areas[0].title).toBe('Sales');
    expect(result.areas[1].id).toBe('Service');
  });

  it('parses groups within areas', () => {
    const result = parseSiteMapXml(siteMapXml);
    expect(result.areas[0].groups).toHaveLength(1);
    expect(result.areas[0].groups[0].title).toBe('Customers');
  });

  it('parses subareas with entity references', () => {
    const result = parseSiteMapXml(siteMapXml);
    const subareas = result.areas[0].groups[0].subareas;
    expect(subareas).toHaveLength(2);
    expect(subareas[0].entity).toBe('account');
    expect(subareas[0].title).toBe('Accounts');
    expect(subareas[0].icon).toBe('building');
    expect(subareas[1].entity).toBe('contact');
  });
});

// ============================================================
// Integration tests for EntityView component (list view)
// ============================================================
describe('EntityView component', () => {
  it('shows loading state initially', () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );
    expect(screen.getByText(/Loading account/)).toBeInTheDocument();
  });

  it('renders the entity collection name as heading', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });
  });

  it('renders the default view name as active', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Active Accounts')).toBeInTheDocument();
    });
  });

  it('renders column headers from view layout', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Account Name')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();
    });
  });

  it('renders record data in the grid', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
      expect(screen.getByText('Fabrikam Inc')).toBeInTheDocument();
      expect(screen.getByText('Adventure Works')).toBeInTheDocument();
    });
  });

  it('displays record count badge', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('8 records')).toBeInTheDocument();
    });
  });

  it('calls onRecordOpen when a row is clicked', async () => {
    const onRecordOpen = vi.fn();
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={onRecordOpen} />
    );

    await waitFor(() => {
      expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
    });

    const row = screen.getByText('Contoso Ltd').closest('tr')!;
    await userEvent.click(row);
    expect(onRecordOpen).toHaveBeenCalledWith('account', 'acc-001');
  });

  it('sorts records when column header is clicked', async () => {
    const user = userEvent.setup();
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Account Name')).toBeInTheDocument();
    });

    // Click column header to sort
    const nameHeader = screen.getByText('Account Name').closest('th')!;
    await user.click(nameHeader);

    // Should show sort indicator badge
    await waitFor(() => {
      expect(screen.getByText(/Sorted by Account Name/)).toBeInTheDocument();
    });
  });

  it('toggles row selection with checkbox', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
    });

    // Find checkboxes in the rows (not the header select-all)
    const checkboxes = screen.getAllByRole('checkbox');
    // First checkbox is the "select all" in the header, the rest are row checkboxes
    const firstRowCheckbox = checkboxes[1];
    await userEvent.click(firstRowCheckbox);

    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });

  it('selects all rows with header checkbox', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const selectAllCheckbox = checkboxes[0];
    await userEvent.click(selectAllCheckbox);

    await waitFor(() => {
      expect(screen.getByText('8 selected')).toBeInTheDocument();
    });
  });

  it('renders toolbar buttons', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Columns')).toBeInTheDocument();
    });
  });

  it('formats money values as currency in cells', async () => {
    renderWithDataverse(
      <EntityView entityName="account" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      // Contoso has revenue 5200000 => formatted as $5,200,000
      expect(screen.getByText('$5,200,000')).toBeInTheDocument();
    });
  });

  it('renders contact view with correct columns', async () => {
    renderWithDataverse(
      <EntityView entityName="contact" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Active Contacts')).toBeInTheDocument();
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Yvonne McKay')).toBeInTheDocument();
    });
  });

  it('renders lead view with status badges', async () => {
    renderWithDataverse(
      <EntityView entityName="lead" onRecordOpen={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Open Leads')).toBeInTheDocument();
      // Status badges from picklist options
      const newBadges = screen.getAllByText('New');
      expect(newBadges.length).toBeGreaterThan(0);
    });
  });
});
