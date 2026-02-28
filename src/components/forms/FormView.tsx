import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Trash2, MoreHorizontal, Copy } from 'lucide-react';
import { LookupField } from '../common/LookupField';
import { useDataverse } from '../../hooks/useDataverse';
import { parseFormXml } from '../../utils/xml-parsers';
import type {
  ParsedForm,
  FormTab,
  FormSection,
  FormCell,
  EntityMetadata,
  DataRecord,
  AttributeMetadata,
} from '../../types/dataverse';
import { FormType } from '../../types/dataverse';

interface FormViewProps {
  entityName: string;
  recordId: string;
  onBack: () => void;
}

export function FormView({ entityName, recordId, onBack }: FormViewProps) {
  const { client } = useDataverse();
  const [form, setForm] = useState<ParsedForm | null>(null);
  const [metadata, setMetadata] = useState<EntityMetadata | null>(null);
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadForm();
  }, [entityName, recordId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadForm = async () => {
    try {
      setLoading(true);
      const [forms, entityMeta] = await Promise.all([
        client.getSystemForms(entityName, FormType.Main),
        client.getEntityMetadata(entityName),
      ]);

      setMetadata(entityMeta);

      const defaultForm = forms.find((f) => f.isdefault) || forms[0];
      if (defaultForm) {
        const parsed = parseFormXml(
          defaultForm.formxml,
          defaultForm.formid,
          defaultForm.name,
          entityName
        );
        setForm(parsed);
        if (parsed.tabs.length > 0) {
          setActiveTab(parsed.tabs[0].id);
        }
      }

      const rec = await client.getRecord(entityMeta.entitySetName, recordId);
      setRecord(rec);
      setEditedFields({});
      setDirty(false);
    } catch (err) {
      console.error('Failed to load form:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldValue = useCallback(
    (fieldName: string): unknown => {
      if (fieldName in editedFields) return editedFields[fieldName];
      return record?.[fieldName] ?? '';
    },
    [record, editedFields]
  );

  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      setEditedFields((prev) => ({ ...prev, [fieldName]: value }));
      setDirty(true);
    },
    []
  );

  const getAttributeMeta = useCallback(
    (fieldName: string): AttributeMetadata | undefined => {
      return metadata?.attributes.find((a) => a.logicalName === fieldName);
    },
    [metadata]
  );

  const handleSave = async () => {
    if (!metadata || !record) return;
    try {
      await client.updateRecord(
        metadata.entitySetName,
        recordId,
        editedFields as Partial<DataRecord>
      );
      setRecord({ ...record, ...editedFields });
      setEditedFields({});
      setDirty(false);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const recordTitle = record && metadata
    ? String(record[metadata.primaryNameAttribute] || 'Untitled')
    : 'Loading...';

  if (loading) {
    return (
      <div className="form-view-loading">
        <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <div className="glass-spinner" style={{ margin: '0 auto var(--space-md)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-view glass-reveal">
      {/* Form Header */}
      <div className="form-view-header glass-panel">
        <div className="form-header-left">
          <button className="glass-button small" onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="form-header-title">
            <h2>{recordTitle}</h2>
            <span className="glass-badge">{metadata?.displayName}</span>
          </div>
        </div>
        <div className="form-header-actions">
          <button
            className="glass-button primary small"
            onClick={handleSave}
            disabled={!dirty}
          >
            <Save size={14} /> Save
          </button>
          <button className="glass-button small">
            <Copy size={14} /> Duplicate
          </button>
          <button className="glass-button danger small">
            <Trash2 size={14} /> Delete
          </button>
          <button className="glass-button icon-only small">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      {form && form.tabs.length > 1 && (
        <div className="form-tabs">
          <div className="glass-nav">
            {form.tabs
              .filter((t) => t.visible)
              .map((tab) => (
                <button
                  key={tab.id}
                  className={`glass-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label || tab.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="form-body">
        {form?.tabs
          .filter((tab) => tab.visible && tab.id === activeTab)
          .map((tab) => (
            <FormTabContent
              key={tab.id}
              tab={tab}
              getFieldValue={getFieldValue}
              onFieldChange={handleFieldChange}
              getAttributeMeta={getAttributeMeta}
            />
          ))}
      </div>
    </div>
  );
}

// -- Tab Content --
function FormTabContent({
  tab,
  getFieldValue,
  onFieldChange,
  getAttributeMeta,
}: {
  tab: FormTab;
  getFieldValue: (field: string) => unknown;
  onFieldChange: (field: string, value: unknown) => void;
  getAttributeMeta: (field: string) => AttributeMetadata | undefined;
}) {
  return (
    <div className="form-tab-content">
      {tab.columns.map((column, ci) => (
        <div key={ci} className="form-column" style={{ width: column.width }}>
          {column.sections
            .filter((s) => s.visible)
            .map((section) => (
              <FormSectionContent
                key={section.id}
                section={section}
                getFieldValue={getFieldValue}
                onFieldChange={onFieldChange}
                getAttributeMeta={getAttributeMeta}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

// -- Section Content --
function FormSectionContent({
  section,
  getFieldValue,
  onFieldChange,
  getAttributeMeta,
}: {
  section: FormSection;
  getFieldValue: (field: string) => unknown;
  onFieldChange: (field: string, value: unknown) => void;
  getAttributeMeta: (field: string) => AttributeMetadata | undefined;
}) {
  return (
    <div className="form-section glass-card">
      {section.label && <h3 className="form-section-title">{section.label}</h3>}
      <div
        className="form-section-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${section.columns}, 1fr)`,
          gap: 'var(--space-md)',
        }}
      >
        {section.rows.map((row, ri) =>
          row.cells
            .filter((cell) => cell.visible)
            .map((cell) => (
              <FormCellContent
                key={cell.id || ri}
                cell={cell}
                getFieldValue={getFieldValue}
                onFieldChange={onFieldChange}
                getAttributeMeta={getAttributeMeta}
              />
            ))
        )}
      </div>
    </div>
  );
}

// -- Cell / Field Content --
function FormCellContent({
  cell,
  getFieldValue,
  onFieldChange,
  getAttributeMeta,
}: {
  cell: FormCell;
  getFieldValue: (field: string) => unknown;
  onFieldChange: (field: string, value: unknown) => void;
  getAttributeMeta: (field: string) => AttributeMetadata | undefined;
}) {
  const fieldName = cell.control?.datafieldname;
  if (!fieldName) return null;

  const attrMeta = getAttributeMeta(fieldName);
  const value = getFieldValue(fieldName);
  const label = cell.label || attrMeta?.displayName || fieldName;

  const renderInput = () => {
    switch (attrMeta?.attributeType) {
      case 'Memo':
        return (
          <textarea
            className="glass-input glass-textarea"
            value={String(value || '')}
            onChange={(e) => onFieldChange(fieldName, e.target.value)}
            rows={3}
          />
        );

      case 'Picklist':
      case 'Status':
      case 'State':
        return (
          <select
            className="glass-input glass-select"
            value={String(value ?? '')}
            onChange={(e) => onFieldChange(fieldName, Number(e.target.value))}
          >
            <option value="">-- Select --</option>
            {attrMeta.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'Boolean':
        return (
          <label className="form-toggle">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onFieldChange(fieldName, e.target.checked)}
            />
            <span className="form-toggle-slider" />
          </label>
        );

      case 'Integer':
      case 'BigInt':
        return (
          <input
            type="number"
            className="glass-input"
            value={String(value || '')}
            onChange={(e) => onFieldChange(fieldName, Number(e.target.value))}
            min={attrMeta.minValue}
            max={attrMeta.maxValue}
          />
        );

      case 'Decimal':
      case 'Double':
      case 'Money':
        return (
          <input
            type="number"
            className="glass-input"
            value={String(value || '')}
            onChange={(e) => onFieldChange(fieldName, Number(e.target.value))}
            step="0.01"
            min={attrMeta.minValue}
            max={attrMeta.maxValue}
          />
        );

      case 'DateTime':
        return (
          <input
            type="date"
            className="glass-input"
            value={value ? String(value).substring(0, 10) : ''}
            onChange={(e) => onFieldChange(fieldName, e.target.value)}
          />
        );

      case 'Lookup':
      case 'Customer':
      case 'Owner':
        return (
          <LookupField
            value={value}
            targetEntity={attrMeta.targets?.[0]}
            label={label}
            onChange={(v) => onFieldChange(fieldName, v)}
          />
        );

      default:
        return (
          <input
            type="text"
            className="glass-input"
            value={String(value || '')}
            onChange={(e) => onFieldChange(fieldName, e.target.value)}
            maxLength={attrMeta?.maxLength}
          />
        );
    }
  };

  return (
    <div
      className="glass-form-group"
      style={{
        gridColumn: cell.colspan ? `span ${cell.colspan}` : undefined,
      }}
    >
      <label className="glass-form-label">
        {label}
        {attrMeta?.isRequired && <span style={{ color: 'var(--color-danger)' }}> *</span>}
      </label>
      {renderInput()}
    </div>
  );
}
