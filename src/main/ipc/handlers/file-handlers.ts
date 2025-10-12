/**
 * File Operations IPC Handlers
 *
 * Handles file-related IPC communication between main and renderer processes.
 */

import { dialog, ipcMain } from 'electron';
import fs from 'fs-extra';
import pino from 'pino';
import { IPC_CHANNELS } from '../../../shared/constants/ipc-channels';
import {
  fileExistsWithRetry,
  readFileWithRetry,
  writeFileWithRetry,
} from '../../utils/async-file-operations';

// Logger
const logger = pino({ level: 'info' });

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
} from '../../../shared/types/ipc-channels';

/**
 * Handle open file dialog request
 */
export async function handleFileOpenDialog(
  _event: Electron.IpcMainInvokeEvent,
  request: FileDialogRequest
): Promise<FileDialogResponse> {
  try {
    const result = await dialog.showOpenDialog({
      title: request.title || 'Open File',
      defaultPath: request.defaultPath,
      filters: request.filters,
      properties: request.properties,
    });

    return {
      canceled: result.canceled,
      filePaths: result.filePaths,
    };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error opening file dialog'
    );
    return {
      canceled: true,
      filePaths: [],
    };
  }
}

/**
 * Handle save file dialog request
 */
export async function handleFileSaveDialog(
  _event: Electron.IpcMainInvokeEvent,
  request: FileDialogRequest
): Promise<FileDialogResponse> {
  try {
    const result = await dialog.showSaveDialog({
      title: request.title || 'Save File',
      defaultPath: request.defaultPath,
      filters: request.filters,
    });

    return {
      canceled: result.canceled,
      filePaths: result.filePath ? [result.filePath] : [],
    };
  } catch (error) {
    logger.error(
      { error: (error as Error).message },
      'Error opening save dialog'
    );
    return {
      canceled: true,
      filePaths: [],
    };
  }
}

/**
 * Handle read file request
 */
export async function handleFileRead(
  _event: Electron.IpcMainInvokeEvent,
  request: FileReadRequest
): Promise<FileReadResponse> {
  try {
    const data = await readFileWithRetry(request.path, {
      encoding: request.encoding || 'utf8',
      retries: 2,
      timeout: 3000,
    });
    return {
      success: true,
      data: data as string,
    };
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error reading file');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle write file request
 */
export async function handleFileWrite(
  _event: Electron.IpcMainInvokeEvent,
  request: FileWriteRequest
): Promise<FileWriteResponse> {
  try {
    // Ensure directory exists
    await writeFileWithRetry(request.path, request.data, {
      encoding: request.encoding || 'utf8',
      retries: 2,
      timeout: 3000,
    });
    return {
      success: true,
    };
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error writing file');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle file exists check request
 */
export async function handleFileExists(
  _event: Electron.IpcMainInvokeEvent,
  request: FileExistsRequest
): Promise<FileExistsResponse> {
  try {
    const exists = await fileExistsWithRetry(request.path, {
      retries: 2,
      timeout: 2000,
    });
    return { exists };
  } catch {
    return { exists: false };
  }
}

/**
 * Handle delete file request
 */
export async function handleFileDelete(
  _event: Electron.IpcMainInvokeEvent,
  request: FileDeleteRequest
): Promise<FileDeleteResponse> {
  try {
    await fs.unlink(request.path);
    return {
      success: true,
    };
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error deleting file');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Register file IPC handlers
 */
export function registerFileHandlers() {
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN_DIALOG, handleFileOpenDialog);
  ipcMain.handle(IPC_CHANNELS.FILE_SAVE_DIALOG, handleFileSaveDialog);
  ipcMain.handle(IPC_CHANNELS.FILE_READ, handleFileRead);
  ipcMain.handle(IPC_CHANNELS.FILE_WRITE, handleFileWrite);
  ipcMain.handle(IPC_CHANNELS.FILE_EXISTS, handleFileExists);
  ipcMain.handle(IPC_CHANNELS.FILE_DELETE, handleFileDelete);
}

/**
 * Unregister file IPC handlers
 */
export function unregisterFileHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.FILE_OPEN_DIALOG);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_SAVE_DIALOG);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_READ);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_WRITE);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_EXISTS);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_DELETE);
}
