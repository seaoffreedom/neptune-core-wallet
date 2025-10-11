/**
 * Balance Card Component
 *
 * Displays enhanced balance information with confirmed/unconfirmed breakdown
 */

import { CheckCircle, Clock, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceCardProps {
    confirmedBalance: string | null;
    unconfirmedBalance: string | null;
    mempoolTxCount: number;
    dashboardData?: {
        confirmed_available_balance: string;
        confirmed_total_balance: string;
        unconfirmed_available_balance: string;
        unconfirmed_total_balance: string;
    } | null;
    isLoading?: boolean;
}

export function BalanceCard({
    confirmedBalance,
    unconfirmedBalance,
    mempoolTxCount,
    dashboardData,
    isLoading = false,
}: BalanceCardProps) {
    // Parse balances - use detailed dashboard data if available, fallback to basic data
    const confirmedAvailable = dashboardData
        ? parseFloat(dashboardData.confirmed_available_balance)
        : confirmedBalance
          ? parseFloat(confirmedBalance)
          : 0;
    const confirmedTotal = dashboardData
        ? parseFloat(dashboardData.confirmed_total_balance)
        : confirmedBalance
          ? parseFloat(confirmedBalance)
          : 0;
    const unconfirmedAvailable = dashboardData
        ? parseFloat(dashboardData.unconfirmed_available_balance)
        : unconfirmedBalance
          ? parseFloat(unconfirmedBalance)
          : 0;
    const unconfirmedTotal = dashboardData
        ? parseFloat(dashboardData.unconfirmed_total_balance)
        : unconfirmedBalance
          ? parseFloat(unconfirmedBalance)
          : 0;

    const pendingAmount = unconfirmedAvailable - confirmedAvailable;
    const hasPending = Math.abs(pendingAmount) > 0.00001; // Account for floating point
    const hasLocked = Math.abs(confirmedTotal - confirmedAvailable) > 0.00001;

    // Format to 2 decimal places
    const formatBalance = (amount: number): string => {
        return amount.toFixed(2);
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-48" />
                    <div className="pt-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Total Balance
                    </h3>
                    <div className="flex items-center gap-1">
                        {hasPending ? (
                            <Clock className="h-4 w-4 text-warning" />
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                    </div>
                </div>

                {/* Primary Balance Display - Compact */}
                <div className="space-y-2">
                    <div className="text-3xl font-bold font-mono text-primary">
                        {formatBalance(confirmedAvailable)} $NPT
                    </div>

                    {/* Balance Variants Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {/* Confirmed Available */}
                        <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-muted-foreground">
                                    Available
                                </span>
                            </div>
                            <span className="font-mono font-medium">
                                {formatBalance(confirmedAvailable)} $NPT
                            </span>
                        </div>

                        {/* Confirmed Total (if different) */}
                        {hasLocked ? (
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Total
                                    </span>
                                </div>
                                <span className="font-mono font-medium">
                                    {formatBalance(confirmedTotal)} $NPT
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span className="text-muted-foreground">
                                        Total
                                    </span>
                                </div>
                                <span className="font-mono font-medium">
                                    {formatBalance(confirmedTotal)} $NPT
                                </span>
                            </div>
                        )}

                        {/* Pending Available */}
                        <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-warning" />
                                <span className="text-muted-foreground">
                                    Pending
                                </span>
                            </div>
                            <span className="font-mono font-medium text-warning">
                                {pendingAmount > 0 ? "+" : ""}
                                {formatBalance(pendingAmount)} $NPT
                            </span>
                        </div>

                        {/* Total After Confirmation */}
                        <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-2">
                                <Info className="h-3 w-3 text-primary" />
                                <span className="text-muted-foreground">
                                    After Confirm
                                </span>
                            </div>
                            <span className="font-mono font-medium text-primary">
                                {formatBalance(unconfirmedAvailable)} $NPT
                            </span>
                        </div>
                    </div>
                </div>

                {/* Transaction Count Info */}
                {mempoolTxCount > 0 && (
                    <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                                {mempoolTxCount}{" "}
                                {mempoolTxCount === 1
                                    ? "transaction"
                                    : "transactions"}{" "}
                                pending confirmation
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
