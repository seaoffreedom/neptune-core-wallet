/**
 * API Type Definitions
 *
 * TypeScript interfaces for the Electron API exposed through the context bridge.
 * These types are used in both main and renderer processes.
 */

// Electron API interface exposed to renderer
export interface ElectronAPI {
  // App lifecycle
  quit: (force?: boolean) => Promise<void>;
  restart: () => Promise<void>;
  getVersion: () => Promise<{
    version: string;
    electronVersion: string;
    nodeVersion: string;
  }>;

  // Window management
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  setTitle: (title: string) => Promise<void>;

  // File operations
  openDialog: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
    properties?: Array<
      'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'
    >;
  }) => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;

  saveDialog: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
  }) => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;

  readFile: (
    path: string,
    encoding?: BufferEncoding
  ) => Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }>;

  writeFile: (
    path: string,
    data: string,
    encoding?: BufferEncoding
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  fileExists: (path: string) => Promise<boolean>;

  deleteFile: (path: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Settings management
  getSetting: <T = unknown>(
    key: string
  ) => Promise<{
    success: boolean;
    value?: T;
    error?: string;
  }>;

  setSetting: <T = unknown>(
    key: string,
    value: T
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  resetSetting: (key?: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  exportSettings: (path?: string) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }>;

  importSettings: (path: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Process management
  spawnProcess: (
    command: string,
    args?: string[],
    options?: {
      cwd?: string;
      env?: Record<string, string>;
      shell?: boolean;
    }
  ) => Promise<{
    success: boolean;
    pid?: number;
    error?: string;
  }>;

  killProcess: (
    pid: number,
    signal?: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  getProcessStatus: (pid: number) => Promise<{
    success: boolean;
    running?: boolean;
    error?: string;
  }>;

  // Wallet operations
  createWallet: (
    name: string,
    password?: string,
    path?: string
  ) => Promise<{
    success: boolean;
    walletId?: string;
    error?: string;
  }>;

  loadWallet: (
    path: string,
    password?: string
  ) => Promise<{
    success: boolean;
    wallet?: {
      id: string;
      name: string;
      addresses: string[];
    };
    error?: string;
  }>;

  saveWallet: (
    walletId: string,
    path: string,
    password?: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  encryptWallet: (
    walletId: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  decryptWallet: (
    walletId: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Worker operations (temporarily disabled)
  // executeWorker: (request: {
  //     workerType: string;
  //     operation: string;
  //     data: any;
  //     timeout?: number;
  // }) => Promise<{
  //     success: boolean;
  //     result?: any;
  //     error?: string;
  // }>;

  // getWorkerStatus: () => Promise<{
  //     success: boolean;
  //     stats: {
  //         activeWorkers: number;
  //         workerTypes: string[];
  //     };
  // }>;

  // terminateAllWorkers: () => Promise<{
  //     success: boolean;
  //     terminated: number;
  // }>;

  // executeMockTask: (
  //     operation: "calculate" | "process" | "simulate",
  //     data: any,
  //     timeout?: number,
  // ) => Promise<{
  //     success: boolean;
  //     result?: any;
  //     error?: string;
  // }>;

  // Neptune process management
  initializeNeptune: () => Promise<{
    success: boolean;
    error?: string;
  }>;

  getNeptuneStatus: () => Promise<{
    success: boolean;
    status?: {
      core: {
        running: boolean;
        pid?: number;
      };
      cli: {
        running: boolean;
        pid?: number;
      };
      initialized: boolean;
    };
    error?: string;
  }>;

  shutdownNeptune: () => Promise<{
    success: boolean;
    error?: string;
  }>;

  restartNeptune: () => Promise<{
    success: boolean;
    error?: string;
  }>;

  getNeptuneCookie: () => Promise<{
    success: boolean;
    cookie?: string;
    error?: string;
  }>;

  getNeptuneWalletData: () => Promise<{
    success: boolean;
    data?: {
      balance: string;
      status: Record<string, unknown>;
      lastUpdated: number;
    };
    error?: string;
  }>;

  // Blockchain data fetching
  setBlockchainCookie: (cookie: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  getDashboardOverview: () => Promise<{
    success: boolean;
    data?: {
      confirmations: string;
      confirmed_available_balance: string;
      confirmed_total_balance: string;
      cpu_temp: number | null;
      max_num_peers: number;
      mempool_own_tx_count: number;
      mempool_size: number;
      mempool_total_tx_count: number;
      mining_status: string;
      peer_count: number;
      proving_capability: string;
      syncing: boolean;
      tip_digest: string;
      tip_header: {
        height: number;
        timestamp: number;
      };
      unconfirmed_available_balance: string;
      unconfirmed_total_balance: string;
    };
    error?: string;
  }>;

  getBlockHeight: () => Promise<{
    success: boolean;
    height?: string;
    error?: string;
  }>;

  getNetwork: () => Promise<{
    success: boolean;
    network?: string;
    error?: string;
  }>;

  getWalletStatus: () => Promise<{
    success: boolean;
    status?: Record<string, unknown>;
    error?: string;
  }>;

  getNextReceivingAddress: () => Promise<{
    success: boolean;
    address?: string;
    error?: string;
  }>;

  getTransactionHistory: () => Promise<{
    success: boolean;
    history?: unknown[];
    error?: string;
  }>;

  // System integration
  showNotification: (
    title: string,
    options?: {
      body?: string;
      icon?: string;
      silent?: boolean;
    }
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  getPlatform: () => Promise<{
    platform: string;
    arch: string;
  }>;

  getPath: (
    name:
      | 'home'
      | 'appData'
      | 'userData'
      | 'temp'
      | 'exe'
      | 'module'
      | 'desktop'
      | 'documents'
      | 'downloads'
      | 'music'
      | 'pictures'
      | 'videos'
  ) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }>;

  // Blockchain data fetching
  blockchain: {
    setCookie: (
      cookie: string
    ) => Promise<{ success: boolean; error?: string }>;
    getDashboardOverview: () => Promise<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>;
    getBlockHeight: () => Promise<{
      success: boolean;
      height?: string;
      error?: string;
    }>;
    getNetwork: () => Promise<{
      success: boolean;
      network?: string;
      error?: string;
    }>;
    getWalletStatus: () => Promise<{
      success: boolean;
      status?: unknown;
      error?: string;
    }>;
    getNextReceivingAddress: () => Promise<{
      success: boolean;
      address?: string;
      error?: string;
    }>;
    getHistory: () => Promise<{
      success: boolean;
      history?: unknown[];
      error?: string;
    }>;
    getConfirmations: () => Promise<{
      success: boolean;
      confirmations?: string;
      error?: string;
    }>;
    listOwnCoins: () => Promise<{
      success: boolean;
      coins?: unknown[];
      error?: string;
    }>;
    send: (params: {
      outputs: Array<{ address: string; amount: string }>;
      change_policy?: string;
      fee?: string;
    }) => Promise<{
      success: boolean;
      txId?: string;
      error?: string;
    }>;
    sendTransparent: (params: {
      outputs: Array<{ address: string; amount: string }>;
      change_policy?: string;
      fee?: string;
    }) => Promise<{
      success: boolean;
      result?: unknown;
      error?: string;
    }>;
    getMempoolTxCount: () => Promise<{
      success: boolean;
      count?: number;
      error?: string;
    }>;
    getMempoolSize: () => Promise<{
      success: boolean;
      size?: number;
      error?: string;
    }>;
    listUtxos: () => Promise<{
      success: boolean;
      utxos?: unknown;
      error?: string;
    }>;
    getSpendableInputs: () => Promise<{
      success: boolean;
      inputs?: unknown[];
      error?: string;
    }>;
    selectSpendableInputs: (params: { amount: string }) => Promise<{
      success: boolean;
      inputs?: unknown[];
      error?: string;
    }>;
    getMempoolTxIds: () => Promise<{
      success: boolean;
      txIds?: string[];
      error?: string;
    }>;
    broadcastAllMempoolTxs: () => Promise<{
      success: boolean;
      result?: string;
      error?: string;
    }>;
    clearMempool: () => Promise<{
      success: boolean;
      result?: string;
      error?: string;
    }>;
    getMempoolTxKernel: (params: { tx_kernel_id: string }) => Promise<{
      success: boolean;
      result?: unknown;
      error?: string;
    }>;
    getSyncStatus: () => Promise<{
      success: boolean;
      result?: {
        connectedPeers: number;
        currentBlockHeight: string;
        isSynced: boolean;
        lastSyncCheck: string;
        latestBlockHash: string;
        pendingTransactions: number;
      };
      error?: string;
    }>;
    getNetworkInfo: () => Promise<{
      success: boolean;
      result?: {
        blockHeight: string;
        lastUpdated: string;
        network: string;
        tipDigest: string;
      };
      error?: string;
    }>;
    getPeerInfo: () => Promise<{
      success: boolean;
      peers?: Array<{
        address: string;
        connected: boolean;
        lastSeen: number;
      }>;
      connectedCount?: number;
      lastUpdated?: string;
      error?: string;
    }>;
    getBalance: () => Promise<{
      success: boolean;
      confirmed?: string;
      unconfirmed?: string;
      lastUpdated?: string;
      error?: string;
    }>;
    getBlockDifficulties: (params: {
      block_selector: string;
      max_num_blocks: number;
    }) => Promise<{
      success: boolean;
      result?: Array<[number, number[]]>;
      error?: string;
    }>;
    getBlockIntervals: (params: {
      block_selector: string;
      max_num_blocks: number;
    }) => Promise<{
      success: boolean;
      result?: Array<[number, number]>;
      error?: string;
    }>;
    validateAddress: (params: { address: string }) => Promise<{
      success: boolean;
      isValid?: boolean;
      error?: string;
    }>;
    validateAmount: (params: { amount: string }) => Promise<{
      success: boolean;
      isValid?: boolean;
      error?: string;
    }>;
    getNthReceivingAddress: (params: { n: number }) => Promise<{
      success: boolean;
      address?: string;
      error?: string;
    }>;
    getBlockDigest: (params: { height: number }) => Promise<{
      success: boolean;
      digest?: unknown;
      error?: string;
    }>;
    getLatestTipDigests: (params: { n: number }) => Promise<{
      success: boolean;
      digests?: unknown;
      error?: string;
    }>;
    getInstanceId: () => Promise<{
      success: boolean;
      instanceId?: unknown;
      error?: string;
    }>;
    shutdown: () => Promise<{
      success: boolean;
      result?: boolean;
      error?: string;
    }>;
    getNumExpectedUtxos: () => Promise<{
      success: boolean;
      count?: string;
      error?: string;
    }>;
    upgradeTransaction: (params: { tx_kernel_id: string }) => Promise<{
      success: boolean;
      result?: boolean;
      error?: string;
    }>;
    claimUtxo: (params: {
      utxo_transfer_encrypted: string;
      max_search_depth: number;
    }) => Promise<{
      success: boolean;
      result?: boolean;
      error?: string;
    }>;
    pauseMiner: () => Promise<{
      success: boolean;
      result?: string;
      error?: string;
    }>;
    restartMiner: () => Promise<{
      success: boolean;
      result?: string;
      error?: string;
    }>;
    getCpuTemp: () => Promise<{
      success: boolean;
      temp?: number | null;
      error?: string;
    }>;
    generateWallet: () => Promise<{
      success: boolean;
      result?: unknown;
      error?: string;
    }>;
    exportSeedPhrase: () => Promise<{
      success: boolean;
      seedPhrase?: string;
      error?: string;
    }>;
    importSeedPhrase: (params: { seed_phrase: string }) => Promise<{
      success: boolean;
      result?: unknown;
      error?: string;
    }>;
    whichWallet: () => Promise<{
      success: boolean;
      path?: string;
      error?: string;
    }>;
  };

  // Address book operations
  addressBook: {
    getAll: () => Promise<{
      success: boolean;
      entries?: AddressBookEntry[];
      error?: string;
    }>;
    getById: (id: string) => Promise<{
      success: boolean;
      entry?: AddressBookEntry;
      error?: string;
    }>;
    create: (data: {
      title: string;
      description: string;
      address: string;
    }) => Promise<{
      success: boolean;
      entry?: AddressBookEntry;
      error?: string;
    }>;
    update: (
      id: string,
      data: {
        title?: string;
        description?: string;
        address?: string;
      }
    ) => Promise<{
      success: boolean;
      entry?: AddressBookEntry;
      error?: string;
    }>;
    delete: (id: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
    search: (query: string) => Promise<{
      success: boolean;
      entries?: AddressBookEntry[];
      error?: string;
    }>;
    export: () => Promise<{
      success: boolean;
      json?: string;
      error?: string;
    }>;
    import: (
      json: string,
      merge?: boolean
    ) => Promise<{
      success: boolean;
      count?: number;
      error?: string;
    }>;
    clearAll: () => Promise<{
      success: boolean;
      error?: string;
    }>;
  };

  // Neptune Core settings management
  peer: {
    add: (
      peer: Omit<
        import('../../main/stores/peer-store').PeerEntry,
        'id' | 'addedAt'
      >
    ) => Promise<import('../../main/stores/peer-store').PeerEntry>;
    update: (
      id: string,
      updates: Partial<import('../../main/stores/peer-store').PeerEntry>
    ) => Promise<import('../../main/stores/peer-store').PeerEntry>;
    delete: (id: string) => Promise<void>;
    get: (
      id: string
    ) => Promise<import('../../main/stores/peer-store').PeerEntry | null>;
    getAll: (
      network?: string
    ) => Promise<import('../../main/stores/peer-store').PeerEntry[]>;
    getActive: (
      network?: string
    ) => Promise<import('../../main/stores/peer-store').PeerEntry[]>;
    getBanned: (
      network?: string
    ) => Promise<import('../../main/stores/peer-store').PeerEntry[]>;
    toggle: (id: string, enabled: boolean) => Promise<void>;
    ban: (id: string, reason?: string) => Promise<void>;
    validate: (address: string) => Promise<boolean>;
  };

  // System resource monitoring
  system: {
    getResourceStats: () => Promise<{
      success: boolean;
      stats?: {
        cpu: number;
        memory: number;
        timestamp: number;
      };
      error?: string;
    }>;
    getCombinedStats: () => Promise<{
      success: boolean;
      stats?: {
        system: {
          cpu: number;
          memory: number;
          timestamp: number;
        } | null;
        neptuneCore: {
          pid: number;
          cpu: number;
          memory: number;
          timestamp: number;
        } | null;
        neptuneCli: {
          pid: number;
          cpu: number;
          memory: number;
          timestamp: number;
        } | null;
        totalCpu: number;
        totalMemory: number;
      };
      error?: string;
    }>;
  };

  neptuneCoreSettings: {
    getAll: () => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    updateAll: (
      settings: import('./neptune-core-settings').NeptuneCoreSettings
    ) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    updateNetwork: (
      settings: Partial<import('./neptune-core-settings').NetworkSettings>
    ) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    updateMining: (
      settings: Partial<import('./neptune-core-settings').MiningSettings>
    ) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    updatePerformance: (
      settings: Partial<import('./neptune-core-settings').PerformanceSettings>
    ) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    updateSecurity: (
      settings: Partial<import('./neptune-core-settings').SecuritySettings>
    ) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    updateData: (
      settings: Partial<import('./neptune-core-settings').DataSettings>
    ) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    updateAdvanced: (
      settings: Partial<import('./neptune-core-settings').AdvancedSettings>
    ) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    resetToDefaults: () => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
    export: () => Promise<{
      success: boolean;
      json?: string;
      error?: string;
    }>;
    import: (jsonString: string) => Promise<{
      success: boolean;
      settings?: import('./neptune-core-settings').NeptuneCoreSettings;
      error?: string;
    }>;
  };
}

// Address book entry type
export interface AddressBookEntry {
  id: string;
  title: string;
  description: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// Global window interface extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
