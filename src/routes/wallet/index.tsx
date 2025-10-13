import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { BalanceCard, QuickActions } from "@/components/wallet";
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton-enhanced";
import { MempoolOverviewCompact } from "@/components/mempool";
import { useOnchainStore } from "@/store/onchain.store";
import {
    useMempoolInfo,
    useDashboardData,
} from "@/renderer/hooks/use-onchain-data";

function WalletOverview() {
    // Get data from Zustand store
    const dashboardData = useOnchainStore((state) => state.dashboardData);
    const confirmedBalance = useOnchainStore((state) => state.confirmedBalance);
    const unconfirmedBalance = useOnchainStore(
        (state) => state.unconfirmedBalance,
    );
    const blockHeight = useOnchainStore((state) => state.blockHeight);

    // Get mempool data
    const {
        data: dashboardDataMempool,
        isRefreshing: isDashboardRefreshing,
        fetchDashboard,
    } = useDashboardData();

    const {
        overview,
        isRefreshing: isMempoolRefreshing,
        fetchMempoolOverview,
    } = useMempoolInfo();

    const isLoading = !dashboardData;
    const isMempoolLoading = isDashboardRefreshing || isMempoolRefreshing;

    // Use dashboard data for consistency
    const txCount = dashboardData?.mempool_total_tx_count || 0;
    const size = dashboardData?.mempool_size || 0;
    const ownTxCount = dashboardData?.mempool_own_tx_count || 0;

    // Calculate mempool summary
    const mempoolSummary = {
        totalTransactions: txCount,
        totalSize: size,
        ownTransactions: ownTxCount,
        lastUpdated: overview?.lastUpdated || null,
    };

    // Fetch mempool overview data on mount
    useEffect(() => {
        fetchMempoolOverview();
    }, [fetchMempoolOverview]);

    // Enhanced refresh function with toast feedback
    const handleMempoolRefresh = async () => {
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
                    <h3 className="text-2xl font-bold">Wallet Overview</h3>
                    <p className="text-muted-foreground">
                        Your complete wallet dashboard at a glance.
                    </p>
                </div>

                {isLoading ? (
                    // Loading skeletons that match the actual content structure
                    <>
                        {/* Balance Card Skeleton */}
                        <CardSkeleton />

                        {/* Recent Activity Skeleton */}
                        <div className="rounded-md border p-6">
                            <div className="space-y-4">
                                <div className="h-5 w-32 bg-muted/30 animate-pulse rounded-md border border-muted/20" />
                                <TableSkeleton rows={5} columns={4} />
                            </div>
                        </div>
                    </>
                ) : (
                    // Actual content
                    <>
                        {/* Balance Card */}
                        <BalanceCard
                            confirmedBalance={confirmedBalance}
                            unconfirmedBalance={unconfirmedBalance}
                            mempoolTxCount={
                                dashboardData?.mempool_own_tx_count || 0
                            }
                            dashboardData={dashboardData}
                            isLoading={false}
                        />

                        {/* Mempool Section */}
                        <MempoolOverviewCompact
                            transactions={overview?.transactions || []}
                            totalCount={txCount}
                            totalSize={size}
                            ownCount={ownTxCount}
                            lastUpdated={overview?.lastUpdated || null}
                            onRefresh={handleMempoolRefresh}
                            isRefreshing={isMempoolLoading}
                        />

                    </>
                )}

                {/* Quick Actions */}
                {/* <QuickActions /> */}
            </div>
        </PageContainer>
    );
}

export const Route = createFileRoute("/wallet/")({
    component: WalletOverview,
});
