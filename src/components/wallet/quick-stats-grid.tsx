/**
 * Quick Stats Grid Component
 *
 * Displays 4 stat cards: UTXOs, Pending Txs, Mempool, Network
 */

import {
    Coins,
    Clock,
    Activity,
    Wifi,
    WifiOff,
    CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface QuickStatsGridProps {
    // UTXO stats
    utxoCount: number | null;
    utxoTotalValue: number | null;

    // Pending transactions
    pendingTxCount: number;
    pendingAmount: number;

    // Mempool stats
    mempoolTxCount: number | null;
    mempoolSize: number | null;

    // Network stats
    isSynced: boolean;
    peerCount: number;
    blockHeight: string | null;

    isLoading?: boolean;
}

export function QuickStatsGrid({
    utxoCount,
    utxoTotalValue,
    pendingTxCount,
    pendingAmount,
    mempoolTxCount,
    mempoolSize,
    isSynced,
    peerCount,
    blockHeight,
    isLoading = false,
}: QuickStatsGridProps) {
    const formatBalance = (amount: number): string => {
        return amount.toFixed(2);
    };

    const formatBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* UTXO Stats */}
            <Card className="p-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Coins className="h-4 w-4" />
                        <span className="text-sm font-medium">UTXOs</span>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">
                            {utxoCount !== null ? utxoCount : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                            {utxoTotalValue !== null
                                ? `${formatBalance(utxoTotalValue)} NPT`
                                : "Loading..."}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Pending Transactions */}
            <Card className="p-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Pending</span>
                    </div>
                    <div className="space-y-1">
                        <div
                            className={cn(
                                "text-2xl font-bold",
                                pendingTxCount > 0 && "text-warning",
                            )}
                        >
                            {pendingTxCount}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                            {pendingAmount !== 0
                                ? `${pendingAmount > 0 ? "+" : ""}${formatBalance(pendingAmount)} NPT`
                                : "No pending txs"}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Mempool Stats */}
            <Card className="p-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm font-medium">Mempool</span>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">
                            {mempoolTxCount !== null ? mempoolTxCount : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {mempoolSize !== null
                                ? formatBytes(mempoolSize)
                                : "Loading..."}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Network Stats */}
            <Card className="p-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {isSynced && peerCount > 0 ? (
                            <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                            <WifiOff className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm font-medium">Network</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold">
                                {peerCount}
                            </div>
                            {isSynced && peerCount > 0 && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {isSynced && peerCount > 0
                                ? `Synced • Block ${blockHeight || "—"}`
                                : "Not synced"}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
