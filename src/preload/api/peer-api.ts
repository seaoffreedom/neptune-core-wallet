import { ipcRenderer } from 'electron';
import type { PeerEntry } from '../../main/stores/peer-store';

export const peerAPI = {
  add: (peer: Omit<PeerEntry, 'id' | 'addedAt'>) =>
    ipcRenderer.invoke('peer:add', peer),

  update: (id: string, updates: Partial<PeerEntry>) =>
    ipcRenderer.invoke('peer:update', id, updates),

  delete: (id: string) => ipcRenderer.invoke('peer:delete', id),

  get: (id: string) => ipcRenderer.invoke('peer:get', id),

  getAll: (network?: string) => ipcRenderer.invoke('peer:getAll', network),

  getActive: (network?: string) =>
    ipcRenderer.invoke('peer:getActive', network),

  getBanned: (network?: string) =>
    ipcRenderer.invoke('peer:getBanned', network),

  toggle: (id: string, enabled: boolean) =>
    ipcRenderer.invoke('peer:toggle', id, enabled),

  ban: (id: string, reason?: string) =>
    ipcRenderer.invoke('peer:ban', id, reason),

  // Note: No unban method needed - just use delete

  validate: (address: string) => ipcRenderer.invoke('peer:validate', address),
};
