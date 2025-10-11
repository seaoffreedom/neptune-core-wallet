import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import {
    CardSkeleton,
    StatsGridSkeleton,
    TableSkeleton,
} from "@/components/ui/skeleton-enhanced";
import {
    MempoolEmpty,
    MempoolTable,
    MempoolManagement,
    mempoolColumns,
} from "@/components/mempool";
import {
    useMempoolInfo,
    useDashboardData,
} from "@/renderer/hooks/use-onchain-data";

function MempoolPage() {
    // Get dashboard data (includes mempool info)
    const {
        data: dashboardData,
        isRefreshing: isDashboardRefreshing,
        fetchDashboard,
    } = useDashboardData();

    // Get detailed mempool data for the table
    const {
        overview,
        isRefreshing: isMempoolRefreshing,
        fetchMempoolOverview,
    } = useMempoolInfo();

    // Use dashboard data for consistency with sidebar
    const txCount = dashboardData?.mempool_total_tx_count || 0;
    const size = dashboardData?.mempool_size || 0;
    const ownTxCount = dashboardData?.mempool_own_tx_count || 0;
    const isRefreshing = isDashboardRefreshing || isMempoolRefreshing;

    // Determine if we're in initial loading state
    const isInitialLoading = isRefreshing && !dashboardData && !overview;

    // Calculate summary
    const summary = {
        totalTransactions: txCount,
        totalSize: size,
        ownTransactions: ownTxCount,
        lastUpdated: overview?.lastUpdated || null,
    };

    // Debug logging
    console.log("MempoolPage Debug:", {
        txCount,
        size,
        ownTxCount,
        overview,
        isInitialLoading,
        isRefreshing,
        dashboardData: dashboardData ? "exists" : "null",
        overviewTransactions: overview?.transactions?.length || 0,
    });

    // Fetch mempool overview data on mount
    useEffect(() => {
        console.log("MempoolPage: Calling fetchMempoolOverview on mount");
        fetchMempoolOverview();
    }, [fetchMempoolOverview]);

    // Enhanced refresh function with toast feedback
    const handleRefresh = async () => {
        try {
            await Promise.all([fetchDashboard(), fetchMempoolOverview()]);
            toast.success("Mempool data refreshed successfully");
        } catch (error) {
            toast.error("Failed to refresh mempool data", {
                description: (error as Error).message,
            });
        }
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h3 className="text-2xl font-bold">Mempool</h3>
                    <p className="text-muted-foreground">
                        View pending transactions waiting to be included in the
                        next block.
                    </p>
                </div>

                {isInitialLoading ? (
                    // Loading skeletons that match the actual content structure
                    <>
                        {/* Summary skeleton */}
                        <div className="rounded-md border p-6 bg-primary/2">
                            <div className="space-y-4">
                                <div className="h-5 w-32 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <StatsGridSkeleton items={4} />
                            </div>
                        </div>

                        {/* Management skeleton */}
                        <div className="rounded-md border p-4">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-24 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <div className="flex gap-2">
                                    <div className="h-9 w-24 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                    <div className="h-9 w-24 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                </div>
                            </div>
                        </div>

                        {/* Table skeleton */}
                        <TableSkeleton rows={5} columns={5} />
                    </>
                ) : txCount === 0 || !overview?.transactions?.length ? (
                    // Empty state with management
                    <>
                        <MempoolEmpty />
                        <MempoolManagement
                            txCount={txCount}
                            onRefresh={handleRefresh}
                            isRefreshing={isRefreshing}
                        />
                    </>
                ) : (
                    // Data display with consolidated overview
                    <>
                        {/* Consolidated Overview */}
                        <div className="rounded-md border p-6 bg-primary/2">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">
                                    Mempool Overview
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Total Transactions
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {summary.totalTransactions.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Pending in mempool
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Mempool Size
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {summary.totalSize === 0
                                                ? "0 B"
                                                : summary.totalSize < 1024
                                                  ? `${summary.totalSize} B`
                                                  : summary.totalSize <
                                                      1024 * 1024
                                                    ? `${(summary.totalSize / 1024).toFixed(1)} KB`
                                                    : `${(summary.totalSize / (1024 * 1024)).toFixed(1)} MB`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Memory usage
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Your Transactions
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {summary.ownTransactions.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            From this wallet
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Last Updated
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {summary.lastUpdated
                                                ? (() => {
                                                      const date = new Date(
                                                          summary.lastUpdated,
                                                      );
                                                      const now = new Date();
                                                      const diffMs =
                                                          now.getTime() -
                                                          date.getTime();
                                                      const diffMins =
                                                          Math.floor(
                                                              diffMs / 60000,
                                                          );
                                                      if (diffMins < 1)
                                                          return "Just now";
                                                      if (diffMins < 60)
                                                          return `${diffMins}m ago`;
                                                      const diffHours =
                                                          Math.floor(
                                                              diffMs / 3600000,
                                                          );
                                                      if (diffHours < 24)
                                                          return `${diffHours}h ago`;
                                                      const diffDays =
                                                          Math.floor(
                                                              diffMs / 86400000,
                                                          );
                                                      return `${diffDays}d ago`;
                                                  })()
                                                : "--"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Data freshness
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Management Actions */}
                        <MempoolManagement
                            txCount={txCount}
                            onRefresh={handleRefresh}
                            isRefreshing={isRefreshing}
                        />

                        {/* Mempool Table */}
                        <MempoolTable
                            columns={mempoolColumns}
                            data={overview.transactions || []}
                            onRefresh={handleRefresh}
                            isRefreshing={isRefreshing}
                        />
                    </>
                )}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/mempool")({
    component: MempoolPage,
});
