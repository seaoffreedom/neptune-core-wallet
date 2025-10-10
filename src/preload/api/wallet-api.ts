/**
 * Wallet API - Exposed to Renderer
 *
 * Exposes wallet-related functionality to the renderer process through the context bridge.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import type {
  WalletCreateRequest,
  WalletCreateResponse,
  WalletDecryptRequest,
  WalletDecryptResponse,
  WalletEncryptRequest,
  WalletEncryptResponse,
  WalletLoadRequest,
  WalletLoadResponse,
  WalletSaveRequest,
  WalletSaveResponse,
} from '../../shared/types/ipc-channels';

export const walletAPI = {
  /**
   * Create a new wallet
   */
  createWallet: async (
    name: string,
    password?: string,
    path?: string
  ): Promise<{
    success: boolean;
    walletId?: string;
    error?: string;
  }> => {
    const request: WalletCreateRequest = { name, password, path };
    const response: WalletCreateResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.WALLET_CREATE,
      request
    );
    return {
      success: response.success,
      walletId: response.walletId,
      error: response.error,
    };
  },

  /**
   * Load a wallet from file
   */
  loadWallet: async (
    path: string,
    password?: string
  ): Promise<{
    success: boolean;
    wallet?: {
      id: string;
      name: string;
      addresses: string[];
    };
    error?: string;
  }> => {
    const request: WalletLoadRequest = { path, password };
    const response: WalletLoadResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.WALLET_LOAD,
      request
    );
    return {
      success: response.success,
      wallet: response.wallet,
      error: response.error,
    };
  },

  /**
   * Save a wallet to file
   */
  saveWallet: async (
    walletId: string,
    path: string,
    password?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: WalletSaveRequest = { walletId, path, password };
    const response: WalletSaveResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.WALLET_SAVE,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },

  /**
   * Encrypt a wallet
   */
  encryptWallet: async (
    walletId: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: WalletEncryptRequest = { walletId, password };
    const response: WalletEncryptResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.WALLET_ENCRYPT,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },

  /**
   * Decrypt a wallet
   */
  decryptWallet: async (
    walletId: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const request: WalletDecryptRequest = { walletId, password };
    const response: WalletDecryptResponse = await ipcRenderer.invoke(
      IPC_CHANNELS.WALLET_DECRYPT,
      request
    );
    return {
      success: response.success,
      error: response.error,
    };
  },
};
