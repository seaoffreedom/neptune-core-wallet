/**
 * Address Book Select Component
 *
 * Dropdown to select an address from the address book
 */

import { Check, ChevronsUpDown, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAddressBook } from '@/renderer/hooks/use-address-book';

interface AddressBookSelectProps {
  onSelect: (address: string) => void;
  value?: string;
}

export function AddressBookSelect({ onSelect, value }: AddressBookSelectProps) {
  const [open, setOpen] = useState(false);
  const { entries, fetchEntries } = useAddressBook();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const selectedEntry = entries.find((entry) => entry.address === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedEntry ? (
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{selectedEntry.title}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              Select from address book...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search addresses..." />
          <CommandList>
            <CommandEmpty>No saved addresses found.</CommandEmpty>
            <CommandGroup>
              {entries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  value={entry.address}
                  onSelect={(currentValue) => {
                    onSelect(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === entry.address ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{entry.title}</div>
                    {entry.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {entry.description}
                      </div>
                    )}
                    <div className="text-xs font-mono text-muted-foreground truncate mt-1">
                      {entry.address}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
