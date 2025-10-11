/**
 * Transaction Table Column Definitions
 *
 * Defines the columns for the transaction history data table
 */

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TransactionHistoryItem } from "@/store/onchain.store";

// Extended transaction interface for table display
export interface Transaction extends TransactionHistoryItem {
    // TransactionHistoryItem has: digest, height, timestamp, amount
    type: "sent" | "received"; // Derived from amount sign
    status: "confirmed" | "pending" | "failed"; // Derived from confirmations
}

export const transactionColumns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "timestamp",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const timestamp = row.getValue("timestamp") as string;
            // Timestamp is in milliseconds as a string from RPC
            const timestampMs = parseInt(timestamp, 10);
            if (Number.isNaN(timestampMs))
                return <div className="font-medium">Invalid date</div>;

            const date = new Date(timestampMs);
            return (
                <div className="font-medium">
                    {date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <Badge
                    variant={type === "received" ? "default" : "secondary"}
                    className="capitalize"
                >
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
            }).format(amount);
            return <div className="font-mono">{formatted} $NPT</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variant =
                status === "confirmed"
                    ? "default"
                    : status === "pending"
                      ? "secondary"
                      : "destructive";
            return (
                <Badge variant={variant} className="capitalize">
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "digest",
        header: "Transaction ID",
        cell: ({ row }) => {
            const digest = row.getValue("digest") as string;
            return (
                <div className="font-mono text-sm text-muted-foreground">
                    {digest.substring(0, 8)}...
                    {digest.substring(digest.length - 6)}
                </div>
            );
        },
    },
    {
        accessorKey: "height",
        header: "Block",
        cell: ({ row }) => {
            const height = row.getValue("height") as string;
            return <div className="font-mono text-sm">{height}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const transaction = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    transaction.digest,
                                )
                            }
                        >
                            Copy transaction ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>View on explorer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
