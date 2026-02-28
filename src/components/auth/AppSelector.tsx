import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Layers, Globe } from 'lucide-react';
import { useDataverse } from '../../hooks/useDataverse';
import type { AppModule } from '../../types/dataverse';

interface AppSelectorProps {
  onSelectApp: (app: AppModule) => void;
}

export function AppSelector({ onSelectApp }: AppSelectorProps) {
  const { client, isDemo } = useDataverse();
  const [apps, setApps] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadApps = async () => {
    try {
      setLoading(true);
      const modules = await client.getAppModules();
      setApps(modules);
    } catch (err) {
      console.error('Failed to load apps:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-selector">
      <div className="app-selector-background" />
      <div className="app-selector-content">
        <div className="app-selector-header glass-reveal">
          <div className="login-logo-icon" style={{ width: 48, height: 48 }}>
            <Sparkles size={24} />
          </div>
          <h1>Power Glass</h1>
          <p>Select a model-driven app to launch</p>
          {isDemo && (
            <span className="glass-badge primary" style={{ marginTop: 8 }}>
              Demo Mode
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
            <div className="glass-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div className="app-selector-grid">
            {apps.map((app, i) => (
              <button
                key={app.appmoduleid}
                className="app-card glass-card glass-reveal"
                style={{ animationDelay: `${i * 80}ms` }}
                onClick={() => onSelectApp(app)}
              >
                <div className="app-card-icon">
                  <Layers size={28} />
                </div>
                <div className="app-card-info">
                  <h3>{app.name}</h3>
                  <p>{app.description || 'Model-driven app'}</p>
                </div>
                <ChevronRight size={18} className="app-card-arrow" />
              </button>
            ))}

            {apps.length === 0 && !loading && (
              <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', gridColumn: '1 / -1' }}>
                <Globe size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ color: 'var(--text-secondary)' }}>
                  No model-driven apps found.
                  {!isDemo && ' Check your environment URL and permissions.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
