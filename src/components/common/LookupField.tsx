import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';
import { useDataverse } from '../../hooks/useDataverse';
import type { EntityMetadata, DataRecord } from '../../types/dataverse';

interface LookupFieldProps {
  value: unknown;
  targetEntity?: string;
  label: string;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

export function LookupField({ value, targetEntity, label, onChange, disabled }: LookupFieldProps) {
  const { client } = useDataverse();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<DataRecord[]>([]);
  const [targetMeta, setTargetMeta] = useState<EntityMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Load target entity metadata
  useEffect(() => {
    if (targetEntity) {
      client.getEntityMetadata(targetEntity).then(setTargetMeta).catch(() => {});
    }
  }, [targetEntity, client]);

  const doSearch = useCallback(
    async (query: string) => {
      if (!targetMeta) return;
      setLoading(true);
      try {
        const data = await client.getRecords(targetMeta.entitySetName, {
          top: 10,
        });
        // Client-side filter for mock
        const filtered = query
          ? data.value.filter((r) => {
              const name = r[targetMeta.primaryNameAttribute];
              return name && String(name).toLowerCase().includes(query.toLowerCase());
            })
          : data.value.slice(0, 10);
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [client, targetMeta]
  );

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchText('');
    doSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    doSearch(text);
  };

  const handleSelect = (record: DataRecord) => {
    if (!targetMeta) return;
    const name = record[targetMeta.primaryNameAttribute];
    onChange(name || record[targetMeta.primaryIdAttribute]);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const displayValue = value ? String(value) : '';

  return (
    <div className="lookup-field" ref={dropdownRef}>
      <div
        className={`glass-input lookup-input ${isOpen ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleOpen}
      >
        <Search size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
        <span className={`lookup-display ${!displayValue ? 'placeholder' : ''}`}>
          {displayValue || `Search ${label}...`}
        </span>
        <div className="lookup-actions">
          {displayValue && !disabled && (
            <button className="lookup-clear" onClick={handleClear} type="button">
              <X size={12} />
            </button>
          )}
          {displayValue && (
            <ExternalLink size={12} style={{ opacity: 0.3 }} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="lookup-dropdown glass-panel-solid">
          <div className="lookup-search-box">
            <Search size={14} style={{ opacity: 0.4 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${targetMeta?.displayCollectionName || label}...`}
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="lookup-results glass-scrollbar">
            {loading ? (
              <div className="lookup-loading">
                <div className="glass-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              </div>
            ) : results.length === 0 ? (
              <div className="lookup-empty">No records found</div>
            ) : (
              results.map((record, i) => {
                const id = targetMeta
                  ? (record[targetMeta.primaryIdAttribute] as string)
                  : String(i);
                const name = targetMeta
                  ? String(record[targetMeta.primaryNameAttribute] || '')
                  : '';
                return (
                  <button
                    key={id}
                    className="lookup-result-item"
                    onClick={() => handleSelect(record)}
                    type="button"
                  >
                    <span className="lookup-result-name">{name}</span>
                    <span className="lookup-result-id">{id.substring(0, 8)}...</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
