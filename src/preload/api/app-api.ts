/**
 * App API - Exposed to Renderer
 *
 * Exposes app-related functionality to the renderer process through the context bridge.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import type {
  AppQuitRequest,
  AppVersionResponse,
} from '../../shared/types/ipc-channels';

export const appAPI = {
  /**
   * Quit the application
   */
  quit: async (force?: boolean): Promise<void> => {
    const request: AppQuitRequest = { force };
    await ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT, request);
  },

  /**
   * Restart the application
   */
  restart: async (): Promise<void> => {
    await ipcRenderer.invoke(IPC_CHANNELS.APP_RESTART);
  },

  /**
   * Get application version information
   */
  getVersion: async (): Promise<AppVersionResponse> => {
    return await ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
  },
};
