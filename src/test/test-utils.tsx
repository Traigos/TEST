import { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { DataverseContext } from '../hooks/useDataverse';
import type { AnyDataverseClient } from '../hooks/useDataverse';
import { MockDataverseClient } from '../services/mock-dataverse-client';

interface WrapperOptions {
  client?: AnyDataverseClient;
}

export function createWrapper(options: WrapperOptions = {}) {
  const client = options.client ?? new MockDataverseClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <DataverseContext.Provider value={{ client, isDemo: true, baseUrl: 'test://localhost' }}>
        {children}
      </DataverseContext.Provider>
    );
  };
}

export function renderWithDataverse(
  ui: ReactNode,
  options: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {}
) {
  const { client, ...renderOptions } = options;
  return render(ui, {
    wrapper: createWrapper({ client }),
    ...renderOptions,
  });
}

export { MockDataverseClient };
