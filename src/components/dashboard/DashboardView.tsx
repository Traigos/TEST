import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useDataverse } from '../../hooks/useDataverse';
import type { DataRecord } from '../../types/dataverse';

interface KpiCardData {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export function DashboardView() {
  const { client } = useDataverse();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiCardData[]>([]);
  const [recentOpps, setRecentOpps] = useState<DataRecord[]>([]);
  const [recentCases, setRecentCases] = useState<DataRecord[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [accounts, contacts, leads, opps, cases] = await Promise.all([
        client.getRecords('accounts'),
        client.getRecords('contacts'),
        client.getRecords('leads'),
        client.getRecords('opportunities'),
        client.getRecords('incidents'),
      ]);

      const totalRevenue = opps.value.reduce(
        (sum, r) => sum + (Number(r.estimatedvalue) || 0),
        0
      );

      setKpis([
        {
          title: 'Total Pipeline',
          value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
          change: 12.5,
          icon: <DollarSign size={20} />,
          color: '#34C759',
        },
        {
          title: 'Active Accounts',
          value: String(accounts.value.length),
          change: 8.3,
          icon: <BarChart3 size={20} />,
          color: '#007AFF',
        },
        {
          title: 'Total Contacts',
          value: String(contacts.value.length),
          change: 5.1,
          icon: <Users size={20} />,
          color: '#5856D6',
        },
        {
          title: 'Open Leads',
          value: String(leads.value.length),
          change: -3.2,
          icon: <Target size={20} />,
          color: '#FF9500',
        },
        {
          title: 'Open Cases',
          value: String(cases.value.length),
          change: -15.4,
          icon: <Activity size={20} />,
          color: '#FF3B30',
        },
      ]);

      setRecentOpps(opps.value.slice(0, 5));
      setRecentCases(cases.value.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <div className="glass-spinner" style={{ margin: '0 auto var(--space-md)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view glass-reveal">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <span className="glass-badge">Live</span>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpis">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="kpi-card glass-card">
            <div className="kpi-icon" style={{ color: kpi.color, background: `${kpi.color}15` }}>
              {kpi.icon}
            </div>
            <div className="kpi-content">
              <span className="kpi-title">{kpi.title}</span>
              <span className="kpi-value">{kpi.value}</span>
              <span className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                {kpi.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Lists */}
      <div className="dashboard-grid">
        {/* Pipeline Chart Placeholder */}
        <div className="glass-card dashboard-chart">
          <h3>Pipeline by Stage</h3>
          <div className="pipeline-bars">
            {[
              { label: 'Qualify', value: 35, color: '#5AC8FA' },
              { label: 'Develop', value: 25, color: '#007AFF' },
              { label: 'Propose', value: 20, color: '#5856D6' },
              { label: 'Close', value: 20, color: '#34C759' },
            ].map((stage) => (
              <div key={stage.label} className="pipeline-bar-row">
                <span className="pipeline-label">{stage.label}</span>
                <div className="pipeline-bar-track">
                  <div
                    className="pipeline-bar-fill"
                    style={{
                      width: `${stage.value}%`,
                      background: stage.color,
                    }}
                  />
                </div>
                <span className="pipeline-value">{stage.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="glass-card dashboard-list">
          <h3>Recent Opportunities</h3>
          <div className="dashboard-list-items">
            {recentOpps.map((opp) => (
              <div key={opp.opportunityid as string} className="dashboard-list-item">
                <div className="list-item-info">
                  <span className="list-item-name">{opp.name as string}</span>
                  <span className="list-item-sub">{opp.parentaccountid as string}</span>
                </div>
                <div className="list-item-meta">
                  <span className="list-item-value">
                    ${((opp.estimatedvalue as number) / 1000).toFixed(0)}K
                  </span>
                  <span className="glass-badge small">
                    {opp.closeprobability as number}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cases */}
        <div className="glass-card dashboard-list">
          <h3>Recent Cases</h3>
          <div className="dashboard-list-items">
            {recentCases.map((c) => (
              <div key={c.incidentid as string} className="dashboard-list-item">
                <div className="list-item-info">
                  <span className="list-item-name">{c.title as string}</span>
                  <span className="list-item-sub">{c.customerid as string}</span>
                </div>
                <div className="list-item-meta">
                  <PriorityBadge value={c.prioritycode as number} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ value }: { value: number }) {
  const config: Record<number, { label: string; color: string }> = {
    1: { label: 'High', color: '#FF3B30' },
    2: { label: 'Normal', color: '#FF9500' },
    3: { label: 'Low', color: '#34C759' },
  };
  const { label, color } = config[value] || { label: 'Unknown', color: '#999' };
  return (
    <span
      className="glass-badge"
      style={{ background: `${color}18`, color, borderColor: `${color}30` }}
    >
      {label}
    </span>
  );
}
