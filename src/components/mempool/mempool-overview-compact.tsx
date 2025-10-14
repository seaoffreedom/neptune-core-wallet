import {
    ArrowRight,
    Clock,
    Copy,
    Database,
    ExternalLink,
    HelpCircle,
    Radio,
    RefreshCw,
    Shield,
    Trash2,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MempoolTransaction } from "@/store/onchain.store";

interface MempoolOverviewCompactProps {
    transactions: MempoolTransaction[];
    totalCount: number;
    totalSize: number;
    ownCount: number;
    lastUpdated: string | null;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function MempoolOverviewCompact({
    transactions,
    totalCount,
    totalSize,
    ownCount,
    lastUpdated,
    onRefresh,
    isRefreshing,
}: MempoolOverviewCompactProps) {
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    // Helper function to get proof type information with detailed waiting status
    const getProofTypeInfo = (proofType: string, synced: boolean = false) => {
        switch (proofType) {
            case "PrimitiveWitness":
                return {
                    name: "Primitive Witness",
                    description:
                        "Initial transaction with secret keys. Cannot be shared - contains sensitive information.",
                    icon: Shield,
                    color: "bg-red-100 text-red-800 border-red-200",
                    status: "Draft",
                    waitingFor: synced
                        ? "Ready for proof generation"
                        : "Waiting for network sync",
                    canUpdate: true,
                    fee: "Lowest",
                    requirements: "Local device only",
                    nextStep: "Generate proof collection or single proof",
                };
            case "ProofCollection":
                return {
                    name: "Proof Collection",
                    description:
                        "Cryptographic proofs for standard devices. Requires third-party upgrading (≥0.05 NPT fee).",
                    icon: Zap,
                    color: "bg-orange-100 text-orange-800 border-orange-200",
                    status: "Ready for upgrading",
                    waitingFor: synced
                        ? "Waiting for proof upgrader to process"
                        : "Waiting for network sync before upgrading",
                    canUpdate: false,
                    fee: "Higher (≥0.05 NPT)",
                    requirements: "Most devices",
                    nextStep: "Proof upgrader converts to single proof",
                };
            case "SingleProof":
                return {
                    name: "Single Proof",
                    description:
                        "Final optimized proof for powerful devices. Direct block inclusion capability.",
                    icon: Database,
                    color: "bg-green-100 text-green-800 border-green-200",
                    status: "Ready for blocks",
                    waitingFor: synced
                        ? "Waiting for composer to include in block"
                        : "Waiting for network sync before composition",
                    canUpdate: true,
                    fee: "Lowest",
                    requirements: "64GB+ RAM",
                    nextStep: "Composer includes in next block",
                };
            default:
                return {
                    name: "Unknown",
                    description: "Unknown proof type",
                    icon: HelpCircle,
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    status: "Unknown",
                    waitingFor: "Status unknown",
                    canUpdate: false,
                    fee: "Unknown",
                    requirements: "Unknown",
                    nextStep: "Unknown",
                };
        }
    };
    const formatSize = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
    };

    const formatTimeAgo = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${Math.floor(diffDays / 7)}w ago`;
    };

    const truncateId = (id: string): string => {
        return id.length > 16
            ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}`
            : id;
    };

    const handleCopyTxId = async (txId: string) => {
        try {
            await navigator.clipboard.writeText(txId);
            showSuccessToast("Transaction ID copied to clipboard");
        } catch (error) {
            console.error("Failed to copy transaction ID:", error);
            showErrorToast("Failed to copy transaction ID");
        }
    };

    const handleBroadcastAll = async () => {
        setIsBroadcasting(true);
        try {
            const result =
                await window.electronAPI.blockchain.broadcastAllMempoolTxs();
            if (result.success) {
                showSuccessToast(
                    "All mempool transactions broadcasted successfully",
                    {
                        description:
                            result.result ||
                            "Transactions have been sent to the network",
                    },
                );
                onRefresh(); // Refresh data after broadcasting
            } else {
                showErrorToast("Failed to broadcast transactions", {
                    description: result.error || "Unknown error occurred",
                });
            }
        } catch (error) {
            showErrorToast("Error broadcasting transactions", {
                description: (error as Error).message,
            });
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleClearMempool = async () => {
        setIsClearing(true);
        try {
            const result = await window.electronAPI.blockchain.clearMempool();
            if (result.success) {
                showSuccessToast("Mempool cleared successfully", {
                    description:
                        result.result ||
                        "All transactions removed from mempool",
                });
                onRefresh(); // Refresh data after clearing
            } else {
                showErrorToast("Failed to clear mempool", {
                    description: result.error || "Unknown error occurred",
                });
            }
        } catch (error) {
            showErrorToast("Error clearing mempool", {
                description: (error as Error).message,
            });
        } finally {
            setIsClearing(false);
        }
    };

    // Show only recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Database className="h-5 w-5" />
                        Mempool Activity
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBroadcastAll}
                            disabled={isBroadcasting || totalCount === 0}
                        >
                            <Radio
                                className={`mr-2 h-4 w-4 ${isBroadcasting ? "animate-pulse" : ""}`}
                            />
                            {isBroadcasting
                                ? "Broadcasting..."
                                : "Broadcast All"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearMempool}
                            disabled={isClearing || totalCount === 0}
                        >
                            <Trash2
                                className={`mr-2 h-4 w-4 ${isClearing ? "animate-pulse" : ""}`}
                            />
                            {isClearing ? "Clearing..." : "Clear All"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Transaction Proof Lifecycle */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4" />
                            Transaction Proof Lifecycle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm overflow-x-auto">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Badge variant="secondary" className="text-xs">
                                    1
                                </Badge>
                                <span className="font-medium">
                                    Primitive Witness
                                </span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Badge variant="secondary" className="text-xs">
                                    2
                                </Badge>
                                <span className="font-medium">
                                    Proof Collection
                                </span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Badge variant="secondary" className="text-xs">
                                    3
                                </Badge>
                                <span className="font-medium">
                                    Single Proof
                                </span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Badge variant="secondary" className="text-xs">
                                    4
                                </Badge>
                                <span className="font-medium">Block Proof</span>
                            </div>
                        </div>

                        <Separator />
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            {totalCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Total TXs
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">
                            {ownCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Your TXs
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">
                            {formatSize(totalSize)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Size
                        </div>
                    </div>
                </div>

                {/* Enhanced Transaction Type Breakdown */}
                {transactions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">
                            Transaction Types in Mempool
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                "PrimitiveWitness",
                                "ProofCollection",
                                "SingleProof",
                            ].map((type) => {
                                const count = transactions.filter(
                                    (tx) => tx.proof_type === type,
                                ).length;
                                if (count === 0) return null;

                                const typeInfo = getProofTypeInfo(type);
                                const IconComponent = typeInfo.icon;

                                return (
                                    <div
                                        key={type}
                                        className="flex items-center justify-between p-2 rounded-lg border bg-muted/30"
                                    >
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="h-4 w-4" />
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {typeInfo.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {typeInfo.status} •{" "}
                                                    {typeInfo.fee} fees
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {count}
                                            </Badge>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {typeInfo.name}
                                                            </div>
                                                            <div className="text-xs">
                                                                {
                                                                    typeInfo.description
                                                                }
                                                            </div>
                                                            <div className="text-xs">
                                                                <strong>
                                                                    Requirements:
                                                                </strong>{" "}
                                                                {
                                                                    typeInfo.requirements
                                                                }
                                                            </div>
                                                            <div className="text-xs">
                                                                <strong>
                                                                    Can Update:
                                                                </strong>{" "}
                                                                {typeInfo.canUpdate
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {lastUpdated && (
                    <div className="text-xs text-muted-foreground text-center">
                        Last updated: {formatTimeAgo(lastUpdated)}
                    </div>
                )}

                <Separator />

                {/* Recent Transactions */}
                {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                                Recent Transactions
                            </h4>
                            {transactions.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{transactions.length - 5} more
                                </Badge>
                            )}
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            #
                                        </TableHead>
                                        <TableHead>Transaction ID</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                Proof Type
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            <div className="space-y-1">
                                                                <div className="font-medium">
                                                                    Transaction
                                                                    Proof Types
                                                                </div>
                                                                <div className="text-xs">
                                                                    <strong>
                                                                        Primitive
                                                                        Witness:
                                                                    </strong>{" "}
                                                                    Draft
                                                                    transaction
                                                                    (local only)
                                                                </div>
                                                                <div className="text-xs">
                                                                    <strong>
                                                                        Proof
                                                                        Collection:
                                                                    </strong>{" "}
                                                                    Ready for
                                                                    upgrading
                                                                    (higher
                                                                    fees)
                                                                </div>
                                                                <div className="text-xs">
                                                                    <strong>
                                                                        Single
                                                                        Proof:
                                                                    </strong>{" "}
                                                                    Ready for
                                                                    blocks
                                                                    (lowest
                                                                    fees)
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableHead>
                                        <TableHead>Structure</TableHead>
                                        <TableHead>Fee</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Balance Effect</TableHead>
                                        <TableHead className="w-20">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((tx, index) => {
                                        // Defensive programming - ensure tx has required properties
                                        if (!tx || typeof tx !== "object") {
                                            console.warn(
                                                "Invalid transaction data:",
                                                tx,
                                            );
                                            return null;
                                        }

                                        const isOwn =
                                            tx.id?.startsWith("own_") || false;
                                        const fee = parseFloat(tx.fee || "0");
                                        const positiveEffect = parseFloat(
                                            tx.positive_balance_effect || "0",
                                        );
                                        const negativeEffect = parseFloat(
                                            tx.negative_balance_effect || "0",
                                        );

                                        // Get proof type color
                                        const getProofTypeColor = (
                                            type: string,
                                        ) => {
                                            switch (type) {
                                                case "PrimitiveWitness":
                                                    return "bg-purple-100 text-purple-800 border-purple-200";
                                                case "SingleProof":
                                                    return "bg-blue-100 text-blue-800 border-blue-200";
                                                case "ProofCollection":
                                                    return "bg-green-100 text-green-800 border-green-200";
                                                default:
                                                    return "bg-gray-100 text-gray-800 border-gray-200";
                                            }
                                        };

                                        return (
                                            <TableRow
                                                key={tx.id}
                                                className="group hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {index + 1}
                                                        </span>
                                                        {isOwn && (
                                                            <Badge
                                                                variant="default"
                                                                className="text-xs px-1 py-0 h-4 bg-orange-500 hover:bg-orange-600"
                                                            >
                                                                Own
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-32">
                                                            {truncateId(tx.id)}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() =>
                                                                handleCopyTxId(
                                                                    tx.id,
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs px-2 py-1 ${getProofTypeColor(tx.proof_type || "Unknown")}`}
                                                                >
                                                                    {tx.proof_type ||
                                                                        "Unknown"}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-sm">
                                                                <div className="space-y-2">
                                                                    <div className="font-medium">
                                                                        {
                                                                            getProofTypeInfo(
                                                                                tx.proof_type ||
                                                                                    "Unknown",
                                                                                tx.synced,
                                                                            )
                                                                                .name
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        {
                                                                            getProofTypeInfo(
                                                                                tx.proof_type ||
                                                                                    "Unknown",
                                                                                tx.synced,
                                                                            )
                                                                                .description
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        <strong>
                                                                            Current
                                                                            Status:
                                                                        </strong>{" "}
                                                                        {
                                                                            getProofTypeInfo(
                                                                                tx.proof_type ||
                                                                                    "Unknown",
                                                                                tx.synced,
                                                                            )
                                                                                .status
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        <strong>
                                                                            Waiting
                                                                            For:
                                                                        </strong>{" "}
                                                                        {
                                                                            getProofTypeInfo(
                                                                                tx.proof_type ||
                                                                                    "Unknown",
                                                                                tx.synced,
                                                                            )
                                                                                .waitingFor
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        <strong>
                                                                            Next
                                                                            Step:
                                                                        </strong>{" "}
                                                                        {
                                                                            getProofTypeInfo(
                                                                                tx.proof_type ||
                                                                                    "Unknown",
                                                                                tx.synced,
                                                                            )
                                                                                .nextStep
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        <strong>
                                                                            Fee
                                                                            Level:
                                                                        </strong>{" "}
                                                                        {
                                                                            getProofTypeInfo(
                                                                                tx.proof_type ||
                                                                                    "Unknown",
                                                                                tx.synced,
                                                                            )
                                                                                .fee
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        <strong>
                                                                            Requirements:
                                                                        </strong>{" "}
                                                                        {
                                                                            getProofTypeInfo(
                                                                                tx.proof_type ||
                                                                                    "Unknown",
                                                                                tx.synced,
                                                                            )
                                                                                .requirements
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {tx.num_inputs || 0} →{" "}
                                                    {tx.num_outputs || 0}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-blue-600">
                                                    {fee.toFixed(6)} $NPT
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            tx.synced === true
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${
                                                                tx.synced ===
                                                                true
                                                                    ? "bg-green-500"
                                                                    : "bg-yellow-500"
                                                            }`}
                                                        />
                                                        {tx.synced === true
                                                            ? "Synced"
                                                            : "Pending"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {(positiveEffect > 0 ||
                                                        negativeEffect > 0) && (
                                                        <div className="space-y-1">
                                                            {positiveEffect >
                                                                0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                    <span className="font-mono text-green-600 text-xs">
                                                                        +
                                                                        {positiveEffect.toFixed(
                                                                            2,
                                                                        )}{" "}
                                                                        $NPT
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {negativeEffect >
                                                                0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                    <span className="font-mono text-red-600 text-xs">
                                                                        -
                                                                        {negativeEffect.toFixed(
                                                                            2,
                                                                        )}{" "}
                                                                        $NPT
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                console.log(
                                                                    "View transaction details:",
                                                                    tx.id,
                                                                );
                                                            }}
                                                            title="View transaction details"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                        {isOwn && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600 hover:text-orange-700"
                                                                onClick={() => {
                                                                    console.log(
                                                                        "Broadcast individual transaction:",
                                                                        tx.id,
                                                                    );
                                                                    showInfoToast(
                                                                        "Individual transaction broadcast not yet implemented",
                                                                    );
                                                                }}
                                                                title="Broadcast this transaction"
                                                            >
                                                                <Radio className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No pending transactions</p>
                        <p className="text-xs">Mempool is empty</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
