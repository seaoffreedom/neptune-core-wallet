import { vi } from 'vitest';

// Mock Electron API for testing
export const mockElectronAPI = {
  // IPC methods
  invoke: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),

  // Wallet methods
  wallet: {
    getBalance: vi.fn(),
    sendTransaction: vi.fn(),
    getHistory: vi.fn(),
    createWallet: vi.fn(),
    loadWallet: vi.fn(),
    saveWallet: vi.fn(),
    encryptWallet: vi.fn(),
    decryptWallet: vi.fn(),
  },

  // Blockchain methods
  blockchain: {
    getBlockHeight: vi.fn(),
    getNetworkInfo: vi.fn(),
    getPeerInfo: vi.fn(),
    getMempoolInfo: vi.fn(),
    getMiningInfo: vi.fn(),
  },

  // System methods
  system: {
    getSystemStats: vi.fn(),
    getProcessStats: vi.fn(),
    getCombinedStats: vi.fn(),
  },

  // Settings methods
  settings: {
    getSettings: vi.fn(),
    setSettings: vi.fn(),
    resetSettings: vi.fn(),
    exportSettings: vi.fn(),
    importSettings: vi.fn(),
  },

  // File methods
  file: {
    openFileDialog: vi.fn(),
    saveFileDialog: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
  },

  // App methods
  app: {
    quit: vi.fn(),
    restart: vi.fn(),
    getVersion: vi.fn(),
  },

  // Window methods
  window: {
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn(),
    setTitle: vi.fn(),
  },

  // Process methods
  process: {
    getProcessInfo: vi.fn(),
    killProcess: vi.fn(),
    spawnProcess: vi.fn(),
  },

  // Address book methods
  addressBook: {
    getAddresses: vi.fn(),
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
    exportAddresses: vi.fn(),
    importAddresses: vi.fn(),
  },

  // Neptune Core methods
  neptune: {
    initialize: vi.fn(),
    getStatus: vi.fn(),
    shutdown: vi.fn(),
    restart: vi.fn(),
    getCookie: vi.fn(),
    getWalletData: vi.fn(),
  },

  // Neptune Core Settings methods
  neptuneCoreSettings: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    exportSettings: vi.fn(),
    importSettings: vi.fn(),
  },
};

// Helper functions for common mock scenarios
export const mockSuccessfulResponse = <T>(data: T) => {
  mockElectronAPI.invoke.mockResolvedValue(data);
};

export const mockFailedResponse = (error: string) => {
  mockElectronAPI.invoke.mockRejectedValue(new Error(error));
};

export const mockLoadingResponse = () => {
  mockElectronAPI.invoke.mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 100))
  );
};

// Reset all mocks
export const resetElectronAPIMocks = () => {
  Object.values(mockElectronAPI).forEach((mock) => {
    if (typeof mock === 'function') {
      mock.mockClear();
    } else if (typeof mock === 'object') {
      Object.values(mock).forEach((nestedMock) => {
        if (typeof nestedMock === 'function') {
          nestedMock.mockClear();
        }
      });
    }
  });
};

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

export default mockElectronAPI;
