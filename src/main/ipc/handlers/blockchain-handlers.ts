/**
 * Blockchain Data IPC Handlers
 *
 * Handles IPC communication for fetching blockchain data via HTTP JSON-RPC
 */

import { ipcMain } from "electron";
import { neptuneRpcService } from "@/main/services/neptune-rpc.service";
import { IPC_CHANNELS } from "@/shared/constants/ipc-channels";

/**
 * Register blockchain data handlers
 */
export function registerBlockchainHandlers(): void {
    // Set RPC cookie for authenticated requests
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_SET_COOKIE,
        async (_event, cookie: string) => {
            try {
                neptuneRpcService.setCookie(cookie);
                return { success: true };
            } catch (error) {
                console.error("Failed to set RPC cookie:", error);
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get dashboard overview data
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_DASHBOARD, async () => {
        try {
            const data = await neptuneRpcService.getDashboardOverview();
            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error("Failed to get dashboard data:", error);
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get block height
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_HEIGHT, async () => {
        try {
            const height = await neptuneRpcService.getBlockHeight();
            return {
                success: true,
                height,
            };
        } catch (error) {
            console.error("Failed to get block height:", error);
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get network
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_NETWORK, async () => {
        try {
            const network = await neptuneRpcService.getNetwork();
            return {
                success: true,
                network,
            };
        } catch (error) {
            console.error("Failed to get network:", error);
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get wallet status
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_WALLET_STATUS, async () => {
        try {
            const status = await neptuneRpcService.getWalletStatus();
            return {
                success: true,
                status,
            };
        } catch (error) {
            console.error("Failed to get wallet status:", error);
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get next receiving address
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_NEXT_ADDRESS, async () => {
        try {
            const address = await neptuneRpcService.getNextReceivingAddress();
            return {
                success: true,
                address,
            };
        } catch (error) {
            console.error("Failed to get next address:", error);
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get transaction history
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_HISTORY, async () => {
        try {
            const history = await neptuneRpcService.getHistory();
            return {
                success: true,
                history,
            };
        } catch (error) {
            console.error("Failed to get history:", error);
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // ========================================================================
    // Tier 1: Additional Critical Endpoints
    // ========================================================================

    // Get confirmations
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_CONFIRMATIONS, async () => {
        try {
            const confirmations = await neptuneRpcService.getConfirmations();
            return { success: true, confirmations };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // List own coins
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_LIST_OWN_COINS, async () => {
        try {
            const coins = await neptuneRpcService.listOwnCoins();
            return { success: true, coins };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Send transaction
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_SEND,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.send(
                    params as Parameters<typeof neptuneRpcService.send>[0],
                );
                return { success: true, txId: result.tx_id };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Send transparent transaction
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_SEND_TRANSPARENT,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.sendTransparent(
                    params as Parameters<
                        typeof neptuneRpcService.sendTransparent
                    >[0],
                );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get mempool transaction count
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_COUNT, async () => {
        try {
            const count = await neptuneRpcService.getMempoolTxCount();
            return { success: true, count };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get mempool size
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_SIZE, async () => {
        try {
            const size = await neptuneRpcService.getMempoolSize();
            return { success: true, size };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // ========================================================================
    // Tier 2: Important Endpoints
    // ========================================================================

    // List UTXOs
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_LIST_UTXOS, async () => {
        try {
            const utxos = await neptuneRpcService.listUtxos();
            return { success: true, utxos };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get spendable inputs
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_SPENDABLE_INPUTS, async () => {
        try {
            const inputs = await neptuneRpcService.getSpendableInputs();
            return { success: true, inputs };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Select spendable inputs
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_SELECT_SPENDABLE_INPUTS,
        async (_event, params: unknown) => {
            try {
                const inputs = await neptuneRpcService.selectSpendableInputs(
                    params as Parameters<
                        typeof neptuneRpcService.selectSpendableInputs
                    >[0],
                );
                return { success: true, inputs };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get mempool transaction IDs
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_IDS, async () => {
        try {
            const txIds = await neptuneRpcService.getMempoolTxIds();
            return { success: true, txIds };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Broadcast all mempool transactions
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_BROADCAST_ALL_MEMPOOL_TXS,
        async () => {
            try {
                const result = await neptuneRpcService.broadcastAllMempoolTxs();
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Clear mempool
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_CLEAR_MEMPOOL, async () => {
        try {
            const result = await neptuneRpcService.clearMempool();
            return { success: true, result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get mempool transaction kernel
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_KERNEL,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.getMempoolTxKernel(
                    params as Parameters<
                        typeof neptuneRpcService.getMempoolTxKernel
                    >[0],
                );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get sync status
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_SYNC_STATUS, async () => {
        try {
            const result = await neptuneRpcService.getSyncStatus();
            return { success: true, result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get network information
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_NETWORK_INFO, async () => {
        try {
            const result = await neptuneRpcService.getNetworkInfo();
            return { success: true, ...result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get peer information
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_PEER_INFO, async () => {
        try {
            const result = await neptuneRpcService.getPeerInfo();
            return { success: true, peers: result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get total balance
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_BALANCE, async () => {
        try {
            const result = await neptuneRpcService.getBalance();
            return {
                success: true,
                confirmed: result.confirmed,
                unconfirmed: result.unconfirmed,
                lastUpdated: result.lastUpdated,
            };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get block difficulties
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_DIFFICULTIES,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.getBlockDifficulties(
                    params as Parameters<
                        typeof neptuneRpcService.getBlockDifficulties
                    >[0],
                );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get block intervals
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_INTERVALS,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.getBlockIntervals(
                    params as Parameters<
                        typeof neptuneRpcService.getBlockIntervals
                    >[0],
                );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Validate address
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_VALIDATE_ADDRESS,
        async (_event, params: unknown) => {
            try {
                const isValid = await neptuneRpcService.validateAddress(
                    params as Parameters<
                        typeof neptuneRpcService.validateAddress
                    >[0],
                );
                return { success: true, isValid };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Validate amount
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_VALIDATE_AMOUNT,
        async (_event, params: unknown) => {
            try {
                const isValid = await neptuneRpcService.validateAmount(
                    params as Parameters<
                        typeof neptuneRpcService.validateAmount
                    >[0],
                );
                return { success: true, isValid };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get nth receiving address
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_GET_NTH_ADDRESS,
        async (_event, params: unknown) => {
            try {
                const address = await neptuneRpcService.getNthReceivingAddress(
                    params as Parameters<
                        typeof neptuneRpcService.getNthReceivingAddress
                    >[0],
                );
                return { success: true, address };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get block digest
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_DIGEST,
        async (_event, params: unknown) => {
            try {
                const digest = await neptuneRpcService.getBlockDigest(
                    params as Parameters<
                        typeof neptuneRpcService.getBlockDigest
                    >[0],
                );
                return { success: true, digest };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get latest tip digests
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_GET_LATEST_TIP_DIGESTS,
        async (_event, params: unknown) => {
            try {
                const digests = await neptuneRpcService.getLatestTipDigests(
                    params as Parameters<
                        typeof neptuneRpcService.getLatestTipDigests
                    >[0],
                );
                return { success: true, digests };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get own instance ID
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_INSTANCE_ID, async () => {
        try {
            const instanceId = await neptuneRpcService.getOwnInstanceId();
            return { success: true, instanceId };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Shutdown neptune-core
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_SHUTDOWN, async () => {
        try {
            const result = await neptuneRpcService.shutdown();
            return { success: true, result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get number of expected UTXOs
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_NUM_EXPECTED_UTXOS, async () => {
        try {
            const count = await neptuneRpcService.getNumExpectedUtxos();
            return { success: true, count };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Upgrade transaction
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_UPGRADE_TRANSACTION,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.upgradeTransaction(
                    params as Parameters<
                        typeof neptuneRpcService.upgradeTransaction
                    >[0],
                );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Claim UTXO
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_CLAIM_UTXO,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.claimUtxo(
                    params as Parameters<typeof neptuneRpcService.claimUtxo>[0],
                );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // ========================================================================
    // Tier 3: Advanced Endpoints
    // ========================================================================

    // Pause miner
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_PAUSE_MINER, async () => {
        try {
            const result = await neptuneRpcService.pauseMiner();
            return { success: true, result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Restart miner
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_RESTART_MINER, async () => {
        try {
            const result = await neptuneRpcService.restartMiner();
            return { success: true, result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get CPU temperature
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GET_CPU_TEMP, async () => {
        try {
            const temp = await neptuneRpcService.getCpuTemp();
            return { success: true, temp };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Generate wallet
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_GENERATE_WALLET, async () => {
        try {
            const result = await neptuneRpcService.generateWallet();
            return { success: true, result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Export seed phrase
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_EXPORT_SEED, async () => {
        try {
            const seedPhrase = await neptuneRpcService.exportSeedPhrase();
            return { success: true, seedPhrase };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Import seed phrase
    ipcMain.handle(
        IPC_CHANNELS.BLOCKCHAIN_IMPORT_SEED,
        async (_event, params: unknown) => {
            try {
                const result = await neptuneRpcService.importSeedPhrase(
                    params as Parameters<
                        typeof neptuneRpcService.importSeedPhrase
                    >[0],
                );
                return { success: true, result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Get wallet path
    ipcMain.handle(IPC_CHANNELS.BLOCKCHAIN_WHICH_WALLET, async () => {
        try {
            const path = await neptuneRpcService.whichWallet();
            return { success: true, path };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    console.log("✅ All blockchain data handlers registered (40 endpoints)");
}

/**
 * Unregister blockchain data handlers
 */
export function unregisterBlockchainHandlers(): void {
    // Tier 1: Critical
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_SET_COOKIE);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_DASHBOARD);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_HEIGHT);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_NETWORK);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_WALLET_STATUS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_NEXT_ADDRESS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_HISTORY);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_CONFIRMATIONS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_LIST_OWN_COINS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_SEND);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_SEND_TRANSPARENT);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_COUNT);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_SIZE);

    // Tier 2: Important
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_LIST_UTXOS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_SPENDABLE_INPUTS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_SELECT_SPENDABLE_INPUTS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_IDS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_BROADCAST_ALL_MEMPOOL_TXS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_CLEAR_MEMPOOL);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_MEMPOOL_TX_KERNEL);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_SYNC_STATUS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_NETWORK_INFO);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_PEER_INFO);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_BALANCE);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_DIFFICULTIES);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_INTERVALS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_VALIDATE_ADDRESS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_VALIDATE_AMOUNT);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_NTH_ADDRESS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_BLOCK_DIGEST);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_LATEST_TIP_DIGESTS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_INSTANCE_ID);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_SHUTDOWN);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_NUM_EXPECTED_UTXOS);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_UPGRADE_TRANSACTION);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_CLAIM_UTXO);

    // Tier 3: Advanced
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_PAUSE_MINER);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_RESTART_MINER);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GET_CPU_TEMP);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_GENERATE_WALLET);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_EXPORT_SEED);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_IMPORT_SEED);
    ipcMain.removeHandler(IPC_CHANNELS.BLOCKCHAIN_WHICH_WALLET);

    console.log("✅ All blockchain data handlers unregistered (40 endpoints)");
}
