import { useState } from 'react';
import {
  Building2,
  Users,
  Target,
  Trophy,
  Inbox,
  BookOpen,
  Settings,
  LayoutDashboard,
  Activity,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { ParsedSiteMap, SiteMapArea, SiteMapSubArea } from '../../types/dataverse';

const iconMap: Record<string, LucideIcon> = {
  building: Building2,
  users: Users,
  target: Target,
  trophy: Trophy,
  inbox: Inbox,
  'book-open': BookOpen,
  settings: Settings,
  dashboard: LayoutDashboard,
  activity: Activity,
};

function getIcon(iconName?: string): LucideIcon {
  if (!iconName) return Activity;
  return iconMap[iconName] || Activity;
}

interface SidebarProps {
  siteMap: ParsedSiteMap | null;
  activeArea: SiteMapArea | null;
  activeSubArea: SiteMapSubArea | null;
  isOpen: boolean;
  onSubAreaClick: (subArea: SiteMapSubArea) => void;
  onAreaClick: (area: SiteMapArea) => void;
}

export function Sidebar({
  siteMap,
  activeArea,
  activeSubArea,
  isOpen,
  onSubAreaClick,
  onAreaClick,
}: SidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  if (!siteMap) return null;

  return (
    <div className={`glass-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Area Tabs */}
      <div className="sidebar-areas">
        <div className="glass-nav" style={{ borderRadius: 'var(--radius-md)', margin: 'var(--space-sm)' }}>
          {siteMap.areas.map((area) => (
            <button
              key={area.id}
              className={`glass-nav-item ${activeArea?.id === area.id ? 'active' : ''}`}
              onClick={() => onAreaClick(area)}
              title={area.title}
            >
              {isOpen ? area.title : area.title.charAt(0)}
            </button>
          ))}
        </div>
      </div>

      {/* Groups & SubAreas */}
      <div className="sidebar-navigation glass-scrollbar">
        {activeArea?.groups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.id);
          return (
            <div key={group.id} className="glass-sidebar-section">
              <button
                className="glass-sidebar-section-title"
                onClick={() => toggleGroup(group.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  font: 'inherit',
                  color: 'inherit',
                  padding: 'var(--space-sm) var(--space-md)',
                }}
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                {isOpen && group.title}
              </button>

              {!isCollapsed &&
                group.subareas.map((subArea) => {
                  const Icon = getIcon(subArea.icon);
                  return (
                    <button
                      key={subArea.id}
                      className={`glass-sidebar-item ${
                        activeSubArea?.id === subArea.id ? 'active' : ''
                      }`}
                      onClick={() => onSubAreaClick(subArea)}
                      style={{
                        background: activeSubArea?.id === subArea.id
                          ? 'rgba(255, 255, 255, 0.18)'
                          : 'transparent',
                        border: activeSubArea?.id === subArea.id
                          ? '1px solid var(--glass-border)'
                          : '1px solid transparent',
                        width: '100%',
                        textAlign: 'left',
                        font: 'inherit',
                      }}
                    >
                      <Icon size={18} />
                      {isOpen && (
                        <span>{subArea.title || subArea.entity || subArea.id}</span>
                      )}
                    </button>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
