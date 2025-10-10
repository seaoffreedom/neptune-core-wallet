/**
 * Address Book Preload API
 *
 * Exposes address book functions to the renderer process
 */

import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@/shared/constants/ipc-channels";

export const addressBookAPI = {
    /**
     * Get all address book entries
     */
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_GET_ALL),

    /**
     * Get a single entry by ID
     */
    getById: (id: string) =>
        ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_GET_BY_ID, id),

    /**
     * Create a new address book entry
     */
    create: (data: { title: string; description: string; address: string }) =>
        ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_CREATE, data),

    /**
     * Update an existing entry
     */
    update: (
        id: string,
        data: {
            title?: string;
            description?: string;
            address?: string;
        },
    ) =>
        ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_UPDATE, {
            id,
            data,
        }),

    /**
     * Delete an entry
     */
    delete: (id: string) =>
        ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_DELETE, id),

    /**
     * Search entries by query
     */
    search: (query: string) =>
        ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_SEARCH, query),

    /**
     * Export all entries as JSON
     */
    export: () => ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_EXPORT),

    /**
     * Import entries from JSON
     */
    import: (json: string, merge = false) =>
        ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_IMPORT, {
            json,
            merge,
        }),

    /**
     * Clear all entries
     */
    clearAll: () => ipcRenderer.invoke(IPC_CHANNELS.ADDRESS_BOOK_CLEAR_ALL),
};
