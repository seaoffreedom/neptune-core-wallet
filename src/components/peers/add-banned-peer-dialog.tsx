/**
 * Add Banned Peer Dialog
 *
 * Dialog for directly adding a peer to the banned list
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
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
import { Textarea } from "@/components/ui/textarea";
import { usePeerStore } from "@/renderer/stores/peer-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

const addBannedPeerSchema = z.object({
    address: z
        .string()
        .min(1, { message: "Address is required" })
        .regex(/^(\[?[a-zA-Z0-9\-.:]+\]?):(\d{1,5})$/, {
            message: "Invalid address format (use IP:PORT or domain:port)",
        }),
    label: z
        .string()
        .max(50, { message: "Label must be less than 50 characters" })
        .optional(),
    reason: z
        .string()
        .max(200, { message: "Reason must be less than 200 characters" })
        .optional(),
});

type AddBannedPeerFormValues = z.infer<typeof addBannedPeerSchema>;

interface AddBannedPeerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    network: string;
}

export function AddBannedPeerDialog({
    open,
    onOpenChange,
    network,
}: AddBannedPeerDialogProps) {
    const { addPeer } = usePeerStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AddBannedPeerFormValues>({
        resolver: zodResolver(addBannedPeerSchema),
        defaultValues: {
            address: "",
            label: "",
            reason: "",
        },
    });

    const handleSubmit = async (values: AddBannedPeerFormValues) => {
        setIsSubmitting(true);
        try {
            // Validate address format via RPC
            const isValid = await window.electronAPI.peer.validate(
                values.address,
            );
            if (!isValid) {
                form.setError("address", {
                    type: "manual",
                    message: "Invalid peer address format",
                });
                setIsSubmitting(false);
                return;
            }

            // Add peer directly as banned
            await addPeer({
                address: values.address,
                label: values.label,
                type: "manual",
                enabled: false,
                network: network as "main" | "testnet" | "regtest",
                isDefault: false,
                isBanned: true,
                bannedAt: Date.now(),
                bannedReason: values.reason,
            });

            showSuccessToast("Peer added to banned list");
            onOpenChange(false);
            form.reset();
        } catch (error) {
            showErrorToast("Failed to add banned peer");
            console.error("Add banned peer error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Banned Peer</DialogTitle>
                    <DialogDescription>
                        Add a peer directly to your banned list. This peer will
                        not be able to connect to your node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        {/* Address Field */}
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Field>
                                            <Input
                                                placeholder="e.g., 192.168.1.100:9798"
                                                className="font-mono"
                                                {...field}
                                            />
                                        </Field>
                                    </FormControl>
                                    <FormDescription>
                                        IP address or domain with port (IP:PORT)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Label Field */}
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label (Optional)</FormLabel>
                                    <FormControl>
                                        <Field>
                                            <Input
                                                placeholder="e.g., Malicious Node"
                                                {...field}
                                            />
                                        </Field>
                                    </FormControl>
                                    <FormDescription>
                                        A friendly name for this peer
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Reason Field */}
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason (Optional)</FormLabel>
                                    <FormControl>
                                        <Field>
                                            <Textarea
                                                placeholder="Why are you banning this peer?"
                                                rows={3}
                                                {...field}
                                            />
                                        </Field>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Ban className="mr-2 h-4 w-4" />
                                        Ban Peer
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
