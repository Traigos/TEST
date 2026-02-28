import { useState, useCallback } from 'react';
import { DataverseContext } from './hooks/useDataverse';
import type { AnyDataverseClient } from './hooks/useDataverse';
import { DataverseClient } from './services/dataverse-client';
import { MockDataverseClient } from './services/mock-dataverse-client';
import { LoginScreen } from './components/auth/LoginScreen';
import { AppSelector } from './components/auth/AppSelector';
import { AppShell } from './components/shell/AppShell';
import type { AppModule } from './types/dataverse';

type AppState =
  | { mode: 'login' }
  | { mode: 'select-app'; client: AnyDataverseClient; isDemo: boolean; baseUrl: string }
  | { mode: 'app'; client: AnyDataverseClient; isDemo: boolean; baseUrl: string; selectedApp: AppModule };

export default function App() {
  const [state, setState] = useState<AppState>({ mode: 'login' });

  const handleConnect = useCallback((baseUrl: string, token: string) => {
    const client = new DataverseClient({
      baseUrl,
      apiVersion: 'v9.2',
      accessToken: token || undefined,
    });
    setState({ mode: 'select-app', client, isDemo: false, baseUrl });
  }, []);

  const handleDemo = useCallback(() => {
    const client = new MockDataverseClient();
    setState({ mode: 'select-app', client, isDemo: true, baseUrl: 'demo://localhost' });
  }, []);

  const handleSelectApp = useCallback(
    (app: AppModule) => {
      if (state.mode !== 'select-app') return;
      setState({ ...state, mode: 'app', selectedApp: app });
    },
    [state]
  );

  if (state.mode === 'login') {
    return <LoginScreen onConnect={handleConnect} onDemo={handleDemo} />;
  }

  return (
    <DataverseContext.Provider
      value={{
        client: state.client,
        isDemo: state.isDemo,
        baseUrl: state.baseUrl,
      }}
    >
      {state.mode === 'select-app' ? (
        <AppSelector onSelectApp={handleSelectApp} />
      ) : (
        <AppShell />
      )}
    </DataverseContext.Provider>
  );
}
