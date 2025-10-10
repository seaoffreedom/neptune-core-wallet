/**
 * Data Settings Form
 *
 * Form for configuring Neptune Core data and storage settings including
 * data directory, block import, and validation options.
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
import type { DataSettingsFormData } from "@/lib/validation/settings-schemas";
import { useUpdateDataSettings } from "@/store/neptune-core-settings.store";

interface DataSettingsFormProps {
    form: UseFormReturn<DataSettingsFormData>;
}

export function DataSettingsForm({ form }: DataSettingsFormProps) {
    const updateDataSettings = useUpdateDataSettings();

    const handleFieldChange = (field: string, value: unknown) => {
        updateDataSettings({
            [field]: value,
        } as Partial<DataSettingsFormData>);
    };

    return (
        <Form {...form}>
            <form className="space-y-6">
                {/* Data Directory */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Data Directory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="dataDir"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data Directory Path</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="e.g., /path/to/data"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handleFieldChange(
                                                    "dataDir",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Custom data directory path (optional,
                                        defaults to system default)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Block Import */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Block Import Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Import Blocks Directory */}
                        <FormField
                            control={form.control}
                            name="importBlocksFromDirectory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Import Blocks From Directory
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="e.g., /path/to/blocks"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handleFieldChange(
                                                    "importBlocksFromDirectory",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Directory to import blocks from
                                        (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Import Block Flush Period */}
                        <FormField
                            control={form.control}
                            name="importBlockFlushPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Import Block Flush Period
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "importBlockFlushPeriod",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Flush period for block import (seconds)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Disable Validation */}
                        <FormField
                            control={form.control}
                            name="disableValidationInBlockImport"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Disable Validation in Block Import
                                        </FormLabel>
                                        <FormDescription>
                                            Skip validation during block import
                                            (use with caution)
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "disableValidationInBlockImport",
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
