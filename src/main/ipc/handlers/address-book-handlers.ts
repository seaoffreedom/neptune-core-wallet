/**
 * Address Book IPC Handlers
 *
 * Handles all IPC communication for address book operations
 */

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "@/shared/constants/ipc-channels";
import { addressBookService } from "@/main/services/address-book.service";

/**
 * Register all address book IPC handlers
 */
export function registerAddressBookHandlers() {
    // Get all entries
    ipcMain.handle(IPC_CHANNELS.ADDRESS_BOOK_GET_ALL, async () => {
        try {
            const entries = addressBookService.getAllEntries();
            return { success: true, entries };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Get entry by ID
    ipcMain.handle(
        IPC_CHANNELS.ADDRESS_BOOK_GET_BY_ID,
        async (_event, id: string) => {
            try {
                const entry = addressBookService.getEntryById(id);
                if (!entry) {
                    return {
                        success: false,
                        error: `Entry not found: ${id}`,
                    };
                }
                return { success: true, entry };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Create entry
    ipcMain.handle(
        IPC_CHANNELS.ADDRESS_BOOK_CREATE,
        async (
            _event,
            data: { title: string; description: string; address: string },
        ) => {
            try {
                const entry = addressBookService.createEntry(data);
                return { success: true, entry };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Update entry
    ipcMain.handle(
        IPC_CHANNELS.ADDRESS_BOOK_UPDATE,
        async (
            _event,
            params: {
                id: string;
                data: {
                    title?: string;
                    description?: string;
                    address?: string;
                };
            },
        ) => {
            try {
                const entry = addressBookService.updateEntry(
                    params.id,
                    params.data,
                );
                return { success: true, entry };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Delete entry
    ipcMain.handle(
        IPC_CHANNELS.ADDRESS_BOOK_DELETE,
        async (_event, id: string) => {
            try {
                const result = addressBookService.deleteEntry(id);
                return { success: result };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Search entries
    ipcMain.handle(
        IPC_CHANNELS.ADDRESS_BOOK_SEARCH,
        async (_event, query: string) => {
            try {
                const entries = addressBookService.searchEntries(query);
                return { success: true, entries };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Export entries
    ipcMain.handle(IPC_CHANNELS.ADDRESS_BOOK_EXPORT, async () => {
        try {
            const json = addressBookService.exportEntries();
            return { success: true, json };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    // Import entries
    ipcMain.handle(
        IPC_CHANNELS.ADDRESS_BOOK_IMPORT,
        async (_event, params: { json: string; merge?: boolean }) => {
            try {
                const count = addressBookService.importEntries(
                    params.json,
                    params.merge,
                );
                return { success: true, count };
            } catch (error) {
                return {
                    success: false,
                    error: (error as Error).message,
                };
            }
        },
    );

    // Clear all entries
    ipcMain.handle(IPC_CHANNELS.ADDRESS_BOOK_CLEAR_ALL, async () => {
        try {
            const result = addressBookService.clearAllEntries();
            return { success: result };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    });

    console.log("✅ Address Book handlers registered (9 endpoints)");
}

/**
 * Unregister all address book IPC handlers
 */
export function unregisterAddressBookHandlers() {
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_GET_ALL);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_GET_BY_ID);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_CREATE);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_UPDATE);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_DELETE);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_SEARCH);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_EXPORT);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_IMPORT);
    ipcMain.removeHandler(IPC_CHANNELS.ADDRESS_BOOK_CLEAR_ALL);

    console.log("✅ Address Book handlers unregistered (9 endpoints)");
}
