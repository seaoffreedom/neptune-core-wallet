import { Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePeerInfo } from "@/renderer/hooks/use-onchain-data";
import { usePeerStore } from "@/renderer/stores/peer-store";
import { useNetworkSettings } from "@/store/neptune-core-settings.store";

interface CliPeer {
    address: string;
    port: number;
    connected: boolean;
    lastSeen: number;
}

export function CliPeersSection() {
    const {
        peers: cliPeers,
        peerCount,
        isRefreshing,
        fetchPeerInfo,
    } = usePeerInfo();
    const { addPeer, activePeers } = usePeerStore();
    const networkSettings = useNetworkSettings();
    const [isAddingPeer, setIsAddingPeer] = useState<string | null>(null);

    const currentNetwork = networkSettings?.network || "main";

    // Check if a CLI peer is already stored in our peer store
    const isPeerStored = (cliPeer: CliPeer): boolean => {
        const cliFullAddress = `${cliPeer.address}:${cliPeer.port}`;

        return activePeers.some((storedPeer) => {
            // Check if the stored peer matches either:
            // 1. Full address format (IP:PORT)
            // 2. Just the IP address (for backward compatibility)
            const addressMatches =
                storedPeer.address === cliFullAddress ||
                storedPeer.address === cliPeer.address ||
                storedPeer.address.startsWith(`${cliPeer.address}:`);

            return addressMatches && storedPeer.network === currentNetwork;
        });
    };

    // Add a CLI peer to the peer store
    const handleAddPeer = async (cliPeer: CliPeer) => {
        setIsAddingPeer(`${cliPeer.address}:${cliPeer.port}`);

        try {
            await addPeer({
                address: `${cliPeer.address}:${cliPeer.port}`,
                label: `Discovered peer (${cliPeer.address})`,
                type: "discovered",
                lastSeen: cliPeer.lastSeen,
                enabled: true,
                network: currentNetwork as "main" | "testnet" | "regtest",
                notes: `Auto-discovered via CLI on ${new Date(cliPeer.lastSeen).toLocaleString()}`,
                isDefault: false,
                isBanned: false,
            });

            showSuccessToast(
                `Added peer ${cliPeer.address}:${cliPeer.port} to peer store`,
            );
        } catch (error) {
            console.error("Failed to add peer:", error);
            showErrorToast(`Failed to add peer: ${(error as Error).message}`);
        } finally {
            setIsAddingPeer(null);
        }
    };

    // Format last seen time
    const formatLastSeen = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) {
            // Less than 1 minute
            return "Just now";
        } else if (diff < 3600000) {
            // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) {
            // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return new Date(timestamp).toLocaleDateString();
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <Wifi className="h-5 w-5" />
                            Connected Peers (CLI)
                        </CardTitle>
                        <Badge variant="secondary">{peerCount} connected</Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPeerInfo}
                        disabled={isRefreshing}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Peers discovered via Neptune CLI. Click "Add to Store" to
                    permanently save them.
                </p>
            </CardHeader>
            <CardContent>
                {cliPeers.length === 0 ? (
                    <div className="text-center py-8">
                        <WifiOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No connected peers found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Make sure Neptune Core is running and connected to
                            the network
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Address</TableHead>
                                <TableHead>Port</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Seen</TableHead>
                                <TableHead>Stored</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cliPeers.map((peer) => {
                                const isStored = isPeerStored(peer);
                                const isAdding =
                                    isAddingPeer ===
                                    `${peer.address}:${peer.port}`;

                                return (
                                    <TableRow
                                        key={`${peer.address}:${peer.port}`}
                                    >
                                        <TableCell className="font-mono">
                                            {peer.address}
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            {peer.port}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    peer.connected
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className="flex items-center gap-1 w-fit"
                                            >
                                                {peer.connected ? (
                                                    <>
                                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                        Connected
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full" />
                                                        Disconnected
                                                    </>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatLastSeen(peer.lastSeen)}
                                        </TableCell>
                                        <TableCell>
                                            {isStored ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600 border-green-600"
                                                >
                                                    Stored
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-amber-600 border-amber-600"
                                                >
                                                    Fresh
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isStored ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                >
                                                    Already Stored
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddPeer(peer)
                                                    }
                                                    disabled={isAdding}
                                                >
                                                    {isAdding ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                            Adding...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add to Store
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
