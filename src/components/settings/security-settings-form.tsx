/**
 * Security Settings Form
 *
 * Form for configuring Neptune Core security settings including
 * cookie management, banned IPs, and notification preferences.
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
import type { SecuritySettingsFormData } from "@/lib/validation/settings-schemas";
import { useUpdateSecuritySettings } from "@/store/neptune-core-settings.store";

interface SecuritySettingsFormProps {
    form: UseFormReturn<SecuritySettingsFormData>;
}

export function SecuritySettingsForm({ form }: SecuritySettingsFormProps) {
    const updateSecuritySettings = useUpdateSecuritySettings();

    const handleFieldChange = (field: string, value: unknown) => {
        updateSecuritySettings({
            [field]: value,
        } as Partial<SecuritySettingsFormData>);
    };

    return (
        <Form {...form}>
            <form className="space-y-6">
                {/* Authentication & Access */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Authentication & Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Disable Cookie Hint */}
                        <FormField
                            control={form.control}
                            name="disableCookieHint"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Disable Cookie Hint
                                        </FormLabel>
                                        <FormDescription>
                                            Disable display of cookie hint on
                                            startup
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "disableCookieHint",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* No Transaction Initiation */}
                        <FormField
                            control={form.control}
                            name="noTransactionInitiation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            No Transaction Initiation
                                        </FormLabel>
                                        <FormDescription>
                                            Prevent initiation of new
                                            transactions
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(value) => {
                                                field.onChange(value);
                                                handleFieldChange(
                                                    "noTransactionInitiation",
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

                {/* Fee Notification */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Fee Notification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="feeNotification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fee Notification Type</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            handleFieldChange(
                                                "feeNotification",
                                                value,
                                            );
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select notification type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="on-chain-symmetric">
                                                On-Chain Symmetric
                                            </SelectItem>
                                            <SelectItem value="on-chain-generation">
                                                On-Chain Generation
                                            </SelectItem>
                                            <SelectItem value="off-chain">
                                                Off-Chain
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Type of fee notification mechanism
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Scanning & Monitoring */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Scanning & Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Scan Blocks */}
                        <FormField
                            control={form.control}
                            name="scanBlocks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scan Blocks</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="e.g., 0-100,200-300"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handleFieldChange(
                                                    "scanBlocks",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Block ranges to scan (optional, e.g.,
                                        0-100,200-300)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Scan Keys */}
                        <FormField
                            control={form.control}
                            name="scanKeys"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scan Keys</FormLabel>
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
                                                    "scanKeys",
                                                    value,
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Number of keys to scan (optional)
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
