/**
 * Address Book Service
 *
 * Service for managing address book entries using electron-store
 * Provides CRUD operations for saved Neptune addresses
 */

import Store from "electron-store";
import { randomUUID } from "crypto";
import pino from "pino";

const logger = pino({ level: "info" });

// Address book entry interface
export interface AddressBookEntry {
    id: string;
    title: string;
    description: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}

// Store schema
interface AddressBookSchema {
    entries: AddressBookEntry[];
}

export class AddressBookService {
    private store: Store<AddressBookSchema>;

    constructor() {
        this.store = new Store<AddressBookSchema>({
            name: "address-book",
            defaults: {
                entries: [],
            },
        });

        logger.info("AddressBookService initialized");
    }

    /**
     * Get all address book entries
     */
    getAllEntries(): AddressBookEntry[] {
        try {
            const entries = this.store.get("entries", []);
            logger.info({ count: entries.length }, "Retrieved all entries");
            return entries;
        } catch (error) {
            logger.error({ error }, "Failed to get all entries");
            throw error;
        }
    }

    /**
     * Get a single entry by ID
     */
    getEntryById(id: string): AddressBookEntry | null {
        try {
            const entries = this.store.get("entries", []);
            const entry = entries.find((e) => e.id === id);
            logger.info({ id, found: !!entry }, "Retrieved entry by ID");
            return entry || null;
        } catch (error) {
            logger.error({ error, id }, "Failed to get entry by ID");
            throw error;
        }
    }

    /**
     * Create a new address book entry
     */
    createEntry(data: {
        title: string;
        description: string;
        address: string;
    }): AddressBookEntry {
        try {
            const entries = this.store.get("entries", []);

            // Check for duplicate address
            const existingEntry = entries.find(
                (e) => e.address === data.address,
            );
            if (existingEntry) {
                throw new Error(
                    `Address already exists in address book: ${existingEntry.title}`,
                );
            }

            const now = new Date().toISOString();
            const newEntry: AddressBookEntry = {
                id: randomUUID(),
                title: data.title,
                description: data.description,
                address: data.address,
                createdAt: now,
                updatedAt: now,
            };

            entries.push(newEntry);
            this.store.set("entries", entries);

            logger.info(
                { id: newEntry.id, title: newEntry.title },
                "Created entry",
            );
            return newEntry;
        } catch (error) {
            logger.error({ error, data }, "Failed to create entry");
            throw error;
        }
    }

    /**
     * Update an existing entry
     */
    updateEntry(
        id: string,
        data: {
            title?: string;
            description?: string;
            address?: string;
        },
    ): AddressBookEntry {
        try {
            const entries = this.store.get("entries", []);
            const entryIndex = entries.findIndex((e) => e.id === id);

            if (entryIndex === -1) {
                throw new Error(`Entry not found: ${id}`);
            }

            // If updating address, check for duplicates
            if (data.address && data.address !== entries[entryIndex].address) {
                const duplicate = entries.find(
                    (e) => e.address === data.address && e.id !== id,
                );
                if (duplicate) {
                    throw new Error(
                        `Address already exists in address book: ${duplicate.title}`,
                    );
                }
            }

            const updatedEntry: AddressBookEntry = {
                ...entries[entryIndex],
                ...data,
                updatedAt: new Date().toISOString(),
            };

            entries[entryIndex] = updatedEntry;
            this.store.set("entries", entries);

            logger.info({ id, title: updatedEntry.title }, "Updated entry");
            return updatedEntry;
        } catch (error) {
            logger.error({ error, id, data }, "Failed to update entry");
            throw error;
        }
    }

    /**
     * Delete an entry
     */
    deleteEntry(id: string): boolean {
        try {
            const entries = this.store.get("entries", []);
            const entryIndex = entries.findIndex((e) => e.id === id);

            if (entryIndex === -1) {
                throw new Error(`Entry not found: ${id}`);
            }

            const deletedEntry = entries[entryIndex];
            entries.splice(entryIndex, 1);
            this.store.set("entries", entries);

            logger.info({ id, title: deletedEntry.title }, "Deleted entry");
            return true;
        } catch (error) {
            logger.error({ error, id }, "Failed to delete entry");
            throw error;
        }
    }

    /**
     * Search entries by title or address
     */
    searchEntries(query: string): AddressBookEntry[] {
        try {
            const entries = this.store.get("entries", []);
            const lowercaseQuery = query.toLowerCase();

            const results = entries.filter(
                (entry) =>
                    entry.title.toLowerCase().includes(lowercaseQuery) ||
                    entry.address.toLowerCase().includes(lowercaseQuery) ||
                    entry.description.toLowerCase().includes(lowercaseQuery),
            );

            logger.info({ query, count: results.length }, "Searched entries");
            return results;
        } catch (error) {
            logger.error({ error, query }, "Failed to search entries");
            throw error;
        }
    }

    /**
     * Clear all entries (use with caution)
     */
    clearAllEntries(): boolean {
        try {
            this.store.set("entries", []);
            logger.info("Cleared all entries");
            return true;
        } catch (error) {
            logger.error({ error }, "Failed to clear all entries");
            throw error;
        }
    }

    /**
     * Export all entries as JSON
     */
    exportEntries(): string {
        try {
            const entries = this.store.get("entries", []);
            const json = JSON.stringify(entries, null, 2);
            logger.info({ count: entries.length }, "Exported entries");
            return json;
        } catch (error) {
            logger.error({ error }, "Failed to export entries");
            throw error;
        }
    }

    /**
     * Import entries from JSON
     */
    importEntries(json: string, merge = false): number {
        try {
            const importedEntries = JSON.parse(json) as AddressBookEntry[];

            if (!Array.isArray(importedEntries)) {
                throw new Error(
                    "Invalid JSON format: expected array of entries",
                );
            }

            const entries = merge ? this.store.get("entries", []) : [];
            let importedCount = 0;

            for (const entry of importedEntries) {
                // Validate entry structure
                if (!entry.title || !entry.address) {
                    logger.warn({ entry }, "Skipping invalid entry");
                    continue;
                }

                // Check for duplicates
                const existingEntry = entries.find(
                    (e) => e.address === entry.address,
                );
                if (existingEntry) {
                    logger.warn(
                        { address: entry.address },
                        "Skipping duplicate address",
                    );
                    continue;
                }

                // Ensure required fields
                const validEntry: AddressBookEntry = {
                    id: entry.id || randomUUID(),
                    title: entry.title,
                    description: entry.description || "",
                    address: entry.address,
                    createdAt: entry.createdAt || new Date().toISOString(),
                    updatedAt: entry.updatedAt || new Date().toISOString(),
                };

                entries.push(validEntry);
                importedCount++;
            }

            this.store.set("entries", entries);
            logger.info(
                { importedCount, total: entries.length },
                "Imported entries",
            );
            return importedCount;
        } catch (error) {
            logger.error({ error }, "Failed to import entries");
            throw error;
        }
    }
}

// Singleton instance
export const addressBookService = new AddressBookService();
