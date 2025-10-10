/**
 * File API - Exposed to Renderer
 *
 * Exposes file-related functionality to the renderer process through the context bridge.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import type {
  FileDeleteRequest,
  FileDeleteResponse,
  FileDialogRequest,
  FileDialogResponse,
  FileExistsRequest,
  FileExistsResponse,
  FileReadRequest,
  FileReadResponse,
  FileWriteRequest,
  FileWriteResponse,
} from '../../shared/types/ipc-channels';

export const fileAPI = {
  /**
   * Open file dialog
   */
  openDialog: async (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
    properties?: Array<
      'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'
    >;
  }): Promise<{
    canceled: boolean;
    filePaths: string[];
  }> => {
    const request: FileDialogRequest = {
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
      properties: options?.properties,
    };

    const response: FileDialogResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.FILE_OPEN_DIALOG,
      request
    );
    return {
      canceled: response.canceled,
      filePaths: response.filePaths,
    };
  },

  /**
   * Save file dialog
   */
  saveDialog: async (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
  }): Promise<{
    canceled: boolean;
    filePath?: string;
  }> => {
    const request: FileDialogRequest = {
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    };

    const response: FileDialogResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.FILE_SAVE_DIALOG,
      request
    );
    return {
      canceled: response.canceled,
      filePath: response.filePaths[0],
    };
  },

  /**
   * Read file
   */
  readFile: async (
    path: string,
    encoding?: BufferEncoding
  ): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> => {
    const request: FileReadRequest = { path, encoding };
    const response: FileReadResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.FILE_READ,
      request
    );
    return {
      success: response.success,
      data: response.data,
      error: response.error,
    };
  },

  /**
   * Write file
   */
  writeFile: async (
    path: string,
    data: string,
    encoding?: BufferEncoding
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: FileWriteRequest = { path, data, encoding };
    const response: FileWriteResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.FILE_WRITE,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },

  /**
   * Check if file exists
   */
  fileExists: async (path: string): Promise<boolean> => {
    const request: FileExistsRequest = { path };
    const response: FileExistsResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.FILE_EXISTS,
      request
    );
    return response.exists;
  },

  /**
   * Delete file
   */
  deleteFile: async (
    path: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: FileDeleteRequest = { path };
    const response: FileDeleteResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.FILE_DELETE,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },
};
