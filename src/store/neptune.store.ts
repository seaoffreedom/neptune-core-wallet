/**
 * Neptune Process Management Store
 *
 * Zustand store for managing neptune-core, neptune-cli processes,
 * authentication cookies, and wallet data.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Process status types
export type ProcessStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

export type StartupStep =
  | 'starting'
  | 'core-starting'
  | 'core-ready'
  | 'cookie-fetching'
  | 'cli-starting'
  | 'ready'
  | 'error';

// Process state interfaces
export interface ProcessState {
  status: ProcessStatus;
  pid?: number;
  startTime?: number;
  error?: string;
}

export interface CookieState {
  value?: string;
  isValid: boolean;
  lastFetched?: number;
  error?: string;
}

export interface WalletData {
  balance: string;
  status: Record<string, unknown>;
  lastUpdated?: number;
  error?: string;
}

export interface AppState {
  isReady: boolean;
  currentStep: StartupStep;
  error?: string;
}

// Main store interface
export interface NeptuneStore {
  // Process states
  core: ProcessState;
  cli: ProcessState;

  // Authentication
  cookie: CookieState;

  // App state
  app: AppState;

  // Wallet data
  wallet: WalletData;

  // Actions
  actions: {
    // Process management
    setCoreStatus: (
      status: ProcessStatus,
      pid?: number,
      error?: string
    ) => void;
    setCliStatus: (status: ProcessStatus, pid?: number, error?: string) => void;

    // Cookie management
    setCookie: (value: string) => void;
    clearCookie: () => void;
    setCookieError: (error: string) => void;

    // App state
    setAppStep: (step: StartupStep, error?: string) => void;
    setAppReady: (ready: boolean) => void;

    // Wallet data
    setWalletData: (balance: string, status: Record<string, unknown>) => void;
    setWalletError: (error: string) => void;

    // Startup sequence
    initialize: () => Promise<void>;
    shutdown: () => Promise<void>;
  };
}

// Initial state
const initialState = {
  core: {
    status: 'stopped' as ProcessStatus,
  },
  cli: {
    status: 'stopped' as ProcessStatus,
  },
  cookie: {
    isValid: false,
  },
  app: {
    isReady: false,
    currentStep: 'starting' as StartupStep,
  },
  wallet: {
    balance: '0.00000000',
    status: null,
  },
};

// Create the store
export const useNeptuneStore = create<NeptuneStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      actions: {
        // Process management
        setCoreStatus: (
          status: ProcessStatus,
          pid?: number,
          error?: string
        ) => {
          set((state) => ({
            core: {
              ...state.core,
              status,
              pid,
              error,
              startTime:
                status === 'running' ? Date.now() : state.core.startTime,
            },
          }));
        },

        setCliStatus: (status: ProcessStatus, pid?: number, error?: string) => {
          set((state) => ({
            cli: {
              ...state.cli,
              status,
              pid,
              error,
              startTime:
                status === 'running' ? Date.now() : state.cli.startTime,
            },
          }));
        },

        // Cookie management
        setCookie: (value: string) => {
          set((state) => ({
            cookie: {
              ...state.cookie,
              value,
              isValid: true,
              lastFetched: Date.now(),
              error: undefined,
            },
          }));
        },

        clearCookie: () => {
          set((state) => ({
            cookie: {
              ...state.cookie,
              value: undefined,
              isValid: false,
              error: undefined,
            },
          }));
        },

        setCookieError: (error: string) => {
          set((state) => ({
            cookie: {
              ...state.cookie,
              error,
              isValid: false,
            },
          }));
        },

        // App state
        setAppStep: (step: StartupStep, error?: string) => {
          set((state) => ({
            app: {
              ...state.app,
              currentStep: step,
              error,
            },
          }));
        },

        setAppReady: (ready: boolean) => {
          set((state) => ({
            app: {
              ...state.app,
              isReady: ready,
            },
          }));
        },

        // Wallet data
        setWalletData: (balance: string, status: Record<string, unknown>) => {
          set((state) => ({
            wallet: {
              ...state.wallet,
              balance,
              status,
              lastUpdated: Date.now(),
              error: undefined,
            },
          }));
        },

        setWalletError: (error: string) => {
          set((state) => ({
            wallet: {
              ...state.wallet,
              error,
            },
          }));
        },

        // Startup sequence (will be implemented with IPC calls)
        initialize: async () => {
          const { setAppStep } = get().actions;
          setAppStep('starting');

          try {
            // This will be implemented with IPC calls to the main process
            console.log('Initializing Neptune processes...');
            // TODO: Implement actual initialization logic
          } catch (error) {
            setAppStep('error', (error as Error).message);
          }
        },

        shutdown: async () => {
          const { setCoreStatus, setCliStatus, clearCookie, setAppReady } =
            get().actions;

          try {
            // Stop processes
            setCoreStatus('stopping');
            setCliStatus('stopping');

            // Clear cookie
            clearCookie();

            // Reset app state
            setAppReady(false);

            console.log('Shutting down Neptune processes...');
            // TODO: Implement actual shutdown logic
          } catch (error) {
            console.error('Error during shutdown:', error);
          }
        },
      },
    }),
    {
      name: 'neptune-store',
    }
  )
);

// Selectors for easier access
export const useCoreStatus = () => useNeptuneStore((state) => state.core);
export const useCliStatus = () => useNeptuneStore((state) => state.cli);
export const useCookie = () => useNeptuneStore((state) => state.cookie);
export const useAppState = () => useNeptuneStore((state) => state.app);
export const useWalletData = () => useNeptuneStore((state) => state.wallet);
export const useNeptuneActions = () =>
  useNeptuneStore((state) => state.actions);
