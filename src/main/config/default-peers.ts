import type { PeerEntry } from "../stores/peer-store";

export const DEFAULT_BOOTSTRAP_PEERS: Record<
    string,
    Omit<PeerEntry, "id" | "addedAt">[]
> = {
    main: [
        {
            address: "51.15.139.238:9798",
            label: "Official Bootstrap Node 1",
            type: "bootstrap",
            enabled: true,
            network: "main",
            isDefault: true,
            isBanned: false,
        },
        {
            address: "139.162.193.206:9798",
            label: "Official Bootstrap Node 2",
            type: "bootstrap",
            enabled: true,
            network: "main",
            isDefault: true,
            isBanned: false,
        },
    ],
    testnet: [],
    regtest: [],
};
