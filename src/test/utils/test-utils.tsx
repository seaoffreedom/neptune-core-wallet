import { type RenderOptions, render } from '@testing-library/react';
import type React from 'react';
import type { ReactElement } from 'react';
// Note: @tanstack/react-router doesn't export BrowserRouter
// We'll use a simple div wrapper for tests
import { ThemeProvider } from '@/components/theme-provider';

// Mock theme provider for tests
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="neptune-ui-theme">
      {children}
    </ThemeProvider>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <MockThemeProvider>{children}</MockThemeProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test utilities
export const createMockWallet = () => ({
  address: 'test-address-123',
  balance: '1000.0',
  isLoaded: true,
  isLoading: false,
  error: null,
});

export const createMockTransaction = () => ({
  id: 'test-tx-123',
  amount: '100.0',
  fee: '0.1',
  timestamp: Date.now(),
  type: 'send' as const,
  status: 'confirmed' as const,
  from: 'test-address-123',
  to: 'test-address-456',
});

export const createMockPeer = () => ({
  id: 'test-peer-123',
  address: '192.168.1.100:8080',
  isConnected: true,
  lastSeen: Date.now(),
  version: '1.0.0',
});

export const createMockSystemStats = () => ({
  cpuUsage: 25.5,
  memoryUsage: 60.2,
  uptime: 3600,
  cpuTemp: 45.0,
  timestamp: Date.now(),
});

// Mock data factories
export const mockData = {
  wallet: createMockWallet,
  transaction: createMockTransaction,
  peer: createMockPeer,
  systemStats: createMockSystemStats,
};

// Helper to wait for async operations
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper to create mock RPC response
export const createMockRPCResponse = <T,>(data: T) => ({
  jsonrpc: '2.0',
  id: 1,
  result: data,
});

// Helper to create mock RPC error
export const createMockRPCError = (code: number, message: string) => ({
  jsonrpc: '2.0',
  id: 1,
  error: {
    code,
    message,
  },
});
