/**
 * Wallet Sidebar Content
 *
 * Displays wallet-specific navigation and information in the slidebar
 */

import { Link, useLocation } from "@tanstack/react-router";
import {
    BookUser,
    Coins,
    History,
    LayoutDashboard,
    Network,
    QrCode,
    Send,
    Zap,
} from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    useCurrentDifficulty,
    useUtxos,
} from "@/renderer/hooks/use-onchain-data";
import { useOnchainStore } from "@/store/onchain.store";
import { useUIStore } from "@/store/ui.store";

export function WalletSidebar() {
    const location = useLocation();
    const dashboardData = useOnchainStore((state) => state.dashboardData);
    const confirmedBalance = useOnchainStore((state) => state.confirmedBalance);
    const unconfirmedBalance = useOnchainStore(
        (state) => state.unconfirmedBalance,
    );
    const network = useOnchainStore((state) => state.network);
    const blockHeight = useOnchainStore((state) => state.blockHeight);
    const peerInfo = useOnchainStore((state) => state.peerInfo);
    const experimentalMode = useUIStore((state) => state.experimentalMode);

    // Get UTXO data
    const { utxos, fetchUtxos } = useUtxos();

    // Get difficulty data
    const { difficulty, fetchDifficulty } = useCurrentDifficulty();

    // Fetch UTXOs and difficulty on mount
    useEffect(() => {
        fetchUtxos();
        fetchDifficulty();
    }, [fetchUtxos, fetchDifficulty]);

    const isLoading = !dashboardData;

    // Format balance to 2 decimal places
    const formatBalance = (balance: string | null): string => {
        if (!balance) return "0.00";
        const num = parseFloat(balance);
        return num.toFixed(2);
    };

    // Calculate pending amount
    const confirmed = confirmedBalance ? parseFloat(confirmedBalance) : 0;
    const unconfirmed = unconfirmedBalance ? parseFloat(unconfirmedBalance) : 0;
    const pendingAmount = unconfirmed - confirmed;
    const hasPending = Math.abs(pendingAmount) > 0.00001;

    // Navigation items for wallet sub-routes
    const walletNavItems = [
        { icon: LayoutDashboard, label: "Overview", href: "/wallet" },
        { icon: Send, label: "Send Funds", href: "/wallet/send" },
        { icon: QrCode, label: "Receive", href: "/wallet/receive" },
        {
            icon: History,
            label: "Transaction History",
            href: "/wallet/history",
        },
        { icon: Coins, label: "UTXOs & Coins", href: "/wallet/utxos" },
        { icon: BookUser, label: "Address Book", href: "/wallet/address-book" },
        { icon: Network, label: "Peer Manager", href: "/wallet/peers" },
        // Only show mining button when experimental mode is enabled
        ...(experimentalMode
            ? [
                  {
                      icon: Zap,
                      label: "Mining",
                      href: "/wallet/mining",
                      badge: "Experiment",
                  },
              ]
            : []),
    ];
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4">
                <h2 className="text-lg font-semibold">Wallet</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your Neptune funds
                </p>
            </div>

            <Separator />

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                        {/* Quick Stats */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Quick Stats
                            </h3>
                            <div className="space-y-1">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Available
                                        </span>
                                        {isLoading ? (
                                            <Skeleton className="h-4 w-24" />
                                        ) : (
                                            <span className="font-mono">
                                                {formatBalance(
                                                    confirmedBalance,
                                                )}{" "}
                                                $NPT
                                            </span>
                                        )}
                                    </div>
                                    {!isLoading && confirmedBalance && (
                                        <div className="flex justify-end">
                                            <PriceDisplay
                                                nptAmount={parseFloat(
                                                    confirmedBalance,
                                                )}
                                                isLoading={isLoading}
                                            />
                                        </div>
                                    )}
                                </div>
                                {hasPending && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Pending
                                            </span>
                                            {isLoading ? (
                                                <Skeleton className="h-4 w-24" />
                                            ) : (
                                                <span className="font-mono text-warning">
                                                    {pendingAmount > 0
                                                        ? "+"
                                                        : ""}
                                                    {formatBalance(
                                                        pendingAmount.toString(),
                                                    )}{" "}
                                                    $NPT
                                                    <span className="text-xs ml-1">
                                                        (
                                                        {dashboardData?.mempool_own_tx_count ||
                                                            0}{" "}
                                                        tx
                                                        {dashboardData?.mempool_own_tx_count !==
                                                        1
                                                            ? "s"
                                                            : ""}
                                                        )
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        {!isLoading && pendingAmount !== 0 && (
                                            <div className="flex justify-end">
                                                <PriceDisplay
                                                    nptAmount={Math.abs(
                                                        pendingAmount,
                                                    )}
                                                    isLoading={isLoading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        UTXOs
                                    </span>
                                    {utxos.length === 0 ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : (
                                        <span className="font-mono">
                                            {utxos.length}{" "}
                                            {utxos.length === 1
                                                ? "coin"
                                                : "coins"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Actions
                            </h3>
                            <div className="space-y-1">
                                {walletNavItems.map((item) => {
                                    const isActive =
                                        location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            className={cn(
                                                "w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md transition-colors",
                                                isActive
                                                    ? "bg-accent text-accent-foreground"
                                                    : "hover:bg-accent/50",
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    "h-4 w-4",
                                                    isActive
                                                        ? "text-accent-foreground"
                                                        : "text-muted-foreground",
                                                )}
                                            />
                                            <span className="flex-1">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <Separator />

                        {/* Recent Transactions */}
                        {/* <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Recent Activity
                            </h3>
                            <div className="space-y-2">
                                {isLoading ? (
                                    // Skeleton loaders
                                    [1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="p-2 rounded-md border"
                                        >
                                            <div className="flex justify-between mb-1">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    ))
                                ) : (
                                    // Placeholder for now - will connect to real tx data later
                                    <div className="p-2 rounded-md border text-sm text-center text-muted-foreground">
                                        No recent transactions
                                    </div>
                                )}
                            </div>
                        </div> */}

                        <Separator />

                        {/* Network Info */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Network
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Network
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : (
                                        <span className="capitalize">
                                            {network || "Unknown"}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Block Height
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : (
                                        <span className="font-mono">
                                            {blockHeight || "0"}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Peers
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-12" />
                                    ) : (
                                        <span>
                                            {dashboardData?.peer_count ||
                                                peerInfo.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Difficulty
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : (
                                        <span className="font-mono text-xs">
                                            {difficulty
                                                ? difficulty.toLocaleString()
                                                : "-"}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Tip Hash
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : (
                                        <span className="font-mono text-xs">
                                            {dashboardData?.tip_digest
                                                ? `${dashboardData.tip_digest.slice(0, 8)}...`
                                                : "-"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
