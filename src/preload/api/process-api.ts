/**
 * Process API - Exposed to Renderer
 *
 * Exposes process-related functionality to the renderer process through the context bridge.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import type {
  ProcessKillRequest,
  ProcessKillResponse,
  ProcessSpawnRequest,
  ProcessSpawnResponse,
  ProcessStatusRequest,
  ProcessStatusResponse,
} from '../../shared/types/ipc-channels';

export const processAPI = {
  /**
   * Spawn a new process
   */
  spawnProcess: async (
    command: string,
    args?: string[],
    options?: {
      cwd?: string;
      env?: Record<string, string>;
      shell?: boolean;
    }
  ): Promise<{
    success: boolean;
    pid?: number;
    error?: string;
  }> => {
    const request: ProcessSpawnRequest = {
      command,
      args,
      options,
    };

    const response: ProcessSpawnResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.PROCESS_SPAWN,
      request
    );
    return {
      success: response.success,
      pid: response.pid,
      error: response.error,
    };
  },

  /**
   * Kill a process
   */
  killProcess: async (
    pid: number,
    signal?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: ProcessKillRequest = { pid, signal };
    const response: ProcessKillResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.PROCESS_KILL,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },

  /**
   * Get process status
   */
  getProcessStatus: async (
    pid: number
  ): Promise<{
    success: boolean;
    running?: boolean;
    error?: string;
  }> => {
    const request: ProcessStatusRequest = { pid };
    const response: ProcessStatusResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.PROCESS_GET_STATUS,
      request
    );
    return {
      success: response.success,
      running: response.running,
      error: response.error,
    };
  },
};
