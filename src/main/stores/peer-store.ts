import Store, { Schema } from "electron-store";

export interface PeerEntry {
    id: string;
    address: string;
    label?: string;
    type: "bootstrap" | "manual" | "discovered";
    lastSeen?: number;
    addedAt: number;
    enabled: boolean;
    network: "main" | "testnet" | "regtest";
    notes?: string;
    isDefault: boolean;
    isBanned: boolean;
    bannedAt?: number;
    bannedReason?: string;
}

export interface PeerStoreSchema {
    peers: PeerEntry[];
}

const schema: Schema<PeerStoreSchema> = {
    peers: {
        type: "array",
        default: [],
    },
};

export const peerStore = new Store<PeerStoreSchema>({
    name: "peers",
    schema,
    watch: true,
});
