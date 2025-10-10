/**
 * Network Settings Form
 *
 * Form for configuring Neptune Core network settings including
 * peer management, ports, and connection parameters.
 */

import type { UseFormReturn } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { NetworkSettingsFormData } from "@/lib/validation/settings-schemas";
import { useUpdateNetworkSettings } from "@/store/neptune-core-settings.store";

interface NetworkSettingsFormProps {
    form: UseFormReturn<NetworkSettingsFormData>;
}

export function NetworkSettingsForm({ form }: NetworkSettingsFormProps) {
    const updateNetworkSettings = useUpdateNetworkSettings();

    // Helper to update both form and Zustand
    const handleFieldChange = (field: string, value: unknown) => {
        // Update Zustand store immediately
        updateNetworkSettings({
            [field]: value,
        } as Partial<NetworkSettingsFormData>);
    };

    return (
        <Form {...form}>
            <form className="space-y-6">
                {/* Basic Network Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Basic Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Network Type */}
                        <FormField
                            control={form.control}
                            name="network"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Network Type</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            handleFieldChange("network", value);
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select network" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="main">
                                                Main
                                            </SelectItem>
                                            <SelectItem value="alpha">
                                                Alpha
                                            </SelectItem>
                                            <SelectItem value="beta">
                                                Beta
                                            </SelectItem>
                                            <SelectItem value="testnet">
                                                Testnet
                                            </SelectItem>
                                            <SelectItem value="regtest">
                                                Regtest
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The blockchain network to connect to
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Peer Port */}
                        <FormField
                            control={form.control}
                            name="peerPort"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Peer Port</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "peerPort",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Port for peer-to-peer connections
                                        (1-65535)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* RPC Port */}
                        <FormField
                            control={form.control}
                            name="rpcPort"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>RPC Port</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "rpcPort",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Port for RPC server (1-65535)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Peer Listen Address */}
                        <FormField
                            control={form.control}
                            name="peerListenAddr"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Peer Listen Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handleFieldChange(
                                                    "peerListenAddr",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Address to listen for peer connections
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Peer Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Peer Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Max Peers */}
                        <FormField
                            control={form.control}
                            name="maxNumPeers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Peers</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "maxNumPeers",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum number of peer connections
                                        (0-1000)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Peer Tolerance */}
                        <FormField
                            control={form.control}
                            name="peerTolerance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Peer Tolerance</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "peerTolerance",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Peer connection tolerance (1-10000)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Reconnect Cooldown */}
                        <FormField
                            control={form.control}
                            name="reconnectCooldown"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reconnect Cooldown</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "reconnectCooldown",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Cooldown period before reconnection
                                        attempts (seconds, 0-86400)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Boolean Options */}
                        <FormField
                            control={form.control}
                            name="restrictPeersToList"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Restrict Peers to List
                                        </FormLabel>
                                        <FormDescription>
                                            Only connect to peers from the
                                            configured list
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "restrictPeersToList",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bootstrap"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Bootstrap
                                        </FormLabel>
                                        <FormDescription>
                                            Enable bootstrap mode for initial
                                            peer discovery
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "bootstrap",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
