/**
 * Process Management IPC Handlers
 *
 * Handles process-related IPC communication between main and renderer processes.
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { ipcMain } from 'electron';
import { APP_CONSTANTS } from '../../../shared/constants/app-constants';
import { IPC_CHANNELS } from '../../../shared/constants/ipc-channels';
import type {
  ProcessKillRequest,
  ProcessKillResponse,
  ProcessSpawnRequest,
  ProcessSpawnResponse,
  ProcessStatusRequest,
  ProcessStatusResponse,
} from '../../../shared/types/ipc-channels';

// Store active processes
const activeProcesses = new Map<number, ChildProcess>();

/**
 * Handle spawn process request
 */
export async function handleProcessSpawn(
  _event: Electron.IpcMainInvokeEvent,
  request: ProcessSpawnRequest
): Promise<ProcessSpawnResponse> {
  try {
    const childProcess = spawn(request.command, request.args || [], {
      cwd: request.options?.cwd,
      env: { ...process.env, ...request.options?.env },
      shell: request.options?.shell || false,
    });

    if (!childProcess.pid) {
      return {
        success: false,
        error: 'Failed to spawn process',
      };
    }

    // Store the process
    activeProcesses.set(childProcess.pid, childProcess);

    // Set up process event handlers
    childProcess.on('exit', (code, signal) => {
      console.log(
        `Process ${childProcess.pid} exited with code ${code} and signal ${signal}`
      );
      if (childProcess.pid) {
        activeProcesses.delete(childProcess.pid);
      }
    });

    childProcess.on('error', (error) => {
      console.error(`Process ${childProcess.pid} error:`, error);
      if (childProcess.pid) {
        activeProcesses.delete(childProcess.pid);
      }
    });

    // Set timeout to kill process if it runs too long
    const timeout = setTimeout(() => {
      if (childProcess.pid && activeProcesses.has(childProcess.pid)) {
        console.log(`Killing process ${childProcess.pid} due to timeout`);
        childProcess.kill('SIGTERM');
        activeProcesses.delete(childProcess.pid);
      }
    }, APP_CONSTANTS.MAX_PROCESS_TIMEOUT);

    childProcess.on('exit', () => {
      clearTimeout(timeout);
    });

    return {
      success: true,
      pid: childProcess.pid,
    };
  } catch (error) {
    console.error('Error spawning process:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle kill process request
 */
export async function handleProcessKill(
  _event: Electron.IpcMainInvokeEvent,
  request: ProcessKillRequest
): Promise<ProcessKillResponse> {
  try {
    const childProcess = activeProcesses.get(request.pid);

    if (!childProcess) {
      return {
        success: false,
        error: 'Process not found',
      };
    }

    childProcess.kill((request.signal as NodeJS.Signals) || 'SIGTERM');
    activeProcesses.delete(request.pid);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error killing process:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle get process status request
 */
export async function handleProcessStatus(
  _event: Electron.IpcMainInvokeEvent,
  request: ProcessStatusRequest
): Promise<ProcessStatusResponse> {
  try {
    const childProcess = activeProcesses.get(request.pid);

    if (!childProcess) {
      return {
        success: false,
        error: 'Process not found',
      };
    }

    // Check if process is still running
    const running = !childProcess.killed && childProcess.exitCode === null;

    return {
      success: true,
      running,
    };
  } catch (error) {
    console.error('Error getting process status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up all active processes on app exit
 */
export function cleanupProcesses() {
  console.log(`Cleaning up ${activeProcesses.size} active processes`);

  for (const [pid, childProcess] of activeProcesses) {
    try {
      console.log(`Killing process ${pid}`);
      childProcess.kill('SIGTERM');
    } catch (error) {
      console.error(`Error killing process ${pid}:`, error);
    }
  }

  activeProcesses.clear();
}

/**
 * Register process IPC handlers
 */
export function registerProcessHandlers() {
  ipcMain.handle(IPC_CHANNELS.PROCESS_SPAWN, handleProcessSpawn);
  ipcMain.handle(IPC_CHANNELS.PROCESS_KILL, handleProcessKill);
  ipcMain.handle(IPC_CHANNELS.PROCESS_GET_STATUS, handleProcessStatus);
}

/**
 * Unregister process IPC handlers
 */
export function unregisterProcessHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.PROCESS_SPAWN);
  ipcMain.removeHandler(IPC_CHANNELS.PROCESS_KILL);
  ipcMain.removeHandler(IPC_CHANNELS.PROCESS_GET_STATUS);
}
