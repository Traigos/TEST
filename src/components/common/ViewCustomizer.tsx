import { useState, useCallback } from 'react';
import { GripVertical, Eye, EyeOff, X, Columns3 } from 'lucide-react';
import type { ViewColumn, AttributeMetadata } from '../../types/dataverse';

interface ViewCustomizerProps {
  columns: ViewColumn[];
  availableAttributes: AttributeMetadata[];
  onColumnsChange: (columns: ViewColumn[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewCustomizer({
  columns,
  availableAttributes,
  onColumnsChange,
  isOpen,
  onClose,
}: ViewCustomizerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;

      const newColumns = [...columns];
      const [moved] = newColumns.splice(dragIndex, 1);
      newColumns.splice(index, 0, moved);
      onColumnsChange(newColumns);
      setDragIndex(index);
    },
    [dragIndex, columns, onColumnsChange]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  const toggleColumn = useCallback(
    (logicalName: string) => {
      setHiddenColumns((prev) => {
        const next = new Set(prev);
        if (next.has(logicalName)) {
          next.delete(logicalName);
        } else {
          next.add(logicalName);
        }

        // Update columns: filter out hidden ones
        const visibleColumns = columns.filter((c) => !next.has(c.logicalName));
        onColumnsChange(visibleColumns);
        return next;
      });
    },
    [columns, onColumnsChange]
  );

  const addColumn = useCallback(
    (attr: AttributeMetadata) => {
      const exists = columns.find((c) => c.logicalName === attr.logicalName);
      if (exists) return;

      const newCol: ViewColumn = {
        name: attr.logicalName,
        width: 150,
        logicalName: attr.logicalName,
      };
      onColumnsChange([...columns, newCol]);
      setHiddenColumns((prev) => {
        const next = new Set(prev);
        next.delete(attr.logicalName);
        return next;
      });
    },
    [columns, onColumnsChange]
  );

  const removeColumn = useCallback(
    (logicalName: string) => {
      onColumnsChange(columns.filter((c) => c.logicalName !== logicalName));
    },
    [columns, onColumnsChange]
  );

  const handleWidthChange = useCallback(
    (index: number, width: number) => {
      const newColumns = [...columns];
      newColumns[index] = { ...newColumns[index], width: Math.max(60, width) };
      onColumnsChange(newColumns);
    },
    [columns, onColumnsChange]
  );

  if (!isOpen) return null;

  const columnLogicalNames = new Set(columns.map((c) => c.logicalName));
  const unusedAttributes = availableAttributes.filter(
    (a) =>
      !columnLogicalNames.has(a.logicalName) &&
      a.attributeType !== 'UniqueIdentifier'
  );

  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div className="glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="glass-modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Columns3 size={20} />
            Customize Columns
          </h2>
          <button className="glass-button icon-only small" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="glass-modal-body">
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label className="glass-form-label" style={{ marginBottom: 8, display: 'block' }}>
              Active Columns (drag to reorder)
            </label>
            <div className="view-customizer-columns">
              {columns.map((col, index) => {
                const attr = availableAttributes.find(
                  (a) => a.logicalName === col.logicalName
                );
                const isHidden = hiddenColumns.has(col.logicalName);
                return (
                  <div
                    key={col.logicalName}
                    className={`view-customizer-item ${dragIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <GripVertical size={14} className="drag-handle" />
                    <span className="col-name">
                      {attr?.displayName || col.logicalName}
                    </span>
                    <input
                      type="number"
                      className="col-width-input"
                      value={col.width}
                      onChange={(e) => handleWidthChange(index, Number(e.target.value))}
                      min={60}
                      max={500}
                      title="Column width (px)"
                    />
                    <button
                      className="col-toggle"
                      onClick={() => toggleColumn(col.logicalName)}
                      title={isHidden ? 'Show column' : 'Hide column'}
                    >
                      {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      className="col-remove"
                      onClick={() => removeColumn(col.logicalName)}
                      title="Remove column"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {unusedAttributes.length > 0 && (
            <div>
              <label className="glass-form-label" style={{ marginBottom: 8, display: 'block' }}>
                Available Columns
              </label>
              <div className="view-customizer-available">
                {unusedAttributes.map((attr) => (
                  <button
                    key={attr.logicalName}
                    className="glass-badge"
                    onClick={() => addColumn(attr)}
                    style={{ cursor: 'pointer' }}
                  >
                    + {attr.displayName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-modal-footer">
          <button className="glass-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
