'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import {
  useAddressValidation,
  useSendTransaction,
} from '@/renderer/hooks/use-onchain-data';
import { useOnchainStore } from '@/store/onchain.store';

// Form validation schema
const sendFormSchema = z.object({
  address: z
    .string()
    .min(1, { message: 'Recipient address is required' })
    .refine((val) => val.trim().length > 0, {
      message: 'Address cannot be empty',
    }),
  amount: z
    .string()
    .min(1, { message: 'Amount is required' })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !Number.isNaN(num) && num > 0;
      },
      { message: 'Amount must be a positive number' }
    ),
  fee: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const num = parseFloat(val);
        return !Number.isNaN(num) && num >= 0;
      },
      { message: 'Fee must be a positive number or zero' }
    ),
});

type SendFormValues = z.infer<typeof sendFormSchema>;

export function SendForm() {
  const navigate = useNavigate();
  const { sendTransaction, isSending, error, txId, reset } =
    useSendTransaction();
  const { validateAddress, validateAmount } = useAddressValidation();
  const confirmedBalance = useOnchainStore(
    (state) => state.dashboardData?.confirmed_available_balance
  );

  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [isValidatingAmount, setIsValidatingAmount] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<SendFormValues>({
    resolver: zodResolver(sendFormSchema),
    defaultValues: {
      address: '',
      amount: '',
      fee: '',
    },
  });

  const onSubmit = async (values: SendFormValues) => {
    // Additional validation via RPC
    setIsValidatingAddress(true);
    const isValidAddress = await validateAddress(values.address);
    setIsValidatingAddress(false);

    if (!isValidAddress) {
      form.setError('address', {
        type: 'manual',
        message: 'Invalid Neptune address format',
      });
      return;
    }

    setIsValidatingAmount(true);
    const isValidAmount = await validateAmount(values.amount);
    setIsValidatingAmount(false);

    if (!isValidAmount) {
      form.setError('amount', {
        type: 'manual',
        message: 'Invalid amount format',
      });
      return;
    }

    // Check balance
    if (confirmedBalance) {
      const balance = parseFloat(confirmedBalance);
      const amount = parseFloat(values.amount);
      const fee = values.fee ? parseFloat(values.fee) : 0;

      if (amount + fee > balance) {
        form.setError('amount', {
          type: 'manual',
          message: 'Insufficient balance',
        });
        return;
      }
    }

    // Send transaction
    const result = await sendTransaction({
      outputs: [
        {
          address: values.address,
          amount: values.amount,
        },
      ],
      fee: values.fee || undefined,
    });

    if (result) {
      // Transaction successful
      console.log('Transaction sent:', result);
    }
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
    form.reset();
  };

  const handleViewHistory = () => {
    navigate({ to: '/wallet/history' });
  };

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
                  <p className="font-mono text-xs break-all">{txId}</p>
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
              <p>• Your transaction has been broadcast to the network</p>
              <p>• It will be included in the next block once confirmed</p>
              <p>• Check the transaction history for confirmation status</p>
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
    <Card className="bg-primary/2">
      <CardHeader>
        <CardTitle>Send Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Recipient Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Field>
                      <Input
                        placeholder="nolus1..."
                        className="font-mono"
                        {...field}
                      />
                    </Field>
                  </FormControl>
                  <FormDescription>
                    Enter the Neptune address to send funds to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Field with Balance Display */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        type="text"
                        placeholder="0.00"
                        {...field}
                      />
                      <InputGroupText>NEPTUNE</InputGroupText>
                    </InputGroup>
                  </FormControl>
                  <FormDescription className="flex items-center justify-between">
                    <span>Amount to send (excluding fees)</span>
                    {confirmedBalance && (
                      <span className="text-xs font-medium">
                        Available: {parseFloat(confirmedBalance).toFixed(2)}{' '}
                        NEPTUNE
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee Field (Optional) */}
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Transaction Fee{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        type="text"
                        placeholder="0.001"
                        {...field}
                      />
                      <InputGroupText>NEPTUNE</InputGroupText>
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    Leave empty to use the default network fee
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={
                  isSending || isValidatingAddress || isValidatingAmount
                }
                className="flex-1"
              >
                {isSending || isValidatingAddress || isValidatingAmount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isValidatingAddress
                      ? 'Validating Address...'
                      : isValidatingAmount
                        ? 'Validating Amount...'
                        : 'Sending...'}
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
  );
}
