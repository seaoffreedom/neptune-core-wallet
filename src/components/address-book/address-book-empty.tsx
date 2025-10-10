/**
 * Address Book Empty State
 *
 * Component displayed when there are no address book entries
 */

import { BookUser, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

interface AddressBookEmptyProps {
  onCreateNew: () => void;
}

export function AddressBookEmpty({ onCreateNew }: AddressBookEmptyProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookUser />
        </EmptyMedia>
        <EmptyTitle>No Saved Addresses</EmptyTitle>
        <EmptyDescription>
          You haven't saved any Neptune addresses yet. Add your first contact to
          get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </EmptyContent>
    </Empty>
  );
}
