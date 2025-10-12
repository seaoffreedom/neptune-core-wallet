import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useOnchainStore } from "@/store/onchain.store";
import {
    CardSkeleton,
    StatsGridSkeleton,
    TableSkeleton,
} from "@/components/ui/skeleton-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Activity,
    Clock,
    TrendingUp,
    Zap,
    Cpu,
    Network,
    RefreshCw,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Play,
    Pause,
    Settings,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { RAMWarningAlert } from "@/components/settings/ram-warning-alert";
import { useMiningEndpoints } from "@/renderer/hooks/use-mining-endpoints";
import { useMiningSettings } from "@/renderer/hooks/use-mining-settings";
import { MiningRoleExplanation } from "@/components/mining/mining-role-explanation";
import { SystemResourceCards } from "@/components/mining/system-resource-cards";

interface MiningData {
    blockDifficulties: Array<[number, number[]]>;
    blockIntervals: Array<[number, number]>;
    cpuTemp: number | null;
    dashboardData: {
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
    } | null;
    syncStatus: {
        connectedPeers: number;
        currentBlockHeight: string;
        isSynced: boolean;
        lastSyncCheck: string;
        latestBlockHash: string;
        pendingTransactions: number;
    } | null;
    networkInfo: {
        blockHeight: string;
        lastUpdated: string;
        network: string;
        tipDigest: string;
    } | null;
}

function MiningPage() {
    const [miningData, setMiningData] = useState<MiningData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMiningActionLoading, setIsMiningActionLoading] = useState(false);
    const [showBlockDifficulties, setShowBlockDifficulties] = useState(false);
    const [showBlockIntervals, setShowBlockIntervals] = useState(false);

    // Get mining state from Zustand store
    const minerStatus = useOnchainStore((state) => state.minerStatus);
    const setMinerStatus = useOnchainStore((state) => state.setMinerStatus);
    const dashboardData = useOnchainStore((state) => state.dashboardData);
    const network = useOnchainStore((state) => state.network);

    // Get mining settings
    const { settings: miningSettings, isLoading: isSettingsLoading } =
        useMiningSettings();

    // Get mining endpoints data from store (only for regtest)
    const bestProposal = useOnchainStore((state) => state.bestProposal);
    const miningResult = useOnchainStore((state) => state.miningResult);
    const powSolutionResult = useOnchainStore(
        (state) => state.powSolutionResult,
    );
    const newTipResult = useOnchainStore((state) => state.newTipResult);

    // Mining endpoints hook (only useful in regtest)
    const {
        getBestProposal,
        mineBlocksToWallet,
        providePowSolution,
        provideNewTip,
    } = useMiningEndpoints();

    // Derive mining state from store
    const isMining = minerStatus === "active";

    // Check if mining flags were used at spawn
    const hasMiningFlags = Boolean(
        miningSettings &&
            (miningSettings.mining.compose || miningSettings.mining.guess),
    );

    const fetchMiningData = useCallback(async () => {
        try {
            setIsRefreshing(true);
            setError(null);

            const [
                blockDifficultiesResult,
                blockIntervalsResult,
                cpuTempResult,
                dashboardResult,
                syncStatusResult,
                networkInfoResult,
            ] = await Promise.all([
                window.electronAPI.blockchain.getBlockDifficulties({
                    block_selector: "Tip",
                    max_num_blocks: 10,
                }),
                window.electronAPI.blockchain.getBlockIntervals({
                    block_selector: "Tip",
                    max_num_blocks: 10,
                }),
                window.electronAPI.blockchain.getCpuTemp(),
                window.electronAPI.blockchain.getDashboardOverview(),
                window.electronAPI.blockchain.getSyncStatus(),
                window.electronAPI.blockchain.getNetworkInfo(),
            ]);

            const newMiningData: MiningData = {
                blockDifficulties: blockDifficultiesResult.success
                    ? blockDifficultiesResult.result || []
                    : [],
                blockIntervals: blockIntervalsResult.success
                    ? blockIntervalsResult.result || []
                    : [],
                cpuTemp: cpuTempResult.success
                    ? (cpuTempResult.temp ?? null)
                    : null,
                dashboardData: dashboardResult.success
                    ? (dashboardResult.data as MiningData["dashboardData"]) ||
                      null
                    : null,
                syncStatus: syncStatusResult.success
                    ? syncStatusResult.result || null
                    : null,
                networkInfo: networkInfoResult.success
                    ? networkInfoResult.result || null
                    : null,
            };

            setMiningData(newMiningData);

            // Initialize mining status from dashboard data only if not already set
            if (
                minerStatus === "unknown" &&
                newMiningData.dashboardData?.mining_status
            ) {
                const status =
                    newMiningData.dashboardData.mining_status.toLowerCase();
                if (status === "active" || status === "running") {
                    setMinerStatus("active");
                } else if (status === "paused" || status === "stopped") {
                    setMinerStatus("paused");
                } else {
                    setMinerStatus("unknown");
                }
            }
        } catch (err) {
            setError((err as Error).message);
            toast.error("Failed to fetch mining data");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [setMinerStatus, minerStatus]);

    useEffect(() => {
        fetchMiningData();
    }, [fetchMiningData]);

    const handlePauseMining = useCallback(async () => {
        try {
            setIsMiningActionLoading(true);
            const result = await window.electronAPI.blockchain.pauseMiner();
            if (result.success) {
                setMinerStatus("paused");
                toast.success("Mining paused", {
                    description: result.result || "Miner paused successfully",
                });
                // Don't refresh dashboard data immediately - let it update naturally
            } else {
                toast.error(`Failed to pause mining: ${result.error}`);
            }
        } catch (err) {
            toast.error(`Failed to pause mining: ${(err as Error).message}`);
        } finally {
            setIsMiningActionLoading(false);
        }
    }, [setMinerStatus]);

    const handleRestartMining = useCallback(async () => {
        try {
            setIsMiningActionLoading(true);
            const result = await window.electronAPI.blockchain.restartMiner();
            if (result.success) {
                setMinerStatus("active");
                toast.success("Mining restarted", {
                    description:
                        result.result || "Miner restarted successfully",
                });
                // Don't refresh dashboard data immediately - let it update naturally
            } else {
                toast.error(`Failed to restart mining: ${result.error}`);
            }
        } catch (err) {
            toast.error(`Failed to restart mining: ${(err as Error).message}`);
        } finally {
            setIsMiningActionLoading(false);
        }
    }, [setMinerStatus]);

    const formatTimeAgo = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMs / 3600000);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffMs / 86400000);
        return `${diffDays}d ago`;
    };

    const formatInterval = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const formatDifficulty = (difficulty: number[]): string => {
        if (difficulty.length === 0) return "0";
        return difficulty[0].toLocaleString();
    };

    if (isLoading || isSettingsLoading) {
        return (
            <PageContainer>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h3 className="text-2xl font-bold">Mining Dashboard</h3>
                        <p className="text-muted-foreground">
                            Monitor network mining statistics and performance.
                        </p>
                    </div>

                    {/* Loading skeletons that match the actual content structure */}
                    <StatsGridSkeleton
                        items={6}
                        className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    />

                    {/* Block difficulties skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="h-6 w-40 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-muted/30 animate-pulse rounded-full border border-muted/20" />
                                            <div className="space-y-2">
                                                <div className="h-4 w-20 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                                <div className="h-3 w-32 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                            </div>
                                        </div>
                                        <div className="h-6 w-16 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Block intervals skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="h-6 w-40 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-muted/30 animate-pulse rounded-full border border-muted/20" />
                                            <div className="space-y-2">
                                                <div className="h-4 w-20 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                                <div className="h-3 w-32 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                            </div>
                                        </div>
                                        <div className="h-6 w-16 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold">Mining Dashboard</h3>
                        <p className="text-muted-foreground">
                            Monitor network mining statistics and performance.
                        </p>
                    </div>
                    <Card>
                        <CardContent className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Failed to load mining data
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {error}
                                </p>
                                <Button onClick={fetchMiningData}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Mining Dashboard</h3>
                        <p className="text-muted-foreground">
                            Monitor your mining role, settings, and network
                            performance in Neptune's three-step mining process.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Mining Controls */}
                        <div className="flex items-center gap-2">
                            {hasMiningFlags ? (
                                // Mining flags enabled - can start/pause
                                <Button
                                    variant={
                                        isMining ? "destructive" : "default"
                                    }
                                    onClick={
                                        isMining
                                            ? handlePauseMining
                                            : handleRestartMining
                                    }
                                    disabled={isMiningActionLoading}
                                    size="sm"
                                >
                                    {isMiningActionLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : isMining ? (
                                        <Pause className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Play className="mr-2 h-4 w-4" />
                                    )}
                                    {isMining ? "Pause Mining" : "Start Mining"}
                                </Button>
                            ) : (
                                // No mining flags - restart required
                                <Button variant="outline" disabled size="sm">
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Restart Required
                                </Button>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={fetchMiningData}
                            disabled={isRefreshing}
                            size="sm"
                        >
                            {isRefreshing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* RAM Warning Alert */}
                <RAMWarningAlert />

                {/* Mining Flags Alert */}
                {!hasMiningFlags && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Mining Not Enabled</AlertTitle>
                        <AlertDescription>
                            To enable mining, you need to restart Neptune Core
                            with mining flags (--compose, --guess, or
                            --tx-proof-upgrading). Current mining settings
                            cannot be changed at runtime.
                        </AlertDescription>
                    </Alert>
                )}

                {/* System Resource Cards */}
                <SystemResourceCards />

                {/* Mining Role Explanation */}
                {miningSettings && (
                    <MiningRoleExplanation
                        settings={miningSettings}
                        network={network}
                        isMining={isMining}
                        hasMiningFlags={hasMiningFlags}
                    />
                )}

                {/* Advanced Mining Endpoints - Only show on regtest */}
                {miningData?.networkInfo?.network === "regtest" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Advanced Mining Features (Regtest Only)
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Network:{" "}
                                <span className="font-mono capitalize">
                                    {miningData?.networkInfo?.network ||
                                        "Unknown"}
                                </span>
                                <span className="ml-2 text-green-600 dark:text-green-400">
                                    (Mining endpoints enabled)
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Best Proposal */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">
                                                Best Mining Proposal
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Get the current best mining
                                                proposal
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={getBestProposal}
                                        >
                                            <Activity className="mr-2 h-4 w-4" />
                                            Get Proposal
                                        </Button>
                                    </div>
                                    {bestProposal && (
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm font-mono break-all">
                                                {JSON.stringify(
                                                    bestProposal.proposal,
                                                    null,
                                                    2,
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Last updated:{" "}
                                                {new Date(
                                                    bestProposal.lastUpdated,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Mine Blocks to Wallet */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">
                                                Mine Blocks (Test)
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Mine blocks to wallet for
                                                testing
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                mineBlocksToWallet(1)
                                            }
                                        >
                                            <Zap className="mr-2 h-4 w-4" />
                                            Mine 1 Block
                                        </Button>
                                    </div>
                                    {miningResult && (
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm font-mono">
                                                {miningResult.result}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Last updated:{" "}
                                                {new Date(
                                                    miningResult.lastUpdated,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* PoW Solution */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">
                                                PoW Solution
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Provide proof-of-work solution
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                providePowSolution({}, {})
                                            }
                                            disabled
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Provide PoW
                                        </Button>
                                    </div>
                                    {powSolutionResult && (
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm">
                                                Status:{" "}
                                                {powSolutionResult.success
                                                    ? "Accepted"
                                                    : "Rejected"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Last updated:{" "}
                                                {new Date(
                                                    powSolutionResult.lastUpdated,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* New Tip */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">
                                                New Block Tip
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Provide new block tip
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                provideNewTip({}, {})
                                            }
                                            disabled
                                        >
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Provide Tip
                                        </Button>
                                    </div>
                                    {newTipResult && (
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm">
                                                Status:{" "}
                                                {newTipResult.accepted
                                                    ? "Accepted"
                                                    : "Rejected"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Last updated:{" "}
                                                {new Date(
                                                    newTipResult.lastUpdated,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Block Difficulties */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recent Block Difficulties
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {miningData?.blockDifficulties &&
                        miningData.blockDifficulties.length > 0 ? (
                            <>
                                {/* Main Display with Fade Effect */}
                                <div className="relative">
                                    <div className="space-y-3">
                                        {miningData.blockDifficulties
                                            .slice(
                                                0,
                                                showBlockDifficulties
                                                    ? undefined
                                                    : 3,
                                            )
                                            .map(
                                                (
                                                    [height, difficulty],
                                                    index,
                                                ) => (
                                                    <div
                                                        key={height}
                                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                                {height}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    Block{" "}
                                                                    {height}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Difficulty:{" "}
                                                                    {formatDifficulty(
                                                                        difficulty,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {index === 0
                                                                ? "Latest"
                                                                : `${index + 1} ago`}
                                                        </Badge>
                                                    </div>
                                                ),
                                            )}
                                    </div>

                                    {/* Fade Effect - Only show when truncated */}
                                    {!showBlockDifficulties &&
                                        miningData.blockDifficulties.length >
                                            3 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background/80 to-transparent rounded-b-lg pointer-events-none" />
                                        )}
                                </div>

                                {/* Show All / Show Less Button */}
                                {miningData.blockDifficulties.length > 3 && (
                                    <div className="flex justify-center mt-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setShowBlockDifficulties(
                                                    !showBlockDifficulties,
                                                )
                                            }
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showBlockDifficulties ? (
                                                <>
                                                    <ChevronUp className="mr-2 h-4 w-4" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="mr-2 h-4 w-4" />
                                                    Show All (
                                                    {
                                                        miningData
                                                            .blockDifficulties
                                                            .length
                                                    }{" "}
                                                    blocks)
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No difficulty data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Block Intervals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Block Intervals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {miningData?.blockIntervals &&
                        miningData.blockIntervals.length > 0 ? (
                            <>
                                {/* Main Display with Fade Effect */}
                                <div className="relative">
                                    <div className="space-y-3">
                                        {miningData.blockIntervals
                                            .slice(
                                                0,
                                                showBlockIntervals
                                                    ? undefined
                                                    : 3,
                                            )
                                            .map(
                                                ([height, interval], index) => (
                                                    <div
                                                        key={height}
                                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                                {height}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    Block{" "}
                                                                    {height}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Interval:{" "}
                                                                    {formatInterval(
                                                                        interval,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {index === 0
                                                                ? "Latest"
                                                                : `${index + 1} ago`}
                                                        </Badge>
                                                    </div>
                                                ),
                                            )}
                                    </div>

                                    {/* Fade Effect - Only show when truncated */}
                                    {!showBlockIntervals &&
                                        miningData.blockIntervals.length >
                                            3 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background/80 to-transparent rounded-b-lg pointer-events-none" />
                                        )}
                                </div>

                                {/* Show All / Show Less Button */}
                                {miningData.blockIntervals.length > 3 && (
                                    <div className="flex justify-center mt-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setShowBlockIntervals(
                                                    !showBlockIntervals,
                                                )
                                            }
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showBlockIntervals ? (
                                                <>
                                                    <ChevronUp className="mr-2 h-4 w-4" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="mr-2 h-4 w-4" />
                                                    Show All (
                                                    {
                                                        miningData
                                                            .blockIntervals
                                                            .length
                                                    }{" "}
                                                    blocks)
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No interval data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/mining")({
    component: MiningPage,
});
