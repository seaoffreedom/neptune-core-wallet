/**
 * Enhanced Send Form Component
 *
 * Supports sending to multiple recipients and address book integration
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Copy,
    ExternalLink,
    Loader2,
    Plus,
    Trash2,
    Users,
} from "lucide-react";
import { useState, useId } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { Field } from "@/components/ui/field";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
    useAddressValidation,
    useSendTransaction,
} from "@/renderer/hooks/use-onchain-data";
import { useOnchainStore } from "@/store/onchain.store";
import { truncateAddress } from "@/lib/utils";
import { AddressBookSelect } from "./address-book-select";

// Form validation schema
const recipientSchema = z.object({
    address: z
        .string()
        .min(1, { message: "Recipient address is required" })
        .refine((val) => val.trim().length > 0, {
            message: "Address cannot be empty",
        }),
    amount: z
        .string()
        .min(1, { message: "Amount is required" })
        .refine(
            (val) => {
                const num = parseFloat(val);
                return !Number.isNaN(num) && num > 0;
            },
            { message: "Amount must be a positive number" },
        ),
});

const sendFormSchema = z.object({
    recipients: z.array(recipientSchema).min(1, {
        message: "At least one recipient is required",
    }),
    fee: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === "") return true;
                const num = parseFloat(val);
                return !Number.isNaN(num) && num >= 0;
            },
            { message: "Fee must be a positive number or zero" },
        ),
});

type SendFormValues = z.infer<typeof sendFormSchema>;

export function SendFormEnhanced() {
    const navigate = useNavigate();
    const { sendTransaction, isSending, error, txId, reset } =
        useSendTransaction();
    const { validateAddress, validateAmount } = useAddressValidation();
    const confirmedBalance = useOnchainStore(
        (state) => state.dashboardData?.confirmed_available_balance,
    );

    const [isValidating, setIsValidating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showMultiple, setShowMultiple] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmChecked, setConfirmChecked] = useState(false);
    const [pendingTransaction, setPendingTransaction] =
        useState<SendFormValues | null>(null);
    const confirmId = useId();

    const form = useForm<SendFormValues>({
        resolver: zodResolver(sendFormSchema),
        defaultValues: {
            recipients: [{ address: "", amount: "" }],
            fee: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "recipients",
    });

    const onSubmit = async (values: SendFormValues) => {
        setIsValidating(true);

        // Validate all addresses
        for (let i = 0; i < values.recipients.length; i++) {
            const recipient = values.recipients[i];
            const isValidAddr = await validateAddress(recipient.address);

            if (!isValidAddr) {
                form.setError(`recipients.${i}.address`, {
                    type: "manual",
                    message: "Invalid Neptune address format",
                });
                setIsValidating(false);
                return;
            }

            const isValidAmt = await validateAmount(recipient.amount);

            if (!isValidAmt) {
                form.setError(`recipients.${i}.amount`, {
                    type: "manual",
                    message: "Invalid amount format",
                });
                setIsValidating(false);
                return;
            }
        }

        setIsValidating(false);

        // Check total balance
        if (confirmedBalance) {
            const balance = parseFloat(confirmedBalance);
            const totalAmount = values.recipients.reduce(
                (sum, r) => sum + parseFloat(r.amount),
                0,
            );
            const fee = values.fee ? parseFloat(values.fee) : 0;

            if (totalAmount + fee > balance) {
                form.setError("recipients.0.amount", {
                    type: "manual",
                    message: `Insufficient balance. Total: ${(totalAmount + fee).toFixed(2)} NPT, Available: ${balance.toFixed(2)} NPT`,
                });
                return;
            }
        }

        // Show confirmation dialog instead of immediately sending
        setPendingTransaction(values);
        setShowConfirmDialog(true);
        setConfirmChecked(false);
    };

    const handleConfirmSend = async () => {
        if (!pendingTransaction) return;

        // Send transaction
        const result = await sendTransaction({
            outputs: pendingTransaction.recipients.map((r) => ({
                address: r.address,
                amount: r.amount,
            })),
            fee: pendingTransaction.fee || undefined,
        });

        if (result) {
            const recipientCount = pendingTransaction.recipients.length;
            toast.success("Transaction sent successfully!", {
                description: `Sent to ${recipientCount} recipient${recipientCount > 1 ? "s" : ""}. Transaction ID: ${result.substring(0, 8)}...`,
            });
            console.log("Transaction sent:", result);
        } else {
            toast.error("Failed to send transaction", {
                description: error || "Unknown error occurred",
            });
        }

        // Close dialog and reset state
        setShowConfirmDialog(false);
        setPendingTransaction(null);
        setConfirmChecked(false);
    };

    const handleCancelSend = () => {
        setShowConfirmDialog(false);
        setPendingTransaction(null);
        setConfirmChecked(false);
    };

    const handleCopyTxId = () => {
        if (txId) {
            navigator.clipboard.writeText(txId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNewTransaction = () => {
        reset();
        form.reset({
            recipients: [{ address: "", amount: "" }],
            fee: "",
        });
        setShowMultiple(false);
    };

    const handleViewHistory = () => {
        navigate({ to: "/wallet/history" });
    };

    const handleAddRecipient = () => {
        append({ address: "", amount: "" });
        if (!showMultiple) setShowMultiple(true);
    };

    const handleRemoveRecipient = (index: number) => {
        // Don't remove if only one recipient left
        if (fields.length <= 1) return;

        remove(index);

        // Switch to single mode if we're down to 1 recipient after removal
        if (fields.length === 2) {
            setShowMultiple(false);
        }
    };

    const handleToggleMultiple = () => {
        if (!showMultiple) {
            setShowMultiple(true);
            if (fields.length === 1) {
                append({ address: "", amount: "" });
            }
        } else {
            // Store first recipient data before removing others
            const firstRecipient = form.getValues("recipients.0");

            // Reset to single recipient mode
            form.setValue("recipients", [
                firstRecipient || { address: "", amount: "" },
            ]);
            setShowMultiple(false);
        }
    };

    // Calculate total with safety checks
    const watchRecipients = form.watch("recipients") || [];
    const totalAmount = watchRecipients.reduce((sum, r) => {
        if (!r) return sum;
        const amount = parseFloat(r.amount || "0");
        return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);

    const watchFee = form.watch("fee");
    const fee = parseFloat(watchFee || "0");
    const grandTotal = totalAmount + (Number.isNaN(fee) ? 0 : fee);

    // Success state
    if (txId) {
        return (
            <Card className="bg-primary/2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                        Transaction Sent Successfully
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                Transaction ID
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 bg-primary/5 rounded-lg overflow-hidden">
                                    <p className="font-mono text-xs break-all">
                                        {txId}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyTxId}
                                    disabled={copied}
                                >
                                    {copied ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                • Your transaction has been broadcast to the
                                network
                            </p>
                            <p>
                                • It will be included in the next block once
                                confirmed
                            </p>
                            <p>
                                • Check the transaction history for confirmation
                                status
                            </p>
                        </div>
                    </div>

                    <ButtonGroup className="w-full">
                        <Button
                            onClick={handleNewTransaction}
                            variant="outline"
                            className="flex-1"
                        >
                            Send Another
                        </Button>
                        <Button onClick={handleViewHistory} className="flex-1">
                            View History
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </ButtonGroup>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="bg-primary/2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Send Transaction</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleToggleMultiple}
                        >
                            <Users className="h-4 w-4" />
                            {showMultiple ? "Single Recipient" : "Send to Many"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Recipients */}
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="space-y-4 p-4 border rounded-lg bg-background/50"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    Recipient {index + 1}
                                                </Badge>
                                                {showMultiple && (
                                                    <span className="text-xs text-muted-foreground">
                                                        of {fields.length}
                                                    </span>
                                                )}
                                            </div>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRemoveRecipient(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Address Field with Address Book */}
                                        <FormField
                                            control={form.control}
                                            name={`recipients.${index}.address`}
                                            render={({
                                                field: addressField,
                                            }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Recipient Address
                                                    </FormLabel>
                                                    <div className="space-y-2">
                                                        <FormControl>
                                                            <Field>
                                                                <Input
                                                                    placeholder="nolgam1..."
                                                                    className="font-mono"
                                                                    {...addressField}
                                                                />
                                                            </Field>
                                                        </FormControl>
                                                        <AddressBookSelect
                                                            value={
                                                                addressField.value
                                                            }
                                                            onSelect={(
                                                                address,
                                                            ) =>
                                                                addressField.onChange(
                                                                    address,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <FormDescription>
                                                        Enter address or select
                                                        from address book
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Amount Field */}
                                        <FormField
                                            control={form.control}
                                            name={`recipients.${index}.amount`}
                                            render={({
                                                field: amountField,
                                            }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Amount
                                                    </FormLabel>
                                                    <FormControl>
                                                        <InputGroup>
                                                            <InputGroupInput
                                                                type="text"
                                                                placeholder="0.00"
                                                                {...amountField}
                                                            />
                                                            <InputGroupText>
                                                                $NPT
                                                            </InputGroupText>
                                                        </InputGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}

                                {/* Add Recipient Button */}
                                {showMultiple && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddRecipient}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Recipient
                                    </Button>
                                )}
                            </div>

                            {/* Fee Field */}
                            <FormField
                                control={form.control}
                                name="fee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Transaction Fee{" "}
                                            <span className="text-muted-foreground">
                                                (Optional)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <InputGroup>
                                                <InputGroupInput
                                                    type="text"
                                                    placeholder="0.001"
                                                    {...field}
                                                />
                                                <InputGroupText>
                                                    $NPT
                                                </InputGroupText>
                                            </InputGroup>
                                        </FormControl>
                                        <FormDescription>
                                            Leave empty to use the default
                                            network fee
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Total Summary */}
                            <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Total Amount:
                                        </span>
                                        <span className="font-mono font-semibold">
                                            {totalAmount.toFixed(2)} $NPT
                                        </span>
                                    </div>
                                    <div className="flex justify-end">
                                        <PriceDisplay nptAmount={totalAmount} />
                                    </div>
                                </div>
                                {fee > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Fee:
                                            </span>
                                            <span className="font-mono">
                                                {fee.toFixed(2)} $NPT
                                            </span>
                                        </div>
                                        <div className="flex justify-end">
                                            <PriceDisplay nptAmount={fee} />
                                        </div>
                                    </div>
                                )}
                                <Separator />
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                            Grand Total:
                                        </span>
                                        <span className="font-mono font-bold text-lg">
                                            {grandTotal.toFixed(2)} $NPT
                                        </span>
                                    </div>
                                    <div className="flex justify-end">
                                        <PriceDisplay nptAmount={grandTotal} />
                                    </div>
                                </div>
                                {confirmedBalance && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                Available Balance:
                                            </span>
                                            <span className="font-mono text-muted-foreground">
                                                {parseFloat(
                                                    confirmedBalance,
                                                ).toFixed(2)}{" "}
                                                $NPT
                                            </span>
                                        </div>
                                        <div className="flex justify-end">
                                            <PriceDisplay
                                                nptAmount={parseFloat(
                                                    confirmedBalance,
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <Separator />

                            {/* Submit Button */}
                            <ButtonGroup className="w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.reset()}
                                    disabled={isSending}
                                    className="flex-1"
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSending || isValidating}
                                    className="flex-1"
                                >
                                    {isSending || isValidating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {isValidating
                                                ? "Validating..."
                                                : "Sending..."}
                                        </>
                                    ) : (
                                        <>
                                            Send Transaction
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </ButtonGroup>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please review the transaction details before
                            sending:
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {pendingTransaction && (
                        <div className="space-y-4">
                            {/* Transaction Summary */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium">
                                    Recipients:
                                </div>
                                {pendingTransaction.recipients.map(
                                    (recipient, index) => (
                                        <div
                                            key={`recipient-${index}-${recipient.address}`}
                                            className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-sm">
                                                    {truncateAddress(
                                                        recipient.address,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <div className="font-mono font-medium">
                                                    {parseFloat(
                                                        recipient.amount,
                                                    ).toFixed(2)}{" "}
                                                    NPT
                                                </div>
                                                <PriceDisplay
                                                    nptAmount={parseFloat(
                                                        recipient.amount,
                                                    )}
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* Total Amount */}
                            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <span className="font-medium">
                                    Total Amount:
                                </span>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-lg">
                                        {pendingTransaction.recipients
                                            .reduce(
                                                (sum, r) =>
                                                    sum + parseFloat(r.amount),
                                                0,
                                            )
                                            .toFixed(2)}{" "}
                                        NPT
                                    </div>
                                    <PriceDisplay
                                        nptAmount={pendingTransaction.recipients.reduce(
                                            (sum, r) =>
                                                sum + parseFloat(r.amount),
                                            0,
                                        )}
                                        className="text-sm"
                                    />
                                </div>
                            </div>

                            {/* Fee */}
                            {pendingTransaction.fee && (
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">
                                        Transaction Fee:
                                    </span>
                                    <span className="font-mono text-sm">
                                        {parseFloat(
                                            pendingTransaction.fee,
                                        ).toFixed(2)}{" "}
                                        NPT
                                    </span>
                                </div>
                            )}

                            {/* Security Checkbox */}
                            <div className="flex items-center space-x-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                                <Checkbox
                                    id={confirmId}
                                    checked={confirmChecked}
                                    onCheckedChange={(checked) =>
                                        setConfirmChecked(checked as boolean)
                                    }
                                />
                                <label
                                    htmlFor={confirmId}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I confirm that I want to send this
                                    transaction
                                </label>
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelSend}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmSend}
                            disabled={!confirmChecked || isSending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                "Send Transaction"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
