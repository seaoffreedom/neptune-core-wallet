/**
 * Performance Settings Form
 *
 * Form for configuring Neptune Core performance settings including
 * proof parameters, sync mode, mempool size, and UTXO settings.
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PerformanceSettingsFormData } from "@/lib/validation/settings-schemas";
import { useUpdatePerformanceSettings } from "@/store/neptune-core-settings.store";

interface PerformanceSettingsFormProps {
    form: UseFormReturn<PerformanceSettingsFormData>;
}

export function PerformanceSettingsForm({
    form,
}: PerformanceSettingsFormProps) {
    const updatePerformanceSettings = useUpdatePerformanceSettings();

    const handleFieldChange = (field: string, value: unknown) => {
        updatePerformanceSettings({
            [field]: value,
        } as Partial<PerformanceSettingsFormData>);
    };

    return (
        <Form {...form}>
            <form className="space-y-6">
                {/* Proof Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Proof Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Max Log2 Padded Height */}
                        <FormField
                            control={form.control}
                            name="maxLog2PaddedHeightForProofs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Max Log2 Padded Height for Proofs
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="10"
                                            max="32"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    ? Number.parseInt(
                                                          e.target.value,
                                                      )
                                                    : undefined;
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "maxLog2PaddedHeightForProofs",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum log2 padded height for proofs
                                        (10-32, optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Max Num Proofs */}
                        <FormField
                            control={form.control}
                            name="maxNumProofs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Maximum Number of Proofs
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "maxNumProofs",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum number of concurrent proofs
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Triton VM Env Vars */}
                        <FormField
                            control={form.control}
                            name="tritonVmEnvVars"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Triton VM Environment Variables
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="e.g., VAR1=value1,VAR2=value2"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handleFieldChange(
                                                    "tritonVmEnvVars",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Environment variables for Triton VM
                                        (optional, comma-separated)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Sync & Mempool */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Sync & Mempool Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Sync Mode Threshold */}
                        <FormField
                            control={form.control}
                            name="syncModeThreshold"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sync Mode Threshold</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="10"
                                            max="100000"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "syncModeThreshold",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Block height difference threshold for
                                        sync mode (10-100000)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Max Mempool Size */}
                        <FormField
                            control={form.control}
                            name="maxMempoolSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Mempool Size</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="e.g., 1G, 500M, 100K"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handleFieldChange(
                                                    "maxMempoolSize",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum mempool size (format: 1G, 500M,
                                        100K)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Transaction & UTXO */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Transaction & UTXO Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* TX Proving Capability */}
                        <FormField
                            control={form.control}
                            name="txProvingCapability"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Transaction Proving Capability
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            handleFieldChange(
                                                "txProvingCapability",
                                                value,
                                            );
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select proving capability" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="lockscript">
                                                Lockscript
                                            </SelectItem>
                                            <SelectItem value="singleproof">
                                                Single Proof
                                            </SelectItem>
                                            <SelectItem value="proofcollection">
                                                Proof Collection
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Transaction proving capability level
                                        (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Number of MPS per UTXO */}
                        <FormField
                            control={form.control}
                            name="numberOfMpsPerUtxo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Number of MPS per UTXO
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "numberOfMpsPerUtxo",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Number of membership proofs per UTXO
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
