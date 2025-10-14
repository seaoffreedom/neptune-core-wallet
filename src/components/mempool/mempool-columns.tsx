import type { ColumnDef } from "@tanstack/react-table";
import { Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MempoolTransaction } from "@/store/onchain.store";

export const mempoolColumns: ColumnDef<MempoolTransaction>[] = [
    {
        accessorKey: "tx_id",
        header: "Transaction ID",
        cell: ({ row }) => {
            const txId = row.getValue("tx_id") as string;
            const truncatedId =
                txId.length > 20
                    ? `${txId.substring(0, 10)}...${txId.substring(txId.length - 10)}`
                    : txId;

            const handleCopy = async () => {
                try {
                    await navigator.clipboard.writeText(txId);
                } catch (error) {
                    console.error("Failed to copy transaction ID:", error);
                }
            };

            return (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{truncatedId}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopy}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "fee",
        header: "Fee",
        cell: ({ row }) => {
            const fee = row.getValue("fee") as string;
            const feeNum = parseFloat(fee);
            return (
                <div className="text-right">
                    <span className="font-mono text-sm">
                        {feeNum.toFixed(6)} $NPT
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => {
            const size = row.getValue("size") as number;
            const formatSize = (bytes: number): string => {
                if (bytes === 0) return "0 B";
                const k = 1024;
                const sizes = ["B", "KB", "MB"];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
            };

            return (
                <div className="text-right">
                    <span className="text-sm">{formatSize(size)}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => {
            const timestamp = row.getValue("timestamp") as string;
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let timeAgo: string;
            if (diffMins < 1) {
                timeAgo = "Just now";
            } else if (diffMins < 60) {
                timeAgo = `${diffMins}m ago`;
            } else if (diffHours < 24) {
                timeAgo = `${diffHours}h ago`;
            } else if (diffDays < 7) {
                timeAgo = `${diffDays}d ago`;
            } else {
                timeAgo = `${Math.floor(diffDays / 7)}w ago`;
            }

            return (
                <div className="text-right">
                    <div className="text-sm">{timeAgo}</div>
                    <div className="text-xs text-muted-foreground">
                        {date.toLocaleString()}
                    </div>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const txId = row.getValue("tx_id") as string;
            const isOwnTransaction = txId.startsWith("own_");

            return (
                <div className="flex items-center gap-2">
                    {isOwnTransaction && (
                        <Badge variant="secondary" className="text-xs">
                            Your TX
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                            const explorerUrl = `https://neptune.vxb.ai/block?h=${txId}`;
                            window.open(explorerUrl, "_blank");
                        }}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
