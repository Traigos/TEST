import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseFormXml } from '../utils/xml-parsers';
import { FormView } from '../components/forms/FormView';
import { renderWithDataverse, MockDataverseClient } from './test-utils';

// ============================================================
// Unit tests for FormXml parsing
// ============================================================
describe('parseFormXml', () => {
  const simpleFormXml = `<form>
    <tabs>
      <tab id="tab_general" name="General" visible="true" expanded="true">
        <labels><label description="General" /></labels>
        <columns>
          <column width="100%">
            <sections>
              <section id="sec_info" name="Info" columns="2" visible="true">
                <labels><label description="Information" /></labels>
                <rows>
                  <row>
                    <cell id="cell_name" visible="true">
                      <labels><label description="Name" /></labels>
                      <control id="name" datafieldname="name" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                    </cell>
                    <cell id="cell_phone" visible="true">
                      <labels><label description="Phone" /></labels>
                      <control id="telephone1" datafieldname="telephone1" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" />
                    </cell>
                  </row>
                  <row>
                    <cell id="cell_hidden" visible="false">
                      <labels><label description="Hidden Field" /></labels>
                      <control id="hidden" datafieldname="hiddenfield" />
                    </cell>
                    <cell id="cell_email" visible="true">
                      <labels><label description="Email" /></labels>
                      <control id="emailaddress1" datafieldname="emailaddress1" />
                    </cell>
                  </row>
                </rows>
              </section>
            </sections>
          </column>
        </columns>
      </tab>
    </tabs>
  </form>`;

  it('parses form id, name, and entity name', () => {
    const result = parseFormXml(simpleFormXml, 'form-001', 'Test Form', 'account');
    expect(result.formid).toBe('form-001');
    expect(result.name).toBe('Test Form');
    expect(result.entityName).toBe('account');
  });

  it('parses tabs correctly', () => {
    const result = parseFormXml(simpleFormXml, 'f1', 'F', 'account');
    expect(result.tabs).toHaveLength(1);
    expect(result.tabs[0].id).toBe('tab_general');
    expect(result.tabs[0].label).toBe('General');
    expect(result.tabs[0].visible).toBe(true);
    expect(result.tabs[0].expanded).toBe(true);
  });

  it('parses sections with correct column count', () => {
    const result = parseFormXml(simpleFormXml, 'f1', 'F', 'account');
    const section = result.tabs[0].columns[0].sections[0];
    expect(section.id).toBe('sec_info');
    expect(section.label).toBe('Information');
    expect(section.columns).toBe(2);
    expect(section.visible).toBe(true);
  });

  it('parses rows and cells with controls', () => {
    const result = parseFormXml(simpleFormXml, 'f1', 'F', 'account');
    const rows = result.tabs[0].columns[0].sections[0].rows;
    expect(rows).toHaveLength(2);

    const firstRow = rows[0];
    expect(firstRow.cells).toHaveLength(2);
    expect(firstRow.cells[0].label).toBe('Name');
    expect(firstRow.cells[0].control?.datafieldname).toBe('name');
    expect(firstRow.cells[1].label).toBe('Phone');
    expect(firstRow.cells[1].control?.datafieldname).toBe('telephone1');
  });

  it('parses cell visibility', () => {
    const result = parseFormXml(simpleFormXml, 'f1', 'F', 'account');
    const rows = result.tabs[0].columns[0].sections[0].rows;
    expect(rows[1].cells[0].visible).toBe(false);
    expect(rows[1].cells[1].visible).toBe(true);
  });

  it('parses control classid', () => {
    const result = parseFormXml(simpleFormXml, 'f1', 'F', 'account');
    const cell = result.tabs[0].columns[0].sections[0].rows[0].cells[0];
    expect(cell.control?.classid).toBe('{4273EDBD-AC1D-40d3-9FB2-095C621B552D}');
  });

  it('handles multi-tab forms', () => {
    const multiTabXml = `<form>
      <tabs>
        <tab id="tab1" name="Tab1" visible="true" expanded="true">
          <labels><label description="First Tab" /></labels>
          <columns><column><sections>
            <section id="s1" name="S1" columns="1" visible="true">
              <labels><label description="Section 1" /></labels>
              <rows><row><cell id="c1" visible="true"><labels><label description="Field 1" /></labels><control id="f1" datafieldname="field1" /></cell></row></rows>
            </section>
          </sections></column></columns>
        </tab>
        <tab id="tab2" name="Tab2" visible="true" expanded="false">
          <labels><label description="Second Tab" /></labels>
          <columns><column><sections>
            <section id="s2" name="S2" columns="1" visible="true">
              <labels><label description="Section 2" /></labels>
              <rows><row><cell id="c2" visible="true"><labels><label description="Field 2" /></labels><control id="f2" datafieldname="field2" /></cell></row></rows>
            </section>
          </sections></column></columns>
        </tab>
      </tabs>
    </form>`;

    const result = parseFormXml(multiTabXml, 'f2', 'Multi', 'account');
    expect(result.tabs).toHaveLength(2);
    expect(result.tabs[0].label).toBe('First Tab');
    expect(result.tabs[0].expanded).toBe(true);
    expect(result.tabs[1].label).toBe('Second Tab');
    expect(result.tabs[1].expanded).toBe(false);
  });

  it('handles empty form gracefully', () => {
    const emptyXml = '<form><tabs></tabs></form>';
    const result = parseFormXml(emptyXml, 'f3', 'Empty', 'account');
    expect(result.tabs).toHaveLength(0);
  });

  it('defaults section columns to 1 when not specified', () => {
    const noColsXml = `<form><tabs>
      <tab id="t" name="T" visible="true" expanded="true">
        <labels><label description="T" /></labels>
        <columns><column><sections>
          <section id="s" name="S" visible="true">
            <labels><label description="S" /></labels>
            <rows></rows>
          </section>
        </sections></column></columns>
      </tab>
    </tabs></form>`;

    const result = parseFormXml(noColsXml, 'f4', 'NoCols', 'account');
    expect(result.tabs[0].columns[0].sections[0].columns).toBe(1);
  });
});

// ============================================================
// Integration tests for FormView component
// ============================================================
describe('FormView component', () => {
  it('renders the record title after loading', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    // Initially shows loading
    expect(screen.getByText('Loading record...')).toBeInTheDocument();

    // Wait for data to load - the record name should appear
    await waitFor(() => {
      expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
    });
  });

  it('renders form section labels from FormXml', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Account Information')).toBeInTheDocument();
    });
  });

  it('renders field labels from cell labels in the XML', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Account Name')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  it('populates input fields with record data', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Contoso Ltd');
      expect(nameInput).toBeInTheDocument();
    });
  });

  it('renders tab navigation for multi-tab forms', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    // Account form has General and Details tabs
    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('enables Save button only after field changes', async () => {
    const user = userEvent.setup();
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
    });

    // Save button should be disabled initially
    const saveButton = screen.getByText('Save').closest('button')!;
    expect(saveButton).toBeDisabled();

    // Edit a field
    const nameInput = screen.getByDisplayValue('Contoso Ltd');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');

    // Save should now be enabled
    expect(saveButton).toBeEnabled();
  });

  it('calls onBack when Back button is clicked', async () => {
    const onBack = vi.fn();
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={onBack} />
    );

    await waitFor(() => {
      expect(screen.getByText('Contoso Ltd')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back').closest('button')!;
    await userEvent.click(backButton);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders picklist fields as select dropdowns', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Industry')).toBeInTheDocument();
    });

    // Industry field should be a <select> with options
    const industrySelect = screen.getByText('Industry')
      .closest('.glass-form-group')!
      .querySelector('select');
    expect(industrySelect).toBeInTheDocument();
    expect(within(industrySelect!).getByText('Technology')).toBeInTheDocument();
    expect(within(industrySelect!).getByText('Healthcare')).toBeInTheDocument();
  });

  it('renders number fields with type=number', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Number of Employees')).toBeInTheDocument();
    });

    const group = screen.getByText('Number of Employees').closest('.glass-form-group')!;
    const input = group.querySelector('input[type="number"]');
    expect(input).toBeInTheDocument();
  });

  it('renders textarea for memo fields', async () => {
    const user = userEvent.setup();
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    // Switch to Details tab which has the Description memo field
    const detailsTab = screen.getByText('Details');
    await user.click(detailsTab);

    // After switching, look for a textarea in the form body
    await waitFor(() => {
      const formBody = document.querySelector('.form-body');
      expect(formBody).toBeInTheDocument();
      const textarea = formBody?.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });
  });

  it('shows entity display name badge', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  it('marks required fields with asterisk', async () => {
    renderWithDataverse(
      <FormView entityName="account" recordId="acc-001" onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Account Name')).toBeInTheDocument();
    });

    // Account Name is required - the label group should contain *
    const nameLabel = screen.getByText('Account Name').closest('label');
    expect(nameLabel?.textContent).toContain('*');
  });
});
