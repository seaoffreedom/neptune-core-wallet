import { create } from "zustand";
import type { PeerEntry } from "../../main/stores/peer-store";

interface PeerState {
    activePeers: PeerEntry[];
    bannedPeers: PeerEntry[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadPeers: (network: string) => Promise<void>;
    addPeer: (peer: Omit<PeerEntry, "id" | "addedAt">) => Promise<void>;
    updatePeer: (id: string, updates: Partial<PeerEntry>) => Promise<void>;
    deletePeer: (id: string) => Promise<void>; // Also serves as "unban" for banned peers
    togglePeer: (id: string, enabled: boolean) => Promise<void>;
    banPeer: (id: string, reason?: string) => Promise<void>;
}

export const usePeerStore = create<PeerState>((set, get) => ({
    activePeers: [],
    bannedPeers: [],
    isLoading: false,
    error: null,

    loadPeers: async (network: string) => {
        console.log("🔍 loadPeers called for network:", network);
        set({ isLoading: true, error: null });
        try {
            const [active, banned] = await Promise.all([
                window.electronAPI.peer.getActive(network),
                window.electronAPI.peer.getBanned(network),
            ]);
            console.log("✅ Peers loaded:", {
                active: active.length,
                banned: banned.length,
                activeDetails: active,
                bannedDetails: banned,
            });
            set({ activePeers: active, bannedPeers: banned, isLoading: false });
        } catch (error) {
            console.error("❌ Failed to load peers:", error);
            set({
                error: (error as Error).message,
                isLoading: false,
            });
        }
    },

    addPeer: async (peer) => {
        try {
            await window.electronAPI.peer.add(peer);
            await get().loadPeers(peer.network);
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updatePeer: async (id, updates) => {
        try {
            await window.electronAPI.peer.update(id, updates);
            // Reload based on current network
            const currentPeer =
                get().activePeers.find((p) => p.id === id) ||
                get().bannedPeers.find((p) => p.id === id);
            if (currentPeer) {
                await get().loadPeers(currentPeer.network);
            }
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deletePeer: async (id) => {
        try {
            await window.electronAPI.peer.delete(id);
            const currentPeer =
                get().activePeers.find((p) => p.id === id) ||
                get().bannedPeers.find((p) => p.id === id);
            if (currentPeer) {
                await get().loadPeers(currentPeer.network);
            }
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    togglePeer: async (id, enabled) => {
        try {
            await window.electronAPI.peer.toggle(id, enabled);
            const currentPeer = get().activePeers.find((p) => p.id === id);
            if (currentPeer) {
                await get().loadPeers(currentPeer.network);
            }
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    banPeer: async (id, reason) => {
        try {
            await window.electronAPI.peer.ban(id, reason);
            const currentPeer = get().activePeers.find((p) => p.id === id);
            if (currentPeer) {
                await get().loadPeers(currentPeer.network);
            }
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    // Note: No unbanPeer method - just use deletePeer on banned peers
}));
