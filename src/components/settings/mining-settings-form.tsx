/**
 * Mining Settings Form
 *
 * Form for configuring Neptune Core mining settings including
 * proof upgrading, block composition, and guessing parameters.
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MiningSettingsFormData } from "@/lib/validation/settings-schemas";
import { useUpdateMiningSettings } from "@/store/neptune-core-settings.store";

interface MiningSettingsFormProps {
    form: UseFormReturn<MiningSettingsFormData>;
}

export function MiningSettingsForm({ form }: MiningSettingsFormProps) {
    const updateMiningSettings = useUpdateMiningSettings();

    const handleFieldChange = (field: string, value: unknown) => {
        updateMiningSettings({
            [field]: value,
        } as Partial<MiningSettingsFormData>);
    };

    return (
        <Form {...form}>
            <form className="space-y-6">
                {/* Step 1: Proof Upgrading */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Step 1: Proof Upgrading
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* TX Proof Upgrading */}
                        <FormField
                            control={form.control}
                            name="txProofUpgrading"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Transaction Proof Upgrading
                                        </FormLabel>
                                        <FormDescription>
                                            Enable upgrading of transaction
                                            proofs
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "txProofUpgrading",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* TX Upgrade Filter */}
                        <FormField
                            control={form.control}
                            name="txUpgradeFilter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Transaction Upgrade Filter
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="Optional filter expression"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handleFieldChange(
                                                    "txUpgradeFilter",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Filter for which transactions to upgrade
                                        (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Gobbling Fraction */}
                        <FormField
                            control={form.control}
                            name="gobblingFraction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gobbling Fraction</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseFloat(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "gobblingFraction",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Fraction of block space for gobbling
                                        (0-1)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Min Gobbling Fee */}
                        <FormField
                            control={form.control}
                            name="minGobblingFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Gobbling Fee</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.000001"
                                            min="0"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseFloat(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "minGobblingFee",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Minimum fee for gobbling transactions
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Step 2: Block Composition */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Step 2: Block Composition
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Compose */}
                        <FormField
                            control={form.control}
                            name="compose"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Block Composition
                                        </FormLabel>
                                        <FormDescription>
                                            Enable block composition (mining)
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "compose",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Max Num Compose Mergers */}
                        <FormField
                            control={form.control}
                            name="maxNumComposeMergers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Compose Mergers</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value, 10
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "maxNumComposeMergers",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum number of concurrent compose
                                        mergers
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Secret Compositions */}
                        <FormField
                            control={form.control}
                            name="secretCompositions"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Secret Compositions
                                        </FormLabel>
                                        <FormDescription>
                                            Keep block compositions secret until
                                            found
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "secretCompositions",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Ignore Foreign Compositions */}
                        <FormField
                            control={form.control}
                            name="ignoreForeignCompositions"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Ignore Foreign Compositions
                                        </FormLabel>
                                        <FormDescription>
                                            Ignore block compositions from other
                                            miners
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "ignoreForeignCompositions",
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

                {/* Step 3: Guessing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Step 3: Guessing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Guess */}
                        <FormField
                            control={form.control}
                            name="guess"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Guessing
                                        </FormLabel>
                                        <FormDescription>
                                            Enable proof-of-work guessing
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "guess",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Guesser Threads */}
                        <FormField
                            control={form.control}
                            name="guesserThreads"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Guesser Threads</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    ? Number.parseInt(
                                                          e.target.value, 10
                                                      )
                                                    : undefined;
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "guesserThreads",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Number of threads for guessing
                                        (optional, defaults to CPU count)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Guesser Fraction */}
                        <FormField
                            control={form.control}
                            name="guesserFraction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Guesser Fraction</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseFloat(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "guesserFraction",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Fraction of CPU time for guessing (0-1)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Minimum Guesser Fraction */}
                        <FormField
                            control={form.control}
                            name="minimumGuesserFraction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Minimum Guesser Fraction
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseFloat(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "minimumGuesserFraction",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Minimum guesser fraction threshold (0-1)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Minimum Guesser Improvement Fraction */}
                        <FormField
                            control={form.control}
                            name="minimumGuesserImprovementFraction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Minimum Guesser Improvement Fraction
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseFloat(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "minimumGuesserImprovementFraction",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Minimum improvement fraction for
                                        guessing (0-1)
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
