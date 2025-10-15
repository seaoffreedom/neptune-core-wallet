import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_BOOTSTRAP_PEERS } from '../config/default-peers';
import { type PeerEntry, peerStore } from '../stores/peer-store';

const logger = pino({ level: 'info' });

export class PeerService {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    const peers = peerStore.get('peers');
    if (peers.length === 0) {
      // Initialize with defaults for all networks
      const allDefaults: PeerEntry[] = [];
      for (const [_network, networkPeers] of Object.entries(
        DEFAULT_BOOTSTRAP_PEERS
      )) {
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

  async updatePeer(
    id: string,
    updates: Partial<PeerEntry>
  ): Promise<PeerEntry> {
    const peers = peerStore.get('peers');
    const index = peers.findIndex((p: PeerEntry) => p.id === id);

    if (index === -1) {
      throw new Error(`Peer with id ${id} not found`);
    }

    peers[index] = { ...peers[index], ...updates };
    peerStore.set('peers', peers);

    return peers[index];
  }

  async deletePeer(id: string): Promise<void> {
    const peers = peerStore.get('peers');
    const peer = peers.find((p: PeerEntry) => p.id === id);

    if (peer?.isDefault) {
      throw new Error('Cannot delete default bootstrap peer');
    }

    const filtered = peers.filter((p: PeerEntry) => p.id !== id);
    peerStore.set('peers', filtered);
  }

  async getPeer(id: string): Promise<PeerEntry | null> {
    const peers = peerStore.get('peers');
    return peers.find((p) => p.id === id) || null;
  }

  async getAllPeers(network?: string): Promise<PeerEntry[]> {
    const peers = peerStore.get('peers');
    if (network) {
      return peers.filter((p: PeerEntry) => p.network === network);
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
    const regex = /^(\[?[a-zA-Z0-9\-.:]+\]?):(\d{1,5})$/;
    if (!regex.test(address)) return false;

    const parts = address.split(':');
    const portStr = parts[parts.length - 1];
    if (!portStr) return false;

    const port = Number.parseInt(portStr, 10);
    return port > 0 && port <= 65535;
  }
}

// Lazy singleton instance
let _peerServiceInstance: PeerService | null = null;

/**
 * Get the singleton PeerService instance (lazy initialization)
 */
export function getPeerService(): PeerService {
  if (!_peerServiceInstance) {
    _peerServiceInstance = new PeerService();
    logger.info('PeerService instance created (lazy initialization)');
  }
  return _peerServiceInstance;
}

// Backward compatibility - keep the old export for existing code
export const peerService = new Proxy({} as PeerService, {
  get(_target, prop: string | symbol) {
    const instance = getPeerService();
    const value = (instance as unknown as Record<string, unknown>)[
      prop as string
    ];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
