import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import {
    type Transaction,
    TransactionEmpty,
    TransactionTable,
} from "@/components/transactions";
import { TableSkeleton } from "@/components/ui/skeleton-enhanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionHistory } from "@/renderer/hooks/use-onchain-data";
import { useOnchainStore } from "@/store/onchain.store";
import { useMemo } from "react";

function TransactionHistory() {
    // Get transaction history (fetched globally via auto-polling)
    const { history, isRefreshing, fetchHistory } = useTransactionHistory();
    const blockHeight = useOnchainStore((state) => state.blockHeight);
    const confirmations = useOnchainStore(
        (state) => state.dashboardData?.confirmations,
    );

    // Determine if we're in initial loading state (no data yet and currently loading)
    const isInitialLoading = isRefreshing && history.length === 0;

    // Transform TransactionHistoryItem to Transaction for the table
    // Use useMemo to prevent unnecessary re-renders that reset pagination
    const transactions: Transaction[] = useMemo(() => {
        return history.map((item) => {
            // Determine type based on amount (negative = sent, positive = received)
            const amount = parseFloat(item.amount);
            const type: "sent" | "received" = amount < 0 ? "sent" : "received";

            // Determine status based on confirmations
            // If height exists and we have current block height, calculate confirmations
            let status: "confirmed" | "pending" | "failed" = "pending";
            if (blockHeight && item.height) {
                const txHeight = parseInt(item.height, 10);
                const currentHeight = parseInt(blockHeight, 10);
                const txConfirmations = currentHeight - txHeight;
                const requiredConfirmations = confirmations
                    ? parseInt(confirmations, 10)
                    : 6;

                status =
                    txConfirmations >= requiredConfirmations
                        ? "confirmed"
                        : "pending";
            }

            return {
                ...item,
                type,
                status,
            };
        });
    }, [history, blockHeight, confirmations]);

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold">Transaction History</h3>
                    <p className="text-muted-foreground">
                        View your complete transaction history and activity.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Transaction History
                                </CardTitle>
                                <Badge variant="secondary">
                                    {transactions.length} transactions
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchHistory}
                                disabled={isRefreshing}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                                />
                                Refresh
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Complete history of all your Neptune transactions.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {isInitialLoading ? (
                            <TableSkeleton rows={5} columns={4} />
                        ) : transactions.length === 0 ? (
                            <TransactionEmpty />
                        ) : (
                            <TransactionTable data={transactions} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/history")({
    component: TransactionHistory,
});
