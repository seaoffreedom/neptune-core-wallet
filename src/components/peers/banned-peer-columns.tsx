/**
 * Banned Peer Table Column Definitions
 *
 * Defines the columns for the banned peers data table
 */

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PeerEntry } from '@/main/stores/peer-store';

export const bannedPeerColumns: ColumnDef<PeerEntry>[] = [
  {
    accessorKey: 'label',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Label
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const label = row.getValue('label') as string | undefined;
      return <div className="font-medium">{label || 'Unnamed Peer'}</div>;
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const address = row.getValue('address') as string;
      return <div className="font-mono text-sm">{address}</div>;
    },
  },
  {
    accessorKey: 'bannedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Banned At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const bannedAt = row.getValue('bannedAt') as number | undefined;
      if (!bannedAt) return '-';
      const date = new Date(bannedAt);
      return (
        <div className="text-sm">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      );
    },
  },
  {
    accessorKey: 'bannedReason',
    header: 'Reason',
    cell: ({ row }) => {
      const reason = row.getValue('bannedReason') as string | undefined;
      return (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {reason || '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const peer = row.original;
      const meta = table.options.meta as {
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
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => meta.onDelete?.(peer)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove from banned list
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
