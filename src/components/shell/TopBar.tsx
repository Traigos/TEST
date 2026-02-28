import { Menu, Search, ArrowLeft, Bell, User, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { AppModule, SiteMapSubArea } from '../../types/dataverse';

interface TopBarProps {
  appModule: AppModule | null;
  activeSubArea: SiteMapSubArea | null;
  openRecord: { entityName: string; recordId: string } | null;
  onToggleSidebar: () => void;
  onBack?: () => void;
}

export function TopBar({ appModule, activeSubArea, openRecord, onToggleSidebar, onBack }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="topbar glass-panel">
      <div className="topbar-left">
        <button className="glass-button icon-only" onClick={onToggleSidebar}>
          <Menu size={18} />
        </button>

        {onBack && (
          <button className="glass-button small" onClick={onBack}>
            <ArrowLeft size={14} />
            Back
          </button>
        )}

        <div className="topbar-title">
          <Sparkles size={16} style={{ opacity: 0.6 }} />
          <span className="topbar-app-name">{appModule?.name || 'Power Glass'}</span>
          {activeSubArea && !openRecord && (
            <>
              <span className="topbar-separator">/</span>
              <span className="topbar-page-name">
                {activeSubArea.title || activeSubArea.entity}
              </span>
            </>
          )}
          {openRecord && (
            <>
              <span className="topbar-separator">/</span>
              <span className="topbar-page-name">{openRecord.entityName}</span>
              <span className="topbar-separator">/</span>
              <span className="topbar-page-name" style={{ opacity: 0.6 }}>
                {openRecord.recordId.substring(0, 8)}...
              </span>
            </>
          )}
        </div>
      </div>

      <div className="topbar-center">
        <div className={`glass-search ${searchFocused ? 'focused' : ''}`}>
          <Search size={14} style={{ opacity: 0.4 }} />
          <input
            type="text"
            placeholder="Search records, entities, commands..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="glass-button icon-only">
          <Bell size={16} />
        </button>
        <button className="glass-button icon-only">
          <User size={16} />
        </button>
      </div>
    </div>
  );
}
