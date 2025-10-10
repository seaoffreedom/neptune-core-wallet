/**
 * Window API - Exposed to Renderer
 *
 * Exposes window-related functionality to the renderer process through the context bridge.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import type {
  WindowMaximizedResponse,
  WindowTitleRequest,
} from '../../shared/types/ipc-channels';

export const windowAPI = {
  /**
   * Minimize the window
   */
  minimize: async (): Promise<void> => {
    await ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE);
  },

  /**
   * Maximize or unmaximize the window
   */
  maximize: async (): Promise<void> => {
    await ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE);
  },

  /**
   * Close the window
   */
  close: async (): Promise<void> => {
    await ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE);
  },

  /**
   * Check if window is maximized
   */
  isMaximized: async (): Promise<boolean> => {
    const response: WindowMaximizedResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.WINDOW_IS_MAXIMIZED
    );
    return response.isMaximized;
  },

  /**
   * Set window title
   */
  setTitle: async (title: string): Promise<void> => {
    const request: WindowTitleRequest = { title };
    await ipcRenderer.invoke(IPC_CHANNELS.WINDOW_SET_TITLE, request);
  },
};
