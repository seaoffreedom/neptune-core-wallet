/**
 * Recent Activity Component
 *
 * Displays the last 5 transactions with status indicators
 */

import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TransactionHistoryItem } from "@/store/onchain.store";

interface RecentActivityProps {
    transactions: TransactionHistoryItem[];
    blockHeight: string | null;
    confirmations: string | undefined;
    isLoading?: boolean;
}

export function RecentActivity({
    transactions,
    blockHeight,
    confirmations,
    isLoading = false,
}: RecentActivityProps) {
    const formatBalance = (amount: string): string => {
        const num = parseFloat(amount);
        return num.toFixed(2);
    };

    const formatTimeAgo = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${Math.floor(diffDays / 7)}w ago`;
    };

    const getStatus = (
        txBlockHeight: string,
    ): "confirmed" | "pending" | "failed" => {
        if (!blockHeight) return "pending";
        const txHeight = parseInt(txBlockHeight, 10);
        const currentHeight = parseInt(blockHeight, 10);
        const txConfirmations = currentHeight - txHeight;
        const requiredConfirmations = confirmations
            ? parseInt(confirmations, 10)
            : 6;

        return txConfirmations >= requiredConfirmations
            ? "confirmed"
            : "pending";
    };

    if (isLoading) {
        return (
            <Card className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-2"
                            >
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    const recentTxs = transactions.slice(0, 5);

    return (
        <Card className="p-4">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Recent Activity</h3>
                    <Link
                        to="/wallet/history"
                        as
                        any
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                        View All
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {/* Transactions List */}
                {recentTxs.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No transactions yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentTxs.map((tx) => {
                            const amount = parseFloat(tx.amount);
                            const type: "sent" | "received" =
                                amount < 0 ? "sent" : "received";
                            const status = getStatus(tx.height);

                            return (
                                <div
                                    key={tx.digest}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                                >
                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center",
                                            type === "received"
                                                ? "bg-green-500/10"
                                                : "bg-blue-500/10",
                                        )}
                                    >
                                        {type === "received" ? (
                                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium capitalize">
                                                {type}
                                            </span>
                                            <Badge
                                                variant={
                                                    status === "confirmed"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className="h-5 text-xs"
                                            >
                                                {status === "confirmed" ? (
                                                    "✓"
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatTimeAgo(tx.timestamp)}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div
                                        className={cn(
                                            "text-sm font-mono font-semibold",
                                            type === "received"
                                                ? "text-green-500"
                                                : "text-foreground",
                                        )}
                                    >
                                        {type === "received" ? "+" : ""}
                                        {formatBalance(tx.amount)} NPT
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
}
