/**
 * UTXO Table Columns
 *
 * Column definitions for the UTXO data table
 */

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { UTXO } from "@/store/onchain.store";

export const utxoColumns: ColumnDef<UTXO>[] = [
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
            return (
                <div className="font-mono font-semibold">
                    {amount.toFixed(2)} NPT
                </div>
            );
        },
        sortingFn: (rowA, rowB) => {
            const amountA = parseFloat(rowA.getValue("amount"));
            const amountB = parseFloat(rowB.getValue("amount"));
            return amountA - amountB;
        },
    },
    {
        accessorKey: "confirmed",
        header: "Status",
        cell: ({ row }) => {
            const confirmed = row.getValue("confirmed") as string | null;
            const releaseDate = row.original.release_date;

            // Check if time-locked
            if (releaseDate) {
                const releaseTime = parseInt(releaseDate, 10);
                const now = Date.now();
                if (releaseTime > now) {
                    const daysUntilRelease = Math.ceil(
                        (releaseTime - now) / (1000 * 60 * 60 * 24),
                    );
                    return (
                        <Badge variant="secondary" className="font-mono">
                            🔒 Locked ({daysUntilRelease}d)
                        </Badge>
                    );
                }
            }

            return confirmed ? (
                <Badge variant="default" className="font-mono">
                    ✓ Confirmed
                </Badge>
            ) : (
                <Badge variant="secondary" className="font-mono">
                    ⏳ Pending
                </Badge>
            );
        },
    },
    {
        accessorKey: "confirmed",
        id: "age",
        header: "Age",
        cell: ({ row }) => {
            const confirmed = row.getValue("confirmed") as string | null;

            if (!confirmed) {
                return <span className="text-muted-foreground">—</span>;
            }

            const confirmedTime = parseInt(confirmed, 10);
            const now = Date.now();
            const ageMs = now - confirmedTime;

            const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor(ageMs / (1000 * 60 * 60));
            const minutes = Math.floor(ageMs / (1000 * 60));

            let ageText = "";
            if (days > 0) {
                ageText = `${days}d ago`;
            } else if (hours > 0) {
                ageText = `${hours}h ago`;
            } else if (minutes > 0) {
                ageText = `${minutes}m ago`;
            } else {
                ageText = "Just now";
            }

            return (
                <span className="text-sm text-muted-foreground">{ageText}</span>
            );
        },
    },
    {
        accessorKey: "release_date",
        header: "Available",
        cell: ({ row }) => {
            const releaseDate = row.getValue("release_date") as string | null;

            if (!releaseDate) {
                return <span className="text-green-500 text-sm">Now</span>;
            }

            const releaseTime = parseInt(releaseDate, 10);
            const now = Date.now();

            if (releaseTime <= now) {
                return <span className="text-green-500 text-sm">Now</span>;
            }

            const date = new Date(releaseTime);
            return (
                <span className="text-sm text-muted-foreground">
                    {date.toLocaleDateString()}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const utxo = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <span className="text-lg">•••</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(utxo.amount);
                                toast.success("Amount copied to clipboard");
                            }}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Amount
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
