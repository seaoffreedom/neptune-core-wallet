/**
 * System Resource API
 *
 * Exposes system resource monitoring functionality to the renderer process.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';

export interface SystemResourceStats {
  cpu: number;
  memory: number;
  timestamp: number;
}

export interface ProcessResourceStats {
  pid: number;
  cpu: number;
  memory: number;
  timestamp: number;
}

export interface CombinedResourceStats {
  system: SystemResourceStats | null;
  neptuneCore: ProcessResourceStats | null;
  neptuneCli: ProcessResourceStats | null;
  totalCpu: number;
  totalMemory: number;
}

export const systemAPI = {
  /**
   * Get system resource stats
   */
  getResourceStats: async (): Promise<{
    success: boolean;
    stats?: SystemResourceStats;
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_RESOURCE_STATS);
  },

  /**
   * Get combined resource stats (system + Neptune processes)
   */
  getCombinedStats: async (): Promise<{
    success: boolean;
    stats?: CombinedResourceStats;
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_COMBINED_STATS);
  },

  /**
   * Get process stats by PID (similar to trident-wallet)
   */
  getProcessStats: async (
    pid: number
  ): Promise<{
    success: boolean;
    stats?: {
      isRunning: boolean;
      stats?: {
        cpu: number;
        memory: number;
        elapsed: number;
      };
      error?: string;
    };
    error?: string;
  }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PROCESS_STATS, pid);
  },
};
