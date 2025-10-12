import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import {
    CardSkeleton,
    StatsGridSkeleton,
    TableSkeleton,
} from "@/components/ui/skeleton-enhanced";
import {
    UTXOEmpty,
    UTXOSummaryCard,
    UTXOTable,
    utxoColumns,
} from "@/components/utxos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, RefreshCw } from "lucide-react";
import { useUtxos } from "@/renderer/hooks/use-onchain-data";

function UTXOsPage() {
    // Get UTXO data (fetched globally via auto-polling)
    const { utxos, isRefreshing, calculateSummary, fetchUtxos } = useUtxos();

    // Determine if we're in initial loading state
    const isInitialLoading = isRefreshing && utxos.length === 0;

    // Calculate summary
    const summary = calculateSummary();

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h3 className="text-2xl font-bold">UTXOs & Coins</h3>
                    <p className="text-muted-foreground">
                        Manage your unspent transaction outputs and wallet
                        coins.
                    </p>
                </div>

                {isInitialLoading ? (
                    // Loading skeletons that match the actual content structure
                    <>
                        {/* Summary skeleton */}
                        <div className="rounded-md border p-6">
                            <div className="space-y-4">
                                <div className="h-5 w-32 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <StatsGridSkeleton items={4} />
                            </div>
                        </div>

                        {/* Table skeleton */}
                        <div className="space-y-4">
                            <div className="h-10 w-full max-w-sm bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                            <TableSkeleton rows={5} columns={5} />
                            {/* Pagination skeleton */}
                            <div className="flex items-center justify-end space-x-2">
                                <div className="h-9 w-20 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <div className="h-9 w-20 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                            </div>
                        </div>
                    </>
                ) : utxos.length === 0 ? (
                    // Empty state
                    <UTXOEmpty />
                ) : (
                    // Data display
                    <>
                        {/* Summary Card */}
                        <UTXOSummaryCard summary={summary} />

                        {/* UTXO Table */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="flex items-center gap-2">
                                            <Coins className="h-5 w-5" />
                                            UTXOs & Coins
                                        </CardTitle>
                                        <Badge variant="secondary">
                                            {utxos.length}{" "}
                                            {utxos.length === 1
                                                ? "coin"
                                                : "coins"}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchUtxos}
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                                        />
                                        Refresh
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Manage your unspent transaction outputs and
                                    wallet coins.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <UTXOTable columns={utxoColumns} data={utxos} />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/utxos")({
    component: UTXOsPage,
});
