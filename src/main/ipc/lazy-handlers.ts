/**
 * Lazy Handler Registration System
 *
 * This module implements lazy loading of heavy IPC handlers to improve startup performance.
 * Handlers are only registered when their corresponding features are first accessed.
 */

// import { ipcMain } from "electron"; // Unused for now

// Track which handlers have been registered
const registeredHandlers = new Set<string>();

/**
 * Lazy register blockchain handlers
 */
export async function ensureBlockchainHandlers() {
  if (registeredHandlers.has('blockchain')) {
    return;
  }

  console.log('Lazy loading blockchain handlers...');
  const { registerBlockchainHandlers } = await import(
    './handlers/blockchain-handlers'
  );
  registerBlockchainHandlers();
  registeredHandlers.add('blockchain');
}

/**
 * Lazy register process handlers
 */
export async function ensureProcessHandlers() {
  if (registeredHandlers.has('process')) {
    return;
  }

  console.log('Lazy loading process handlers...');
  const { registerProcessHandlers } = await import(
    './handlers/process-handlers'
  );
  registerProcessHandlers();
  registeredHandlers.add('process');
}

/**
 * Lazy register neptune handlers
 */
export async function ensureNeptuneHandlers() {
  if (registeredHandlers.has('neptune')) {
    return;
  }

  console.log('Lazy loading neptune handlers...');
  const { registerNeptuneHandlers } = await import(
    './handlers/neptune-handlers'
  );
  registerNeptuneHandlers();
  registeredHandlers.add('neptune');
}

/**
 * Lazy register wallet handlers
 */
export async function ensureWalletHandlers() {
  if (registeredHandlers.has('wallet')) {
    return;
  }

  console.log('Lazy loading wallet handlers...');
  const { registerWalletHandlers } = await import('./handlers/wallet-handlers');
  registerWalletHandlers();
  registeredHandlers.add('wallet');
}

/**
 * Lazy register peer handlers
 */
export async function ensurePeerHandlers() {
  if (registeredHandlers.has('peer')) {
    return;
  }

  console.log('Lazy loading peer handlers...');
  const { registerPeerHandlers } = await import('./handlers/peer-handlers');
  registerPeerHandlers();
  registeredHandlers.add('peer');
}

/**
 * Lazy register system handlers
 */
export async function ensureSystemHandlers() {
  if (registeredHandlers.has('system')) {
    return;
  }

  console.log('Lazy loading system handlers...');
  const { registerSystemHandlers } = await import('./handlers/system-handlers');
  registerSystemHandlers();
  registeredHandlers.add('system');
}

/**
 * Lazy register address book handlers
 */
export async function ensureAddressBookHandlers() {
  if (registeredHandlers.has('addressBook')) {
    return;
  }

  console.log('Lazy loading address book handlers...');
  const { registerAddressBookHandlers } = await import(
    './handlers/address-book-handlers'
  );
  registerAddressBookHandlers();
  registeredHandlers.add('addressBook');
}

/**
 * Lazy register neptune core settings handlers
 */
export async function ensureNeptuneCoreSettingsHandlers() {
  if (registeredHandlers.has('neptuneCoreSettings')) {
    return;
  }

  console.log('Lazy loading neptune core settings handlers...');
  const { registerNeptuneCoreSettingsHandlers } = await import(
    './handlers/neptune-core-settings-handlers'
  );
  registerNeptuneCoreSettingsHandlers();
  registeredHandlers.add('neptuneCoreSettings');
}

/**
 * Create a lazy IPC handler that ensures the required handlers are loaded
 */
export function createLazyHandler<T = unknown>(
  _channel: string,
  handlerType: string,
  handler: (
    event: Electron.IpcMainInvokeEvent,
    ...args: unknown[]
  ) => Promise<T>
) {
  return async (event: Electron.IpcMainInvokeEvent, ...args: unknown[]) => {
    // Ensure the required handlers are loaded
    switch (handlerType) {
      case 'blockchain':
        await ensureBlockchainHandlers();
        break;
      case 'process':
        await ensureProcessHandlers();
        break;
      case 'neptune':
        await ensureNeptuneHandlers();
        break;
      case 'wallet':
        await ensureWalletHandlers();
        break;
      case 'peer':
        await ensurePeerHandlers();
        break;
      case 'system':
        await ensureSystemHandlers();
        break;
      case 'addressBook':
        await ensureAddressBookHandlers();
        break;
      case 'neptuneCoreSettings':
        await ensureNeptuneCoreSettingsHandlers();
        break;
    }

    // Call the actual handler
    return handler(event, ...args);
  };
}

/**
 * Get list of registered handlers (for debugging)
 */
export function getRegisteredHandlers(): string[] {
  return Array.from(registeredHandlers);
}
