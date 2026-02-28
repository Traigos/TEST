import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Plus,
  RefreshCw,
  Filter,
  Download,
  MoreHorizontal,
  Columns3,
} from 'lucide-react';
import { useDataverse } from '../../hooks/useDataverse';
import { parseLayoutXml } from '../../utils/xml-parsers';
import type {
  SavedQuery,
  EntityMetadata,
  DataRecord,
  ViewColumn,
} from '../../types/dataverse';
import { ViewCustomizer } from '../common/ViewCustomizer';

interface EntityViewProps {
  entityName: string;
  onRecordOpen: (entityName: string, recordId: string) => void;
}

const ROW_HEIGHT = 44;
const OVERSCAN = 8;

export function EntityView({ entityName, onRecordOpen }: EntityViewProps) {
  const { client } = useDataverse();
  const [views, setViews] = useState<SavedQuery[]>([]);
  const [activeView, setActiveView] = useState<SavedQuery | null>(null);
  const [columns, setColumns] = useState<ViewColumn[]>([]);
  const [metadata, setMetadata] = useState<EntityMetadata | null>(null);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Virtual scrolling state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Column resize state
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  useEffect(() => {
    loadEntity();
  }, [entityName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure container height
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const loadEntity = async () => {
    try {
      setLoading(true);
      setSelectedRows(new Set());

      const [entityViews, entityMeta] = await Promise.all([
        client.getSavedQueries(entityName, 0),
        client.getEntityMetadata(entityName),
      ]);

      setViews(entityViews);
      setMetadata(entityMeta);

      const defaultView = entityViews.find((v) => v.isdefault) || entityViews[0];
      if (defaultView) {
        setActiveView(defaultView);
        const parsedLayout = parseLayoutXml(defaultView.layoutxml);
        setColumns(parsedLayout.columns);

        const data = await client.getRecords(entityMeta.entitySetName);
        setRecords(data.value);
      }
    } catch (err) {
      console.error('Failed to load entity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = async (view: SavedQuery) => {
    setActiveView(view);
    const parsedLayout = parseLayoutXml(view.layoutxml);
    setColumns(parsedLayout.columns);
    setLoading(true);
    try {
      const data = await client.getRecords(metadata!.entitySetName);
      setRecords(data.value);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = useCallback(
    (columnName: string) => {
      if (sortColumn === columnName) {
        setSortDesc(!sortDesc);
      } else {
        setSortColumn(columnName);
        setSortDesc(false);
      }
    },
    [sortColumn, sortDesc]
  );

  const handleRowClick = useCallback(
    (record: DataRecord) => {
      if (!metadata) return;
      const id = record[metadata.primaryIdAttribute] as string;
      if (id) onRecordOpen(entityName, id);
    },
    [metadata, entityName, onRecordOpen]
  );

  const toggleRowSelection = useCallback(
    (e: React.MouseEvent, recordId: string) => {
      e.stopPropagation();
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(recordId)) next.delete(recordId);
        else next.add(recordId);
        return next;
      });
    },
    []
  );

  const toggleSelectAll = useCallback(() => {
    if (!metadata) return;
    if (selectedRows.size === records.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(
        new Set(records.map((r) => r[metadata.primaryIdAttribute] as string))
      );
    }
  }, [selectedRows.size, records, metadata]);

  const getDisplayName = useCallback(
    (logicalName: string): string => {
      if (!metadata) return logicalName;
      const attr = metadata.attributes.find((a) => a.logicalName === logicalName);
      return attr?.displayName || logicalName;
    },
    [metadata]
  );

  const formatCellValue = useCallback(
    (value: unknown, logicalName: string): string => {
      if (value === null || value === undefined) return '';
      if (!metadata) return String(value);

      const attr = metadata.attributes.find((a) => a.logicalName === logicalName);
      if (!attr) return String(value);

      if (attr.options) {
        const opt = attr.options.find((o) => o.value === value);
        if (opt) return opt.label;
      }

      if (attr.attributeType === 'Money') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(Number(value));
      }

      if (attr.attributeType === 'DateTime') {
        return new Date(String(value)).toLocaleDateString();
      }

      if (attr.attributeType === 'Integer') {
        return Number(value).toLocaleString();
      }

      return String(value);
    },
    [metadata]
  );

  const getCellBadge = useCallback(
    (value: unknown, logicalName: string) => {
      if (!metadata) return null;
      const attr = metadata.attributes.find((a) => a.logicalName === logicalName);
      if (!attr?.options) return null;
      const opt = attr.options.find((o) => o.value === value);
      if (!opt?.color) return null;
      return opt;
    },
    [metadata]
  );

  const isLookupColumn = useCallback(
    (logicalName: string): boolean => {
      if (!metadata) return false;
      const attr = metadata.attributes.find((a) => a.logicalName === logicalName);
      return attr?.attributeType === 'Lookup' || attr?.attributeType === 'Customer' || attr?.attributeType === 'Owner';
    },
    [metadata]
  );

  // Column resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, colIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingCol(colIndex);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = columns[colIndex].width;

      const handleMove = (ev: MouseEvent) => {
        const diff = ev.clientX - resizeStartX.current;
        const newWidth = Math.max(60, resizeStartWidth.current + diff);
        setColumns((prev) => {
          const next = [...prev];
          next[colIndex] = { ...next[colIndex], width: newWidth };
          return next;
        });
      };

      const handleUp = () => {
        setResizingCol(null);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [columns]
  );

  const sortedRecords = useMemo(() => {
    if (!sortColumn) return records;
    return [...records].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDesc ? -cmp : cmp;
    });
  }, [records, sortColumn, sortDesc]);

  // Virtual scrolling calculations
  const totalHeight = sortedRecords.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    sortedRecords.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
  );
  const visibleRecords = sortedRecords.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop);
    }
  }, []);

  if (loading) {
    return (
      <div className="entity-view-loading">
        <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <div className="glass-spinner" style={{ margin: '0 auto var(--space-md)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading {entityName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="entity-view glass-reveal">
      {/* View Selector & Toolbar */}
      <div className="entity-view-header">
        <div className="entity-view-title">
          <h2>{metadata?.displayCollectionName || entityName}</h2>
          <div className="glass-nav" style={{ borderRadius: 'var(--radius-md)' }}>
            {views.map((view) => (
              <button
                key={view.savedqueryid}
                className={`glass-nav-item ${
                  activeView?.savedqueryid === view.savedqueryid ? 'active' : ''
                }`}
                onClick={() => handleViewChange(view)}
              >
                {view.name}
              </button>
            ))}
          </div>
        </div>

        <div className="entity-view-toolbar">
          <button className="glass-button primary small">
            <Plus size={14} /> New
          </button>
          <button className="glass-button small" onClick={loadEntity}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="glass-button small">
            <Filter size={14} /> Filter
          </button>
          <button className="glass-button small">
            <Download size={14} /> Export
          </button>
          <button
            className="glass-button small"
            onClick={() => setCustomizerOpen(true)}
          >
            <Columns3 size={14} /> Columns
          </button>
          {selectedRows.size > 0 && (
            <span className="glass-badge primary">
              {selectedRows.size} selected
            </span>
          )}
        </div>
      </div>

      {/* Data Grid with Virtual Scrolling */}
      <div className="glass-table-container">
        {/* Fixed Header */}
        <table className="glass-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size === records.length && records.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              {columns.map((col, ci) => (
                <th
                  key={col.logicalName}
                  onClick={() => handleSort(col.logicalName)}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    maxWidth: col.width,
                    position: 'relative',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {getDisplayName(col.logicalName)}
                    {isLookupColumn(col.logicalName) && (
                      <span style={{ fontSize: 9, opacity: 0.5 }}>&#x1F517;</span>
                    )}
                    {sortColumn === col.logicalName &&
                      (sortDesc ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                  </span>
                  {/* Resize handle */}
                  <div
                    className={`col-resize-handle ${resizingCol === ci ? 'active' : ''}`}
                    onMouseDown={(e) => handleResizeStart(e, ci)}
                  />
                </th>
              ))}
              <th style={{ width: 40 }} />
            </tr>
          </thead>
        </table>

        {/* Virtual Scroll Body */}
        <div
          ref={scrollContainerRef}
          className="virtual-scroll-container glass-scrollbar"
          onScroll={handleScroll}
          style={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <table className="glass-table virtual-table" style={{ position: 'absolute', top: offsetY, width: '100%' }}>
              <tbody>
                {visibleRecords.map((record) => {
                  const recordId = metadata
                    ? (record[metadata.primaryIdAttribute] as string)
                    : '';
                  return (
                    <tr
                      key={recordId}
                      className={selectedRows.has(recordId) ? 'selected' : ''}
                      onClick={() => handleRowClick(record)}
                      style={{ cursor: 'pointer', height: ROW_HEIGHT }}
                    >
                      <td style={{ width: 40 }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(recordId)}
                          onChange={() =>
                            toggleRowSelection(
                              { stopPropagation: () => {} } as React.MouseEvent,
                              recordId
                            )
                          }
                        />
                      </td>
                      {columns.map((col) => {
                        const badge = getCellBadge(record[col.logicalName], col.logicalName);
                        const isLookup = isLookupColumn(col.logicalName);
                        return (
                          <td
                            key={col.logicalName}
                            style={{
                              width: col.width,
                              minWidth: col.width,
                              maxWidth: col.width,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {badge ? (
                              <span
                                className="glass-badge"
                                style={{
                                  background: `${badge.color}18`,
                                  color: badge.color,
                                  borderColor: `${badge.color}30`,
                                }}
                              >
                                {badge.label}
                              </span>
                            ) : isLookup ? (
                              <span className="lookup-cell-value">
                                {formatCellValue(record[col.logicalName], col.logicalName)}
                              </span>
                            ) : (
                              formatCellValue(record[col.logicalName], col.logicalName)
                            )}
                          </td>
                        );
                      })}
                      <td style={{ width: 40 }}>
                        <button
                          className="glass-button icon-only small"
                          onClick={(e) => e.stopPropagation()}
                          style={{ padding: 4 }}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {sortedRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={(columns.length || 0) + 2}
                      style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-tertiary)' }}
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="entity-view-footer">
        <span className="glass-badge">
          {records.length} record{records.length !== 1 ? 's' : ''}
        </span>
        {sortColumn && (
          <span className="glass-badge">
            Sorted by {getDisplayName(sortColumn)} {sortDesc ? '(desc)' : '(asc)'}
          </span>
        )}
      </div>

      {/* View Customizer Modal */}
      <ViewCustomizer
        columns={columns}
        availableAttributes={metadata?.attributes || []}
        onColumnsChange={setColumns}
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
      />
    </div>
  );
}
