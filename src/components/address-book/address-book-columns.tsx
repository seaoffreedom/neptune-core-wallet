/**
 * Address Book Table Columns
 *
 * Column definitions for the address book data table
 */

import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AddressBookEntry } from '@/shared/types/api-types';

export const addressBookColumns: ColumnDef<AddressBookEntry>[] = [
  {
    accessorKey: 'title',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.getValue('title')}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground">
              {row.original.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const [copied, setCopied] = useState(false);
      const address = row.getValue('address') as string;

      const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      // Truncate address for display
      const truncateAddress = (addr: string) => {
        if (addr.length <= 20) return addr;
        return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
      };

      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{truncateAddress(address)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const entry = row.original;

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
              onClick={() => {
                navigator.clipboard.writeText(entry.address);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Trigger edit mode
                const meta = table.options.meta as {
                  onEdit?: (entry: AddressBookEntry) => void;
                };
                meta?.onEdit?.(entry);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                // Trigger delete
                const meta = table.options.meta as {
                  onDelete?: (entry: AddressBookEntry) => void;
                };
                meta?.onDelete?.(entry);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
