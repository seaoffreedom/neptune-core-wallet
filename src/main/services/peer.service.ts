import { v4 as uuidv4 } from "uuid";
import { peerStore, type PeerEntry } from "../stores/peer-store";
import { DEFAULT_BOOTSTRAP_PEERS } from "../config/default-peers";

export class PeerService {
    constructor() {
        console.log("🏗️ PeerService constructor called");
        this.initializeDefaults();
    }

    private initializeDefaults(): void {
        console.log("🔧 PeerService.initializeDefaults called");
        const peers = peerStore.get("peers");
        console.log(`📋 Current peers in store: ${peers.length}`);
        if (peers.length === 0) {
            console.log("🚀 Initializing default peers...");
            // Initialize with defaults for all networks
            const allDefaults: PeerEntry[] = [];
            for (const [_network, networkPeers] of Object.entries(
                DEFAULT_BOOTSTRAP_PEERS,
            )) {
                for (const peer of networkPeers) {
                    allDefaults.push({
                        ...peer,
                        id: uuidv4(),
                        addedAt: Date.now(),
                    });
                }
            }
            peerStore.set("peers", allDefaults);
            console.log(`✅ Initialized ${allDefaults.length} default peers`);
        } else {
            console.log("✅ Default peers already exist");
        }
    }

    // CRUD Operations
    async addPeer(peer: Omit<PeerEntry, "id" | "addedAt">): Promise<PeerEntry> {
        const newPeer: PeerEntry = {
            ...peer,
            id: uuidv4(),
            addedAt: Date.now(),
        };

        const peers = peerStore.get("peers");
        peers.push(newPeer);
        peerStore.set("peers", peers);

        return newPeer;
    }

    async updatePeer(
        id: string,
        updates: Partial<PeerEntry>,
    ): Promise<PeerEntry> {
        const peers = peerStore.get("peers");
        const index = peers.findIndex((p) => p.id === id);

        if (index === -1) {
            throw new Error(`Peer with id ${id} not found`);
        }

        peers[index] = { ...peers[index], ...updates };
        peerStore.set("peers", peers);

        return peers[index];
    }

    async deletePeer(id: string): Promise<void> {
        const peers = peerStore.get("peers");
        const peer = peers.find((p) => p.id === id);

        if (peer?.isDefault) {
            throw new Error("Cannot delete default bootstrap peer");
        }

        const filtered = peers.filter((p) => p.id !== id);
        peerStore.set("peers", filtered);
    }

    async getPeer(id: string): Promise<PeerEntry | null> {
        const peers = peerStore.get("peers");
        return peers.find((p) => p.id === id) || null;
    }

    async getAllPeers(network?: string): Promise<PeerEntry[]> {
        const peers = peerStore.get("peers");
        if (network) {
            return peers.filter((p) => p.network === network);
        }
        return peers;
    }

    // Filter Operations
    async getActivePeers(network?: string): Promise<PeerEntry[]> {
        const peers = await this.getAllPeers(network);
        return peers.filter((p) => !p.isBanned);
    }

    async getBannedPeers(network?: string): Promise<PeerEntry[]> {
        const peers = await this.getAllPeers(network);
        return peers.filter((p) => p.isBanned);
    }

    async getEnabledPeers(network: string): Promise<PeerEntry[]> {
        console.log(
            `🔍 PeerService.getEnabledPeers called for network: ${network}`,
        );
        const allPeers = await this.getAllPeers(network);
        console.log(`📋 All peers for network ${network}:`, allPeers.length);
        const activePeers = await this.getActivePeers(network);
        console.log(
            `📋 Active peers for network ${network}:`,
            activePeers.length,
        );
        const enabledPeers = activePeers.filter((p) => p.enabled);
        console.log(
            `📋 Enabled peers for network ${network}:`,
            enabledPeers.length,
            enabledPeers.map((p) => ({
                address: p.address,
                label: p.label,
                enabled: p.enabled,
            })),
        );
        return enabledPeers;
    }

    // Ban Operation
    async banPeer(id: string, reason?: string): Promise<void> {
        await this.updatePeer(id, {
            isBanned: true,
            bannedAt: Date.now(),
            bannedReason: reason,
            enabled: false, // Disable when banned
        });
    }

    // Note: Unban is just delete - no separate unban operation needed

    async togglePeer(id: string, enabled: boolean): Promise<void> {
        await this.updatePeer(id, { enabled });
    }

    // Validation
    validatePeerAddress(address: string): boolean {
        const regex = /^(\[?[a-zA-Z0-9\-.:]+\]?):(\d{1,5})$/;
        if (!regex.test(address)) return false;

        const parts = address.split(":");
        const portStr = parts[parts.length - 1];
        if (!portStr) return false;

        const port = Number.parseInt(portStr, 10);
        return port > 0 && port <= 65535;
    }
}

export const peerService = new PeerService();
