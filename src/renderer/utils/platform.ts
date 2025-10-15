/**
 * Platform detection utilities for the renderer process
 */

/**
 * Check if the current platform is macOS
 * @returns true if running on macOS, false otherwise
 */
export const isMacOS = (): boolean => {
  return (
    typeof window !== 'undefined' && window.navigator.platform.includes('Mac')
  );
};

/**
 * Check if the current platform is Windows
 * @returns true if running on Windows, false otherwise
 */
export const isWindows = (): boolean => {
  return (
    typeof window !== 'undefined' && window.navigator.platform.includes('Win')
  );
};

/**
 * Check if the current platform is Linux
 * @returns true if running on Linux, false otherwise
 */
export const isLinux = (): boolean => {
  return (
    typeof window !== 'undefined' && window.navigator.platform.includes('Linux')
  );
};

/**
 * Get the current platform name
 * @returns platform name as string
 */
export const getPlatform = (): string => {
  if (typeof window === 'undefined') return 'unknown';

  const platform = window.navigator.platform;
  if (platform.includes('Mac')) return 'darwin';
  if (platform.includes('Win')) return 'win32';
  if (platform.includes('Linux')) return 'linux';
  return 'unknown';
};
