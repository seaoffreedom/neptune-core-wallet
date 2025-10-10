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
