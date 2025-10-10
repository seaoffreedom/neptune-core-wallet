import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import {
    UTXOTable,
    UTXOSummaryCard,
    UTXOEmpty,
    utxoColumns,
} from "@/components/utxos";
import { useUtxos } from "@/renderer/hooks/use-onchain-data";

function UTXOsPage() {
    // Get UTXO data (fetched globally via auto-polling)
    const { utxos, isRefreshing, calculateSummary } = useUtxos();

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
                    // Loading skeletons
                    <>
                        {/* Summary skeleton */}
                        <div className="rounded-md border p-6">
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-32" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-8 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Table skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full max-w-sm" />
                            <div className="rounded-md border">
                                <div className="p-4 space-y-4">
                                    {/* Table header */}
                                    <div className="flex gap-4">
                                        <Skeleton className="h-8 flex-1" />
                                        <Skeleton className="h-8 w-32" />
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                    {/* Table rows */}
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex gap-4">
                                            <Skeleton className="h-12 flex-1" />
                                            <Skeleton className="h-12 w-32" />
                                            <Skeleton className="h-12 w-24" />
                                            <Skeleton className="h-12 w-24" />
                                            <Skeleton className="h-12 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Pagination skeleton */}
                            <div className="flex items-center justify-end space-x-2">
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-20" />
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
                        <UTXOTable columns={utxoColumns} data={utxos} />
                    </>
                )}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/utxos")({
    component: UTXOsPage,
});
