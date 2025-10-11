import React from 'react';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock Electron APIs
const mockElectronAPI = {
  invoke: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
  // Add other Electron APIs as needed
};

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Mock Electron main process APIs
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  app: {
    getPath: vi.fn(),
    getName: vi.fn(),
    getVersion: vi.fn(),
    quit: vi.fn(),
    isReady: vi.fn(() => true),
  },
  BrowserWindow: vi.fn(),
  Menu: {
    buildFromTemplate: vi.fn(),
    setApplicationMenu: vi.fn(),
  },
}));

// Mock Node.js modules
vi.mock('fs-extra', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('execa', () => ({
  default: vi.fn(),
}));

vi.mock('pino', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock Zustand stores
vi.mock('@/store/onchain.store', () => ({
  useOnchainStore: vi.fn(() => ({
    balance: null,
    isLoading: false,
    error: null,
    fetchBalance: vi.fn(),
  })),
}));

vi.mock('@/store/system.store', () => ({
  useSystemStore: vi.fn(() => ({
    cpuUsage: 0,
    memoryUsage: 0,
    uptime: 0,
    isLoading: false,
    error: null,
    fetchSystemStats: vi.fn(),
  })),
}));

// Mock React Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  Link: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement('a', props, children),
  Outlet: () => React.createElement('div', { 'data-testid': 'outlet' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'router' }, children),
}));

// Mock React Hook Form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {} },
    reset: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    watch: vi.fn(),
  })),
  Controller: ({
    render,
  }: {
    render: (props: {
      field: Record<string, unknown>;
      fieldState: Record<string, unknown>;
    }) => React.ReactNode;
  }) => render({ field: {}, fieldState: {} }),
}));

// Mock Sonner (toast notifications)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Clean up after each test
  cleanup();
  vi.clearAllMocks();
});

afterAll(() => {
  // Clean up after all tests
  vi.restoreAllMocks();
});

// Global test utilities
export { mockElectronAPI };

// Helper function to mock successful RPC responses
export const mockSuccessfulRPC = (data: unknown) => {
  mockElectronAPI.invoke.mockResolvedValue(data);
};

// Helper function to mock failed RPC responses
export const mockFailedRPC = (error: string) => {
  mockElectronAPI.invoke.mockRejectedValue(new Error(error));
};

// Helper function to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockElectronAPI.invoke.mockClear();
};
