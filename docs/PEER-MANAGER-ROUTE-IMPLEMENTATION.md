# Peer Manager Route Implementation Plan

## Overview
Create a new wallet sub-route `/wallet/peers` for managing Neptune Core peer connections, with separate sections for active and banned peers.

## Route Structure

### Path: `/wallet/peers`
- Follows existing wallet route pattern (like `/wallet/send`, `/wallet/receive`)
- Appears in wallet sidebar navigation
- Icon: `Users` or `Network` from lucide-react

## Implementation Phases

### Phase 1: Backend Infrastructure

#### 1.1 Peer Store (`src/main/stores/peer-store.ts`)
```typescript
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

export interface PeerEntry {
  id: string;
  address: string;
  label?: string;
  type: 'bootstrap' | 'manual' | 'discovered';
  lastSeen?: number;
  addedAt: number;
  enabled: boolean;
  network: 'main' | 'testnet' | 'regtest';
  notes?: string;
  isDefault: boolean;
  isBanned: boolean;
  bannedAt?: number;
  bannedReason?: string;
}

export interface PeerStoreSchema {
  peers: PeerEntry[];
}

const schema: Store.Schema<PeerStoreSchema> = {
  peers: {
    type: 'array',
    default: [],
  },
};

export const peerStore = new Store<PeerStoreSchema>({
  name: 'peers',
  schema,
  watch: true,
});
```

#### 1.2 Default Peers (`src/main/config/default-peers.ts`)
```typescript
import { PeerEntry } from '../stores/peer-store';

export const DEFAULT_BOOTSTRAP_PEERS: Record<string, Omit<PeerEntry, 'id' | 'addedAt'>[]> = {
  main: [
    {
      address: '51.15.139.238:9798',
      label: 'Official Bootstrap Node 1',
      type: 'bootstrap',
      enabled: true,
      network: 'main',
      isDefault: true,
      isBanned: false,
    },
    {
      address: '139.162.193.206:9798',
      label: 'Official Bootstrap Node 2',
      type: 'bootstrap',
      enabled: true,
      network: 'main',
      isDefault: true,
      isBanned: false,
    },
  ],
  testnet: [],
  regtest: [],
};
```

#### 1.3 Peer Service (`src/main/services/peer.service.ts`)
```typescript
import { peerStore, PeerEntry } from '../stores/peer-store';
import { DEFAULT_BOOTSTRAP_PEERS } from '../config/default-peers';
import { v4 as uuidv4 } from 'uuid';

export class PeerService {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    const peers = peerStore.get('peers');
    if (peers.length === 0) {
      // Initialize with defaults for all networks
      const allDefaults: PeerEntry[] = [];
      for (const [network, networkPeers] of Object.entries(DEFAULT_BOOTSTRAP_PEERS)) {
        for (const peer of networkPeers) {
          allDefaults.push({
            ...peer,
            id: uuidv4(),
            addedAt: Date.now(),
          });
        }
      }
      peerStore.set('peers', allDefaults);
    }
  }

  // CRUD Operations
  async addPeer(peer: Omit<PeerEntry, 'id' | 'addedAt'>): Promise<PeerEntry> {
    const newPeer: PeerEntry = {
      ...peer,
      id: uuidv4(),
      addedAt: Date.now(),
    };

    const peers = peerStore.get('peers');
    peers.push(newPeer);
    peerStore.set('peers', peers);

    return newPeer;
  }

  async updatePeer(id: string, updates: Partial<PeerEntry>): Promise<PeerEntry> {
    const peers = peerStore.get('peers');
    const index = peers.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Peer with id ${id} not found`);
    }

    peers[index] = { ...peers[index], ...updates };
    peerStore.set('peers', peers);

    return peers[index];
  }

  async deletePeer(id: string): Promise<void> {
    const peers = peerStore.get('peers');
    const peer = peers.find((p) => p.id === id);

    if (peer?.isDefault) {
      throw new Error('Cannot delete default bootstrap peer');
    }

    const filtered = peers.filter((p) => p.id !== id);
    peerStore.set('peers', filtered);
  }

  async getPeer(id: string): Promise<PeerEntry | null> {
    const peers = peerStore.get('peers');
    return peers.find((p) => p.id === id) || null;
  }

  async getAllPeers(network?: string): Promise<PeerEntry[]> {
    const peers = peerStore.get('peers');
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
    const peers = await this.getActivePeers(network);
    return peers.filter((p) => p.enabled);
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
    const regex = /^(\[?[a-zA-Z0-9\-\.:]+\]?):(\d{1,5})$/;
    if (!regex.test(address)) return false;

    const port = parseInt(address.split(':').pop()!);
    return port > 0 && port <= 65535;
  }
}

export const peerService = new PeerService();
```

#### 1.4 IPC Handlers (`src/main/ipc/handlers/peer-handlers.ts`)
```typescript
import { ipcMain } from 'electron';
import { peerService } from '../../services/peer.service';

export function registerPeerHandlers() {
  ipcMain.handle('peer:add', async (_, peer) => {
    return peerService.addPeer(peer);
  });

  ipcMain.handle('peer:update', async (_, id, updates) => {
    return peerService.updatePeer(id, updates);
  });

  ipcMain.handle('peer:delete', async (_, id) => {
    return peerService.deletePeer(id);
  });

  ipcMain.handle('peer:get', async (_, id) => {
    return peerService.getPeer(id);
  });

  ipcMain.handle('peer:getAll', async (_, network) => {
    return peerService.getAllPeers(network);
  });

  ipcMain.handle('peer:getActive', async (_, network) => {
    return peerService.getActivePeers(network);
  });

  ipcMain.handle('peer:getBanned', async (_, network) => {
    return peerService.getBannedPeers(network);
  });

  ipcMain.handle('peer:toggle', async (_, id, enabled) => {
    return peerService.togglePeer(id, enabled);
  });

  ipcMain.handle('peer:ban', async (_, id, reason) => {
    return peerService.banPeer(id, reason);
  });

  // Note: No unban handler needed - just use delete

  ipcMain.handle('peer:validate', async (_, address) => {
    return peerService.validatePeerAddress(address);
  });
}
```

### Phase 2: Frontend Infrastructure

#### 2.1 Preload API (`src/preload/api/peer-api.ts`)
```typescript
import { ipcRenderer } from 'electron';
import type { PeerEntry } from '../../main/stores/peer-store';

export const peerApi = {
  add: (peer: Omit<PeerEntry, 'id' | 'addedAt'>) =>
    ipcRenderer.invoke('peer:add', peer),

  update: (id: string, updates: Partial<PeerEntry>) =>
    ipcRenderer.invoke('peer:update', id, updates),

  delete: (id: string) =>
    ipcRenderer.invoke('peer:delete', id),

  get: (id: string) =>
    ipcRenderer.invoke('peer:get', id),

  getAll: (network?: string) =>
    ipcRenderer.invoke('peer:getAll', network),

  getActive: (network?: string) =>
    ipcRenderer.invoke('peer:getActive', network),

  getBanned: (network?: string) =>
    ipcRenderer.invoke('peer:getBanned', network),

  toggle: (id: string, enabled: boolean) =>
    ipcRenderer.invoke('peer:toggle', id, enabled),

  ban: (id: string, reason?: string) =>
    ipcRenderer.invoke('peer:ban', id, reason),

  // Note: No unban method needed - just use delete

  validate: (address: string) =>
    ipcRenderer.invoke('peer:validate', address),
};
```

#### 2.2 Zustand Store (`src/renderer/stores/peer-store.ts`)
```typescript
import { create } from 'zustand';
import type { PeerEntry } from '../../main/stores/peer-store';

interface PeerState {
  activePeers: PeerEntry[];
  bannedPeers: PeerEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPeers: (network: string) => Promise<void>;
  addPeer: (peer: Omit<PeerEntry, 'id' | 'addedAt'>) => Promise<void>;
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
    set({ isLoading: true, error: null });
    try {
      const [active, banned] = await Promise.all([
        window.api.peer.getActive(network),
        window.api.peer.getBanned(network),
      ]);
      set({ activePeers: active, bannedPeers: banned, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addPeer: async (peer) => {
    try {
      await window.api.peer.add(peer);
      const network = peer.network;
      await get().loadPeers(network);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updatePeer: async (id, updates) => {
    try {
      await window.api.peer.update(id, updates);
      // Reload based on current network
      const currentPeer = get().activePeers.find(p => p.id === id) ||
                          get().bannedPeers.find(p => p.id === id);
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
      await window.api.peer.delete(id);
      const currentPeer = get().activePeers.find(p => p.id === id) ||
                          get().bannedPeers.find(p => p.id === id);
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
      await window.api.peer.toggle(id, enabled);
      const currentPeer = get().activePeers.find(p => p.id === id);
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
      await window.api.peer.ban(id, reason);
      const currentPeer = get().activePeers.find(p => p.id === id);
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
```

### Phase 3: UI Components

#### 3.1 Route File (`src/routes/wallet/peers.tsx`)
```typescript
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { usePeerStore } from '@/renderer/stores/peer-store';
import { useNetworkSettings } from '@/renderer/stores/neptune-core-settings-store';
import { ActivePeersSection } from '@/components/peers/active-peers-section';
import { BannedPeersSection } from '@/components/peers/banned-peers-section';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/wallet/peers')({
  component: PeerManagerRoute,
});

function PeerManagerRoute() {
  const { activePeers, bannedPeers, isLoading, loadPeers, deletePeer } = usePeerStore();
  const networkSettings = useNetworkSettings();

  useEffect(() => {
    if (networkSettings?.network) {
      loadPeers(networkSettings.network);
    }
  }, [networkSettings?.network, loadPeers]);

  if (isLoading && activePeers.length === 0 && bannedPeers.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <ActivePeersSection peers={activePeers} />
      <BannedPeersSection peers={bannedPeers} />
    </div>
  );
}
```

#### 3.2 Active Peers Section (`src/components/peers/active-peers-section.tsx`)
- Header with "Add Peer" button
- Table/Card list of active peers
- Columns: Label, Address, Type, Status (enabled/disabled), Last Seen, Actions
- Actions: Enable/Disable toggle, Edit, Ban, Delete (if not default)
- Empty state if no active peers

#### 3.3 Banned Peers Section (`src/components/peers/banned-peers-section.tsx`)
- Header with count
- Table/Card list of banned peers
- Columns: Label, Address, Banned At, Reason, Actions
- Actions: Delete (with confirmation: "This will remove the peer from your banned list")
- Empty state if no banned peers

#### 3.4 Dialogs
- **Add Peer Dialog**: Form with address, label, notes, network selection
- **Edit Peer Dialog**: Form to update label, notes
- **Ban Peer Dialog**: Form with optional reason textarea

### Phase 4: Sidebar Navigation

#### Update `src/components/layout/WalletSidebar.tsx`
Add "Peer Manager" link after "Address Book":
```typescript
{
  to: '/wallet/peers',
  label: 'Peer Manager',
  icon: Users,
},
```

## Implementation Order

1. ✅ Update planning docs
2. **Phase 1**: Backend (stores, services, IPC)
3. **Phase 2**: Frontend infrastructure (Zustand, API)
4. **Phase 3**: UI components (route, sections, dialogs)
5. **Phase 4**: Navigation integration
6. **Testing**: CRUD operations, ban/unban flows
7. **Polish**: Loading states, error handling, empty states

## UI Design Notes

- **Consistent with Wallet Routes**: Follow `/wallet/send` patterns
- **Shadcn Components**: Table, Card, Dialog, Badge, Switch
- **Type Badges**: Different colors for bootstrap/manual/discovered
- **Default Badge**: Special badge for protected default peers
- **Status Indicator**: Green dot for enabled, gray for disabled
- **Confirmation Dialogs**: For destructive actions (delete, ban)

## Next Steps

Ready to implement? Let's start with Phase 1 (Backend Infrastructure).
