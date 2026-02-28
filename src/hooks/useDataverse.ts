// ============================================================
// React Context & Hooks for Dataverse Data Access
// ============================================================

import { createContext, useContext } from 'react';
import type { DataverseClient } from '../services/dataverse-client';
import type { MockDataverseClient } from '../services/mock-dataverse-client';

export type AnyDataverseClient = DataverseClient | MockDataverseClient;

export interface DataverseContextValue {
  client: AnyDataverseClient;
  isDemo: boolean;
  baseUrl: string;
}

export const DataverseContext = createContext<DataverseContextValue | null>(null);

export function useDataverse(): DataverseContextValue {
  const ctx = useContext(DataverseContext);
  if (!ctx) throw new Error('useDataverse must be used within DataverseProvider');
  return ctx;
}
