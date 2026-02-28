import { useState, useEffect, useCallback } from 'react';
import { useDataverse } from '../../hooks/useDataverse';
import { parseSiteMapXml } from '../../utils/xml-parsers';
import type { ParsedSiteMap, SiteMapArea, SiteMapSubArea, AppModule } from '../../types/dataverse';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { EntityView } from '../views/EntityView';
import { DashboardView } from '../dashboard/DashboardView';
import { FormView } from '../forms/FormView';

export function AppShell() {
  const { client } = useDataverse();
  const [appModule, setAppModule] = useState<AppModule | null>(null);
  const [siteMap, setSiteMap] = useState<ParsedSiteMap | null>(null);
  const [activeArea, setActiveArea] = useState<SiteMapArea | null>(null);
  const [activeSubArea, setActiveSubArea] = useState<SiteMapSubArea | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openRecord, setOpenRecord] = useState<{ entityName: string; recordId: string } | null>(null);

  useEffect(() => {
    loadApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApp = async () => {
    try {
      setLoading(true);
      const modules = await client.getAppModules();
      const module = modules[0];
      if (!module) return;
      setAppModule(module);

      const components = await client.getAppModuleComponents(module.appmoduleidunique);
      const siteMapComponent = components.find((c) => c.componenttype === 62);

      if (siteMapComponent) {
        const sm = await client.getSiteMap(siteMapComponent.objectid);
        const parsed = parseSiteMapXml(sm.sitemapxml);
        setSiteMap(parsed);

        if (parsed.areas.length > 0) {
          setActiveArea(parsed.areas[0]);
          const firstEntity = parsed.areas[0].groups
            .flatMap((g) => g.subareas)
            .find((s) => s.entity || s.defaultDashboard);
          if (firstEntity) setActiveSubArea(firstEntity);
        }
      }
    } catch (err) {
      console.error('Failed to load app:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubAreaClick = useCallback((subArea: SiteMapSubArea) => {
    setActiveSubArea(subArea);
    setOpenRecord(null);
  }, []);

  const handleAreaClick = useCallback((area: SiteMapArea) => {
    setActiveArea(area);
    const firstEntity = area.groups
      .flatMap((g) => g.subareas)
      .find((s) => s.entity || s.defaultDashboard);
    if (firstEntity) {
      setActiveSubArea(firstEntity);
      setOpenRecord(null);
    }
  }, []);

  const handleRecordOpen = useCallback((entityName: string, recordId: string) => {
    setOpenRecord({ entityName, recordId });
  }, []);

  const handleBackToView = useCallback(() => {
    setOpenRecord(null);
  }, []);

  if (loading) {
    return (
      <div className="app-shell-loading">
        <div className="glass-spinner" />
        <p>Loading application...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (openRecord) {
      return (
        <FormView
          entityName={openRecord.entityName}
          recordId={openRecord.recordId}
          onBack={handleBackToView}
        />
      );
    }

    if (!activeSubArea) {
      return (
        <div className="empty-state glass-card">
          <p>Select an item from the navigation</p>
        </div>
      );
    }

    if (activeSubArea.defaultDashboard || activeSubArea.type === '2') {
      return <DashboardView />;
    }

    if (activeSubArea.entity) {
      return (
        <EntityView
          entityName={activeSubArea.entity}
          onRecordOpen={handleRecordOpen}
        />
      );
    }

    return (
      <div className="empty-state glass-card">
        <p>This area is not yet configured</p>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <div className="app-shell-background" />

      <Sidebar
        siteMap={siteMap}
        activeArea={activeArea}
        activeSubArea={activeSubArea}
        isOpen={sidebarOpen}
        onSubAreaClick={handleSubAreaClick}
        onAreaClick={handleAreaClick}
      />

      <div className={`app-shell-main ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <TopBar
          appModule={appModule}
          activeSubArea={activeSubArea}
          openRecord={openRecord}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onBack={openRecord ? handleBackToView : undefined}
        />

        <div className="app-shell-content glass-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
