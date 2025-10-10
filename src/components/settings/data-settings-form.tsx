/**
 * Data Settings Form
 *
 * Form for configuring Neptune Core data and storage settings including
 * data directory, block import, and validation options.
 */

import { FolderOpen } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { DataSettingsFormData } from "@/lib/validation/settings-schemas";
import { useUpdateDataSettings } from "@/store/neptune-core-settings.store";

interface DataSettingsFormProps {
    form: UseFormReturn<DataSettingsFormData>;
}

export function DataSettingsForm({ form }: DataSettingsFormProps) {
    const updateDataSettings = useUpdateDataSettings();
    const [isSelectingDataDir, setIsSelectingDataDir] = useState(false);
    const [isSelectingImportDir, setIsSelectingImportDir] = useState(false);

    const handleFieldChange = (field: string, value: unknown) => {
        updateDataSettings({
            [field]: value,
        } as Partial<DataSettingsFormData>);
    };

    const handleSelectFolder = async (
        fieldName: "dataDir" | "importBlocksFromDirectory",
    ) => {
        const isDataDir = fieldName === "dataDir";
        const setLoading = isDataDir
            ? setIsSelectingDataDir
            : setIsSelectingImportDir;

        setLoading(true);
        try {
            const result = await window.electronAPI.openDialog({
                title: isDataDir
                    ? "Select Data Directory"
                    : "Select Import Blocks Directory",
                properties: ["openDirectory"],
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const selectedPath = result.filePaths[0];
                form.setValue(fieldName, selectedPath);
                handleFieldChange(fieldName, selectedPath);
            }
        } catch (error) {
            console.error("Error selecting folder:", error);
        } finally {
            setLoading(false);
        }
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
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="e.g., /path/to/data"
                                                onChange={(e) => {
                                                    field.onChange(
                                                        e.target.value,
                                                    );
                                                    handleFieldChange(
                                                        "dataDir",
                                                        e.target.value,
                                                    );
                                                }}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSelectFolder(
                                                            "dataDir",
                                                        )
                                                    }
                                                    disabled={
                                                        isSelectingDataDir
                                                    }
                                                >
                                                    <FolderOpen className="h-4 w-4" />
                                                </Button>
                                            </InputGroupAddon>
                                        </InputGroup>
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
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="e.g., /path/to/blocks"
                                                onChange={(e) => {
                                                    field.onChange(
                                                        e.target.value,
                                                    );
                                                    handleFieldChange(
                                                        "importBlocksFromDirectory",
                                                        e.target.value,
                                                    );
                                                }}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSelectFolder(
                                                            "importBlocksFromDirectory",
                                                        )
                                                    }
                                                    disabled={
                                                        isSelectingImportDir
                                                    }
                                                >
                                                    <FolderOpen className="h-4 w-4" />
                                                </Button>
                                            </InputGroupAddon>
                                        </InputGroup>
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
                                                    10,
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
