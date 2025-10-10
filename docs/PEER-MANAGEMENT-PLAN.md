# Peer Management System Design

## Overview
System for managing Neptune Core peer addresses with persistence, UI management, and integration with CLI args builder.

## Current State Analysis

### Existing Peer-Related Code
1. **Settings Store** (`src/renderer/stores/neptune-core-settings-store.ts`)
   - Has `bootstrapPeers: string[]` in network settings
   - Currently empty array by default
   - Managed through settings forms

2. **Electron Store Usage**
   - `address-book-store.ts`: Stores receiving addresses
   - No dedicated peer store yet

3. **Settings Form** (`src/components/settings/network-settings-form.tsx`)
   - Has `bootstrapPeers` field (presumably multi-input?)
   - Needs verification of current implementation

## Proposed Architecture

### 1. **Peer Store** (`src/main/stores/peer-store.ts`)

```typescript
export interface PeerEntry {
  id: string;                    // UUID
  address: string;               // IP:PORT or domain:port
  label?: string;                // User-friendly name
  type: 'bootstrap' | 'manual' | 'discovered'; // Source of peer
  lastSeen?: number;             // Timestamp when last connected
  addedAt: number;               // Timestamp when added
  enabled: boolean;              // Whether to use this peer
  network: 'main' | 'testnet' | 'regtest'; // Which network this peer is for
  notes?: string;                // User notes
  isDefault: boolean;            // Hardcoded default peers (can't be deleted)
}

export interface PeerStore {
  peers: PeerEntry[];
}

// Schema
const peerStoreSchema = {
  peers: {
    type: 'array',
    default: [],
  },
};
```

**Features**:
- Persistent storage via electron-store
- Network-aware (peers are specific to main/testnet/regtest)
- Track peer source (bootstrap vs manually added vs discovered from network)
- Enable/disable peers without deleting
- Default peers are protected from deletion

### 2. **Default Bootstrap Peers** (`src/main/config/default-peers.ts`)

```typescript
export const DEFAULT_BOOTSTRAP_PEERS: Record<string, PeerEntry[]> = {
  main: [
    {
      id: 'default-main-1',
      address: '51.15.139.238:9798',
      label: 'Official Bootstrap Node 1',
      type: 'bootstrap',
      addedAt: Date.now(),
      enabled: true,
      network: 'main',
      isDefault: true,
    },
    {
      id: 'default-main-2',
      address: '139.162.193.206:9798',
      label: 'Official Bootstrap Node 2',
      type: 'bootstrap',
      addedAt: Date.now(),
      enabled: true,
      network: 'main',
      isDefault: true,
    },
  ],
  testnet: [
    // Testnet bootstrap peers
  ],
  regtest: [], // No bootstrap peers for regtest
};
```

### 3. **Peer Service** (`src/main/services/peer.service.ts`)

```typescript
export class PeerService {
  private store: Store<PeerStore>;
  
  constructor() {
    this.store = new Store<PeerStore>({
      name: 'peers',
      schema: peerStoreSchema,
      watch: true,
    });
    this.initializeDefaults();
  }
  
  // Initialize default peers on first run
  private initializeDefaults(): void;
  
  // CRUD Operations
  async addPeer(peer: Omit<PeerEntry, 'id' | 'addedAt'>): Promise<PeerEntry>;
  async updatePeer(id: string, updates: Partial<PeerEntry>): Promise<PeerEntry>;
  async deletePeer(id: string): Promise<void>; // Prevent deleting isDefault peers
  async getPeer(id: string): Promise<PeerEntry | null>;
  async getAllPeers(network?: string): Promise<PeerEntry[]>;
  
  // Filter Operations
  async getEnabledPeers(network: string): Promise<PeerEntry[]>;
  async getBootstrapPeers(network: string): Promise<PeerEntry[]>;
  async getManualPeers(network: string): Promise<PeerEntry[]>;
  
  // Bulk Operations
  async togglePeer(id: string, enabled: boolean): Promise<void>;
  async resetToDefaults(network: string): Promise<void>;
  
  // Validation
  validatePeerAddress(address: string): boolean; // IP:PORT or domain:port format
}
```

### 4. **IPC Handlers** (`src/main/ipc/handlers/peer-handlers.ts`)

```typescript
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
  
  ipcMain.handle('peer:getAll', async (_, network) => {
    return peerService.getAllPeers(network);
  });
  
  ipcMain.handle('peer:getEnabled', async (_, network) => {
    return peerService.getEnabledPeers(network);
  });
  
  ipcMain.handle('peer:toggle', async (_, id, enabled) => {
    return peerService.togglePeer(id, enabled);
  });
  
  ipcMain.handle('peer:resetToDefaults', async (_, network) => {
    return peerService.resetToDefaults(network);
  });
  
  ipcMain.handle('peer:validate', async (_, address) => {
    return peerService.validatePeerAddress(address);
  });
}
```

### 5. **Zustand Store** (`src/renderer/stores/peer-store.ts`)

```typescript
interface PeerState {
  peers: PeerEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadPeers: (network: string) => Promise<void>;
  addPeer: (peer: Omit<PeerEntry, 'id' | 'addedAt'>) => Promise<void>;
  updatePeer: (id: string, updates: Partial<PeerEntry>) => Promise<void>;
  deletePeer: (id: string) => Promise<void>;
  togglePeer: (id: string, enabled: boolean) => Promise<void>;
  resetToDefaults: (network: string) => Promise<void>;
}

export const usePeerStore = create<PeerState>((set, get) => ({
  peers: [],
  isLoading: false,
  error: null,
  
  loadPeers: async (network) => {
    set({ isLoading: true, error: null });
    try {
      const peers = await window.api.peer.getAll(network);
      set({ peers, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  // ... other actions
}));
```

### 6. **UI Component** (`src/components/settings/peer-manager.tsx`)

```typescript
/**
 * Peer Management UI Component
 * 
 * Features:
 * - List of peers with enable/disable toggle
 * - Add new peer dialog
 * - Edit peer details
 * - Delete peer (except defaults)
 * - Filter by network
 * - Visual distinction between bootstrap/manual/discovered peers
 * - Default peers marked and protected
 */
export function PeerManager() {
  const { peers, loadPeers, addPeer, togglePeer, deletePeer } = usePeerStore();
  const { network } = useNetworkSettings();
  
  useEffect(() => {
    loadPeers(network);
  }, [network]);
  
  return (
    <div>
      {/* Peer list with shadcn Table or custom list */}
      {/* Add peer button -> Dialog */}
      {/* Inline edit/delete actions */}
    </div>
  );
}
```

## Integration with CLI Args Builder

### Settings → Peers Flow

```typescript
// In NeptuneCoreArgsBuilder
buildArgs(settings: NeptuneCoreSettings): string[] {
  const args: string[] = [];
  
  // ... other args
  
  // Get enabled bootstrap peers for current network
  const enabledPeers = await peerService.getEnabledPeers(settings.network.network);
  
  // Add each peer as --peer flag
  for (const peer of enabledPeers) {
    args.push('--peer', peer.address);
  }
  
  // ... rest of args
  
  return args;
}
```

### Decoupling Settings from Peers

**Current**: `settings.network.bootstrapPeers: string[]`  
**Proposed**: Remove from settings, use dedicated peer store

**Benefits**:
1. **Separation of Concerns**: Settings are config, peers are managed entities
2. **Richer Metadata**: Can store labels, notes, last seen, etc.
3. **Network-Specific**: Peers automatically filtered by network
4. **Better UX**: Dedicated peer management UI instead of text field array
5. **Protected Defaults**: Can't accidentally delete bootstrap nodes

## Migration Strategy

### Phase 1: Create Peer Store (This Phase)
1. Create peer store schema and service
2. Create IPC handlers
3. Create Zustand store
4. Populate with default bootstrap peers
5. Migrate any existing `bootstrapPeers` from settings to peer store

### Phase 2: Peer Management UI
1. Create peer manager component
2. Add to Network settings tab
3. Implement CRUD operations
4. Add validation (IP:PORT format)

### Phase 3: Integration with CLI Args Builder
1. Query enabled peers from peer store
2. Build `--peer` flags
3. Remove `bootstrapPeers` from settings schema (deprecated)

### Phase 4: Advanced Features (Future)
1. Peer discovery from network
2. Peer health tracking (last seen, latency)
3. Auto-disable unreachable peers
4. Import/export peer lists
5. Peer reputation system

## Data Validation

### Peer Address Format
```typescript
// Valid formats:
// - IPv4:PORT -> "192.168.1.1:9798"
// - IPv6:PORT -> "[2001:db8::1]:9798"
// - Domain:PORT -> "node.neptune.cash:9798"

const PEER_ADDRESS_REGEX = /^(\[?[a-zA-Z0-9\-\.:]+\]?):(\d{1,5})$/;

function validatePeerAddress(address: string): boolean {
  if (!PEER_ADDRESS_REGEX.test(address)) return false;
  
  const port = parseInt(address.split(':').pop()!);
  return port > 0 && port <= 65535;
}
```

## Security Considerations

1. **Input Validation**: Validate peer addresses to prevent injection
2. **Rate Limiting**: Limit how many peers can be added
3. **Network Isolation**: Don't allow mainnet peers to be used on testnet
4. **Default Protection**: Prevent deletion/modification of default bootstrap peers

## Open Questions

1. **Peer Limit**: What's the maximum number of custom peers we should allow?
2. **Auto-Discovery**: Should we implement peer discovery from connected peers?
3. **Peer Sharing**: Should users be able to export/share peer lists?
4. **Health Monitoring**: Should we track peer connectivity status?
5. **Default Strategy**: If all peers are disabled, should we fallback to hardcoded defaults?

## File Structure

```
src/
├── main/
│   ├── config/
│   │   └── default-peers.ts          # Default bootstrap peers
│   ├── services/
│   │   └── peer.service.ts           # Peer CRUD and business logic
│   ├── stores/
│   │   └── peer-store.ts             # Electron-store wrapper
│   └── ipc/
│       └── handlers/
│           └── peer-handlers.ts      # IPC handlers
├── renderer/
│   └── stores/
│       └── peer-store.ts             # Zustand store
└── components/
    └── settings/
        ├── peer-manager.tsx          # Main peer management UI
        ├── add-peer-dialog.tsx       # Add peer dialog
        └── peer-list-item.tsx        # Individual peer component
```

## Next Steps

1. Review and approve this design
2. Implement peer store infrastructure
3. Create peer management UI
4. Integrate with CLI args builder
5. Remove deprecated `bootstrapPeers` from settings

---

**Note**: This should be implemented BEFORE the CLI args builder to ensure clean separation of concerns.
