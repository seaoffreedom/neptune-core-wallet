/**
 * Electron API Type Definitions for Renderer
 *
 * Type definitions for the Electron API exposed through the context bridge.
 */

import type { ElectronAPI } from '../../shared/types/api-types';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
