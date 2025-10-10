import { createFileRoute } from '@tanstack/react-router';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AddressBookEmpty,
  AddressBookForm,
  AddressBookTable,
  addressBookColumns,
} from '@/components/address-book';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddressBook } from '@/renderer/hooks/use-address-book';
import type { AddressBookEntry } from '@/shared/types/api-types';

function AddressBook() {
  const {
    entries,
    isLoading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useAddressBook();

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AddressBookEntry | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    entry: AddressBookEntry | null;
    show: boolean;
  }>({ entry: null, show: false });

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleCreateNew = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEdit = (entry: AddressBookEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = (entry: AddressBookEntry) => {
    setDeleteConfirm({ entry, show: true });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.entry) {
      await deleteEntry(deleteConfirm.entry.id);
      setDeleteConfirm({ entry: null, show: false });
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description?: string;
    address: string;
  }) => {
    setIsSubmitting(true);

    try {
      if (editingEntry) {
        // Update existing entry
        await updateEntry(editingEntry.id, values);
      } else {
        // Create new entry
        await createEntry({
          title: values.title,
          description: values.description || '',
          address: values.address,
        });
      }

      // Close form on success
      setShowForm(false);
      setEditingEntry(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  // Initial loading state
  const isInitialLoading = isLoading && entries.length === 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Address Book</h3>
            <p className="text-muted-foreground">
              Manage your saved Neptune addresses for quick access.
            </p>
          </div>
          {!showForm && entries.length > 0 && (
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <AddressBookForm
            entry={editingEntry}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Content */}
        {!showForm &&
          (isInitialLoading ? (
            // Loading skeleton matching table structure
            <div className="space-y-4">
              {/* Search bar skeleton */}
              <Skeleton className="h-10 w-full max-w-sm" />

              {/* Table skeleton */}
              <div className="rounded-md border">
                <div className="p-4 space-y-4">
                  {/* Table header */}
                  <div className="flex gap-4">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  {/* Table rows */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 w-24" />
                      <Skeleton className="h-12 w-20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination skeleton */}
              <div className="flex items-center justify-end space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ) : entries.length === 0 ? (
            // Empty state
            <AddressBookEmpty onCreateNew={handleCreateNew} />
          ) : (
            // Data table
            <AddressBookTable
              columns={addressBookColumns}
              data={entries}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteConfirm.show}
          onOpenChange={(open) => setDeleteConfirm({ entry: null, show: open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Address</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm.entry?.title}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}

export const Route = createFileRoute('/wallet/address-book')({
  component: AddressBook,
});
