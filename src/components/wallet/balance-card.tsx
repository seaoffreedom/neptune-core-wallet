/**
 * Balance Card Component
 *
 * Displays enhanced balance information with confirmed/unconfirmed breakdown
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Info, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
    confirmedBalance: string | null;
    unconfirmedBalance: string | null;
    mempoolTxCount: number;
    isLoading?: boolean;
}

export function BalanceCard({
    confirmedBalance,
    unconfirmedBalance,
    mempoolTxCount,
    isLoading = false,
}: BalanceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Parse balances
    const confirmed = confirmedBalance ? parseFloat(confirmedBalance) : 0;
    const unconfirmed = unconfirmedBalance ? parseFloat(unconfirmedBalance) : 0;
    const pendingAmount = unconfirmed - confirmed;
    const hasPending = Math.abs(pendingAmount) > 0.00001; // Account for floating point

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
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Clock className="h-4 w-4 text-warning" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You have pending transactions</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                    </div>
                </div>

                {/* Primary Balance Display */}
                <div className="space-y-1">
                    <div className="text-4xl font-bold font-mono">
                        {formatBalance(confirmed)} NPT
                    </div>
                    {hasPending && (
                        <div className="text-sm text-warning">
                            {pendingAmount > 0 ? "+" : ""}
                            {formatBalance(pendingAmount)} NPT pending
                        </div>
                    )}
                </div>

                {/* Expandable Details */}
                {hasPending && (
                    <>
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span>{isExpanded ? "Hide" : "Show"} details</span>
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>

                        {isExpanded && (
                            <div className="pt-4 border-t space-y-3">
                                {/* Confirmed Balance */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <div>
                                            <div className="text-sm font-medium">
                                                Confirmed Available
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Ready to spend
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-mono font-semibold">
                                        {formatBalance(confirmed)} NPT
                                    </div>
                                </div>

                                {/* Pending Balance */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-warning" />
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <div className="text-sm font-medium text-warning">
                                                    Pending (Unconfirmed)
                                                </div>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">
                                                                Pending
                                                                transactions are
                                                                waiting for
                                                                network
                                                                confirmation.
                                                                They will be
                                                                available once
                                                                confirmed.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {mempoolTxCount}{" "}
                                                {mempoolTxCount === 1
                                                    ? "transaction"
                                                    : "transactions"}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            "text-sm font-mono font-semibold",
                                            pendingAmount > 0
                                                ? "text-green-500"
                                                : "text-warning",
                                        )}
                                    >
                                        {pendingAmount > 0 ? "+" : ""}
                                        {formatBalance(pendingAmount)} NPT
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-dashed" />

                                {/* Total After Confirmation */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                        Total After Confirmation
                                    </div>
                                    <div className="text-lg font-mono font-bold">
                                        {formatBalance(unconfirmed)} NPT
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
