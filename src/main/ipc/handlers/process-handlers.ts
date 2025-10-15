/**
 * Process Management IPC Handlers
 *
 * Handles process-related IPC communication between main and renderer processes.
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { ipcMain } from 'electron';
import pino from 'pino';
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

// Logger
const logger = pino({ level: 'info' });

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
      logger.debug({ pid: childProcess.pid, code, signal }, 'Process exited');
      if (childProcess.pid) {
        activeProcesses.delete(childProcess.pid);
      }
    });

    childProcess.on('error', (error) => {
      logger.error(
        { pid: childProcess.pid, error: (error as Error).message },
        'Process error'
      );
      if (childProcess.pid) {
        activeProcesses.delete(childProcess.pid);
      }
    });

    // Set timeout to kill process if it runs too long
    const timeout = setTimeout(() => {
      if (childProcess.pid && activeProcesses.has(childProcess.pid)) {
        logger.warn(
          { pid: childProcess.pid },
          'Killing process due to timeout'
        );
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
    logger.error({ error: (error as Error).message }, 'Error spawning process');
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

    childProcess.kill((request.signal || 'SIGTERM') as NodeJS.Signals);
    activeProcesses.delete(request.pid);

    return {
      success: true,
    };
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Error killing process');
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
    logger.error(
      { error: (error as Error).message },
      'Error getting process status'
    );
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
  logger.info(
    { processCount: activeProcesses.size },
    'Cleaning up active processes'
  );

  for (const [pid, childProcess] of activeProcesses) {
    try {
      childProcess.kill('SIGTERM');
    } catch (error) {
      logger.error(
        { pid, error: (error as Error).message },
        'Error killing process during cleanup'
      );
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
