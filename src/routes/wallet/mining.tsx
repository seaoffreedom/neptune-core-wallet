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
} from "lucide-react";
import { toast } from "sonner";
import { RAMWarningAlert } from "@/components/settings/ram-warning-alert";

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

    // Get mining state from Zustand store
    const minerStatus = useOnchainStore((state) => state.minerStatus);
    const setMinerStatus = useOnchainStore((state) => state.setMinerStatus);
    const dashboardData = useOnchainStore((state) => state.dashboardData);

    // Derive mining state from store
    const isMining = minerStatus === "active";

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

    if (isLoading) {
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
                            Monitor network mining statistics and performance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Mining Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isMining ? "destructive" : "default"}
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

                {/* Comprehensive Blockchain Status */}
                {miningData?.dashboardData && (
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Blockchain Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Network
                                    </p>
                                    <p className="font-mono text-sm capitalize">
                                        {miningData.networkInfo?.network ||
                                            "Unknown"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Synchronizing
                                    </p>
                                    <p className="font-mono text-sm">
                                        {miningData.dashboardData.syncing
                                            ? "true"
                                            : "false"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Mining Status
                                    </p>
                                    <p className="font-mono text-sm capitalize">
                                        {isMining ? "active" : "inactive"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Block Height
                                    </p>
                                    <p className="font-mono text-sm">
                                        {
                                            miningData.dashboardData.tip_header
                                                .height
                                        }
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Block Interval
                                    </p>
                                    <p className="font-mono text-sm">
                                        {miningData.blockIntervals.length > 0
                                            ? `${miningData.blockIntervals[0][1]}s`
                                            : "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Difficulty
                                    </p>
                                    <p className="font-mono text-sm">
                                        {miningData.blockDifficulties.length > 0
                                            ? miningData.blockDifficulties[0][1][0]?.toLocaleString() ||
                                              "-"
                                            : "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Connected Peers
                                    </p>
                                    <p className="font-mono text-sm">
                                        {miningData.dashboardData.peer_count}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Latest Block
                                    </p>
                                    <p className="font-mono text-xs">
                                        {new Date(
                                            miningData.dashboardData.tip_header
                                                .timestamp * 1000,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Tip Hash
                                </p>
                                <p className="font-mono text-xs break-all">
                                    {miningData.dashboardData.tip_digest}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Network Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Network className="h-4 w-4" />
                                Network Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                                {miningData?.syncStatus?.isSynced ? (
                                    <>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-medium">
                                            Synced
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                                        <span className="text-sm font-medium">
                                            Syncing
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-2xl font-bold">
                                {miningData?.syncStatus?.currentBlockHeight ||
                                    "--"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Block Height
                            </p>
                        </CardContent>
                    </Card>

                    {/* Connected Peers */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Connected Peers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {miningData?.syncStatus?.connectedPeers || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active connections
                            </p>
                            {miningData?.syncStatus?.connectedPeers &&
                                miningData.syncStatus.connectedPeers > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="mt-2 text-xs"
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Connected
                                    </Badge>
                                )}
                        </CardContent>
                    </Card>

                    {/* CPU Temperature */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Cpu className="h-4 w-4" />
                                CPU Temperature
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {miningData?.cpuTemp
                                    ? `${miningData.cpuTemp.toFixed(1)}°C`
                                    : "--"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Hardware monitoring
                            </p>
                            {miningData?.cpuTemp && (
                                <div className="mt-2">
                                    <Progress
                                        value={Math.min(
                                            (miningData.cpuTemp / 80) * 100,
                                            100,
                                        )}
                                        className="h-2"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Network Type */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Network Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">
                                {miningData?.networkInfo?.network || "--"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Blockchain network
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pending Transactions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Pending Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {miningData?.syncStatus?.pendingTransactions ||
                                    0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                In mempool
                            </p>
                            {miningData?.syncStatus?.pendingTransactions &&
                                miningData.syncStatus.pendingTransactions >
                                    0 && (
                                    <Badge
                                        variant="outline"
                                        className="mt-2 text-xs"
                                    >
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                )}
                        </CardContent>
                    </Card>

                    {/* Last Updated */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Last Updated
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {miningData?.syncStatus?.lastSyncCheck
                                    ? formatTimeAgo(
                                          miningData.syncStatus.lastSyncCheck,
                                      )
                                    : "--"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Data freshness
                            </p>
                        </CardContent>
                    </Card>
                </div>

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
                            <div className="space-y-3">
                                {miningData.blockDifficulties
                                    .slice(0, 5)
                                    .map(([height, difficulty], index) => (
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
                                                        Block {height}
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
                                    ))}
                            </div>
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
                            <div className="space-y-3">
                                {miningData.blockIntervals
                                    .slice(0, 5)
                                    .map(([height, interval], index) => (
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
                                                        Block {height}
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
                                    ))}
                            </div>
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
