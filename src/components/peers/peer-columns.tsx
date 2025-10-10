/**
 * Peer Table Column Definitions
 *
 * Defines the columns for the peer management data tables
 */

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Ban, Edit, MoreHorizontal, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import type { PeerEntry } from "@/main/stores/peer-store";
import { usePeerStore } from "@/renderer/stores/peer-store";

export const peerColumns: ColumnDef<PeerEntry>[] = [
    {
        accessorKey: "label",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Label
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const label = row.getValue("label") as string | undefined;
            const isDefault = row.original.isDefault;
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium">
                        {label || "Unnamed Peer"}
                    </span>
                    {isDefault && (
                        <Badge variant="outline" className="text-xs">
                            Default
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => {
            const address = row.getValue("address") as string;
            return <div className="font-mono text-sm">{address}</div>;
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <Badge variant="secondary" className="capitalize">
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "enabled",
        header: "Status",
        cell: ({ row }) => {
            const peer = row.original;
            const { togglePeer } = usePeerStore();

            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={peer.enabled}
                        onCheckedChange={(checked) =>
                            togglePeer(peer.id, checked)
                        }
                        disabled={peer.isDefault}
                    />
                    <span className="text-sm text-muted-foreground">
                        {peer.enabled ? "Enabled" : "Disabled"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const peer = row.original;
            const meta = table.options.meta as {
                onEdit?: (peer: PeerEntry) => void;
                onBan?: (peer: PeerEntry) => void;
                onDelete?: (peer: PeerEntry) => void;
            };

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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => meta.onEdit?.(peer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => meta.onBan?.(peer)}>
                            <Ban className="mr-2 h-4 w-4" />
                            Ban Peer
                        </DropdownMenuItem>
                        {!peer.isDefault && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => meta.onDelete?.(peer)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
