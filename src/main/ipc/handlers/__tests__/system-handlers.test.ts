import { ipcMain } from 'electron';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as SystemHandlers from '@/main/ipc/handlers/system-handlers';
import { systemResourceService } from '@/main/services/system-resource.service';

// Mock Electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// Mock systemResourceService
vi.mock('@/main/services/system-resource.service', () => ({
  systemResourceService: {
    getSystemStats: vi.fn(),
    getProcessStats: vi.fn(),
    getCombinedStats: vi.fn(),
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

describe('SystemHandlers - Real Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for systemResourceService
    vi.mocked(systemResourceService.getSystemStats).mockResolvedValue({
      cpu: 25.5,
      memory: 60.2,
      timestamp: Date.now(),
    });

    vi.mocked(systemResourceService.getProcessStats).mockResolvedValue({
      isRunning: true,
      stats: {
        cpu: 10.0,
        memory: 20.0,
        elapsed: 1000,
      },
    });

    vi.mocked(systemResourceService.getCombinedStats).mockResolvedValue({
      system: { cpu: 25.5, memory: 60.2, timestamp: Date.now() },
      neptuneCore: {
        cpu: 10.0,
        memory: 20.0,
        pid: 1234,
        timestamp: Date.now(),
      },
      neptuneCli: {
        cpu: 5.0,
        memory: 10.0,
        pid: 5678,
        timestamp: Date.now(),
      },
      totalCpu: 40.5,
      totalMemory: 90.2,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Handler Registration', () => {
    it('should register all IPC handlers with correct channel names', () => {
      SystemHandlers.registerSystemHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        'system:get-resource-stats',
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'system:get-combined-stats',
        expect.any(Function)
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'system:get-process-stats',
        expect.any(Function)
      );
    });

    it('should cleanup handlers on unregister', () => {
      SystemHandlers.registerSystemHandlers();
      SystemHandlers.unregisterSystemHandlers();

      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        'system:get-resource-stats'
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        'system:get-combined-stats'
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        'system:get-process-stats'
      );
    });
  });

  describe('System Resource Stats Handler', () => {
    it('should return system statistics successfully', async () => {
      const result = await SystemHandlers.handleGetSystemResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result).toEqual({
        success: true,
        stats: {
          cpu: expect.any(Number),
          memory: expect.any(Number),
          timestamp: expect.any(Number),
        },
      });

      expect(systemResourceService.getSystemStats).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(systemResourceService.getSystemStats).mockRejectedValue(
        new Error('Failed to get system stats')
      );

      const result = await SystemHandlers.handleGetSystemResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Failed to get system stats');
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(systemResourceService.getSystemStats).mockRejectedValue(
        'Unexpected error type'
      );

      const result = await SystemHandlers.handleGetSystemResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid system stats structure', async () => {
      const result = await SystemHandlers.handleGetSystemResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(true);
      expect(result.stats).toHaveProperty('cpu');
      expect(result.stats).toHaveProperty('memory');
      expect(result.stats).toHaveProperty('timestamp');
      expect(typeof result.stats?.cpu).toBe('number');
      expect(typeof result.stats?.memory).toBe('number');
      expect(typeof result.stats?.timestamp).toBe('number');
    });
  });

  describe('Process Stats Handler', () => {
    it('should return process statistics successfully', async () => {
      const result = await SystemHandlers.handleGetProcessStats(1234);

      expect(result).toEqual({
        success: true,
        stats: {
          isRunning: true,
          stats: {
            cpu: expect.any(Number),
            memory: expect.any(Number),
            elapsed: expect.any(Number),
          },
        },
      });

      expect(systemResourceService.getProcessStats).toHaveBeenCalledWith(1234);
      expect(systemResourceService.getProcessStats).toHaveBeenCalledTimes(1);
    });

    it('should handle process stats errors', async () => {
      vi.mocked(systemResourceService.getProcessStats).mockRejectedValue(
        new Error('Process not found')
      );

      const result = await SystemHandlers.handleGetProcessStats(1234);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid process stats structure', async () => {
      const result = await SystemHandlers.handleGetProcessStats(1234);

      expect(result.success).toBe(true);
      expect(result.stats).toHaveProperty('cpu');
      expect(result.stats).toHaveProperty('memory');
      expect(result.stats).toHaveProperty('pid');
      expect(result.stats).toHaveProperty('timestamp');
    });
  });

  describe('Combined Stats Handler', () => {
    it('should return combined statistics successfully', async () => {
      const result = await SystemHandlers.handleGetCombinedResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result).toEqual({
        success: true,
        stats: {
          system: {
            cpu: expect.any(Number),
            memory: expect.any(Number),
            timestamp: expect.any(Number),
          },
          process: {
            cpu: expect.any(Number),
            memory: expect.any(Number),
            pid: expect.any(Number),
            timestamp: expect.any(Number),
          },
        },
      });

      expect(systemResourceService.getCombinedStats).toHaveBeenCalledTimes(1);
    });

    it('should handle combined stats errors', async () => {
      vi.mocked(systemResourceService.getCombinedStats).mockRejectedValue(
        new Error('Failed to get combined stats')
      );

      const result = await SystemHandlers.handleGetCombinedResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid combined stats structure', async () => {
      const result = await SystemHandlers.handleGetCombinedResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(true);
      expect(result.stats).toHaveProperty('system');
      expect(result.stats).toHaveProperty('neptuneCore');
      expect(result.stats.system).toHaveProperty('cpu');
      expect(result.stats.system).toHaveProperty('memory');
      expect(result.stats?.neptuneCore).toHaveProperty('cpu');
      expect(result.stats?.neptuneCore).toHaveProperty('memory');
      expect(result.stats?.neptuneCore).toHaveProperty('pid');
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      vi.mocked(systemResourceService.getSystemStats).mockRejectedValue(
        new Error('Test error')
      );

      const result = await SystemHandlers.handleGetSystemResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(result.error).toBeTruthy();
    });

    it('should handle null/undefined errors', async () => {
      vi.mocked(systemResourceService.getSystemStats).mockRejectedValue(null);

      const result = await SystemHandlers.handleGetSystemResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Service Integration', () => {
    it('should call the correct service methods', async () => {
      await SystemHandlers.handleGetSystemResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );
      await SystemHandlers.handleGetProcessStats(
        {} as Electron.IpcMainInvokeEvent
      );
      await SystemHandlers.handleGetCombinedResourceStats(
        {} as Electron.IpcMainInvokeEvent
      );

      expect(systemResourceService.getSystemStats).toHaveBeenCalledTimes(1);
      expect(systemResourceService.getProcessStats).toHaveBeenCalledWith(1234);
      expect(systemResourceService.getProcessStats).toHaveBeenCalledTimes(1);
      expect(systemResourceService.getCombinedStats).toHaveBeenCalledTimes(1);
    });

    it('should handle service method failures independently', async () => {
      vi.mocked(systemResourceService.getSystemStats).mockRejectedValue(
        new Error('System stats failed')
      );
      vi.mocked(systemResourceService.getProcessStats).mockResolvedValue({
        cpu: 10.0,
        memory: 20.0,
        pid: 1234,
        timestamp: Date.now(),
      });

      const systemResult = await SystemHandlers.handleGetSystemResourceStats();
      const processResult = await SystemHandlers.handleGetProcessStats();

      expect(systemResult.success).toBe(false);
      expect(processResult.success).toBe(true);
    });
  });
});
