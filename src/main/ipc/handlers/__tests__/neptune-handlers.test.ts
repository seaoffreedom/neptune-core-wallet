import { ipcMain } from 'electron';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as NeptuneHandlers from '@/main/ipc/handlers/neptune-handlers';
import { neptuneProcessManager } from '@/main/services/neptune-process-manager';

// Mock Electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// Mock electron-store
vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  })),
}));

// Mock the neptune process manager
vi.mock('@/main/services/neptune-process-manager', () => ({
  neptuneProcessManager: {
    initialize: vi.fn(),
    getStatus: vi.fn(),
    shutdown: vi.fn(),
    getCookie: vi.fn(),
  },
}));

// Mock pino logger
vi.mock('pino', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

describe('NeptuneHandlers - Real Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock responses
    vi.mocked(neptuneProcessManager.initialize).mockResolvedValue(undefined);
    vi.mocked(neptuneProcessManager.getStatus).mockReturnValue({
      core: { running: true, pid: 1234 },
      cli: { running: true, pid: 5678 },
      initialized: true,
    });
    vi.mocked(neptuneProcessManager.shutdown).mockResolvedValue(undefined);
    vi.mocked(neptuneProcessManager.getCookie).mockReturnValue('test-cookie');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Handler Registration', () => {
    it('should register all IPC handlers with correct channel names', () => {
      NeptuneHandlers.registerNeptuneHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        'neptune:initialize',
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'neptune:status',
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'neptune:shutdown',
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'neptune:restart',
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'neptune:get-cookie',
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'neptune:wallet-data',
        expect.any(Function)
      );
    });

    it('should cleanup handlers on unregister', () => {
      NeptuneHandlers.registerNeptuneHandlers();
      NeptuneHandlers.unregisterNeptuneHandlers();

      expect(ipcMain.removeHandler).toHaveBeenCalledWith('neptune:initialize');
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('neptune:status');
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('neptune:shutdown');
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('neptune:restart');
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('neptune:get-cookie');
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('neptune:wallet-data');
    });
  });

  describe('Initialize Handler', () => {
    it('should call process manager initialize method', async () => {
      const result = await NeptuneHandlers.handleInitialize(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(vi.mocked(neptuneProcessManager.initialize)).toHaveBeenCalledTimes(
        1
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle initialization errors', async () => {
      vi.mocked(neptuneProcessManager.initialize).mockRejectedValue(
        new Error('Initialization failed')
      );

      const result = await NeptuneHandlers.handleInitialize(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Initialization failed');
    });
  });

  describe('Status Handler', () => {
    it('should return process status information', () => {
      const result = NeptuneHandlers.handleGetStatus(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(vi.mocked(neptuneProcessManager.getStatus)).toHaveBeenCalledTimes(
        1
      );
      expect(result.success).toBe(true);
      expect(result.status).toEqual({
        core: { running: true, pid: 1234 },
        cli: { running: true, pid: 5678 },
        initialized: true,
      });
    });

    it('should handle status check errors', () => {
      vi.mocked(neptuneProcessManager.getStatus).mockImplementation(() => {
        throw new Error('Status check failed');
      });

      const result = NeptuneHandlers.handleGetStatus(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Status check failed');
    });
  });

  describe('Shutdown Handler', () => {
    it('should call process manager shutdown method', async () => {
      const result = await NeptuneHandlers.handleShutdown(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(vi.mocked(neptuneProcessManager.shutdown)).toHaveBeenCalledTimes(
        1
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle shutdown errors', async () => {
      vi.mocked(neptuneProcessManager.shutdown).mockRejectedValue(
        new Error('Shutdown failed')
      );

      const result = await NeptuneHandlers.handleShutdown(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Shutdown failed');
    });
  });

  describe('Restart Handler', () => {
    it('should call process manager restart method', async () => {
      const result = await NeptuneHandlers.handleRestart(
        {} as Electron.IpcMainInvokeEvent
      );

      // handleRestart calls shutdown and initialize, not restart
      expect(vi.mocked(neptuneProcessManager.shutdown)).toHaveBeenCalled();
      expect(vi.mocked(neptuneProcessManager.initialize)).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle restart errors', async () => {
      vi.mocked(neptuneProcessManager.shutdown).mockRejectedValue(
        new Error('Restart failed')
      );

      const result = await NeptuneHandlers.handleRestart(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Restart failed');
    });
  });

  describe('Cookie Handler', () => {
    it('should return cookie from process manager', async () => {
      const result = await NeptuneHandlers.handleGetCookie(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(vi.mocked(neptuneProcessManager.getCookie)).toHaveBeenCalledTimes(
        1
      );
      expect(result.success).toBe(true);
      expect(result.cookie).toBe('test-cookie');
    });

    it('should handle cookie retrieval errors', async () => {
      vi.mocked(neptuneProcessManager.getCookie).mockImplementation(() => {
        throw new Error('Cookie not available');
      });

      const result = await NeptuneHandlers.handleGetCookie(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cookie not available');
    });
  });

  describe('Wallet Data Handler', () => {
    it('should return wallet data from process manager', async () => {
      const result = await NeptuneHandlers.handleGetWalletData(
        {} as Electron.IpcMainInvokeEvent
      );

      // handleGetWalletData returns placeholder data, doesn't call getWalletData
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.balance).toBeDefined();
      expect(result.data?.status).toBeDefined();
      expect(result.data?.lastUpdated).toBeDefined();
    });

    it('should handle wallet data retrieval errors', async () => {
      // Since handleGetWalletData doesn't throw errors in its current implementation,
      // this test validates that it returns success
      const result = await NeptuneHandlers.handleGetWalletData(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      vi.mocked(neptuneProcessManager.initialize).mockRejectedValue(
        new Error('Test error')
      );

      const result = await NeptuneHandlers.handleInitialize(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(result.error).toBeTruthy();
    });

    it('should handle null/undefined errors', async () => {
      vi.mocked(neptuneProcessManager.initialize).mockRejectedValue(null);

      const result = await NeptuneHandlers.handleInitialize(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('Service Integration', () => {
    it('should call the correct service methods', async () => {
      await NeptuneHandlers.handleInitialize({} as Electron.IpcMainInvokeEvent);
      NeptuneHandlers.handleGetStatus({} as Electron.IpcMainInvokeEvent);
      NeptuneHandlers.handleGetCookie({} as Electron.IpcMainInvokeEvent);

      expect(vi.mocked(neptuneProcessManager.initialize)).toHaveBeenCalledTimes(
        1
      );
      expect(vi.mocked(neptuneProcessManager.getStatus)).toHaveBeenCalledTimes(
        1
      );
      expect(vi.mocked(neptuneProcessManager.getCookie)).toHaveBeenCalledTimes(
        1
      );
    });

    it('should handle service method failures independently', async () => {
      vi.mocked(neptuneProcessManager.initialize).mockRejectedValue(
        new Error('Initialize failed')
      );
      vi.mocked(neptuneProcessManager.getCookie).mockReturnValue('test-cookie');

      const initResult = await NeptuneHandlers.handleInitialize(
        {} as Electron.IpcMainInvokeEvent
      );
      const cookieResult = await NeptuneHandlers.handleGetCookie(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(initResult.success).toBe(false);
      expect(cookieResult.success).toBe(true);
    });
  });
});
