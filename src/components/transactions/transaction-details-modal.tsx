import { Calendar, Coins, Copy, ExternalLink, Hash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TransactionDetailsModalProps {
  transaction: {
    digest: string;
    amount: string;
    status: string;
    height?: string;
    timestamp?: string;
    type?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  const [, setCopied] = useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return Number.isNaN(num) ? amount : `${num.toFixed(6)} NPT`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Transaction ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Transaction ID
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(transaction.digest, 'Transaction ID')
                  }
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-mono text-sm bg-muted p-3 rounded-md break-all">
                {transaction.digest}
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <div>
                <Badge
                  variant={getStatusVariant(transaction.status)}
                  className="capitalize"
                >
                  {transaction.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Amount */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Amount
                </span>
              </div>
              <div className="text-lg font-semibold">
                {formatAmount(transaction.amount)}
              </div>
            </div>

            <Separator />

            {/* Block Height */}
            {transaction.height && (
              <>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Block Height
                  </span>
                  <div className="font-mono text-sm">{transaction.height}</div>
                </div>
                <Separator />
              </>
            )}

            {/* Timestamp */}
            {transaction.timestamp && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Timestamp
                    </span>
                  </div>
                  <div className="text-sm">
                    {formatTimestamp(transaction.timestamp)}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Transaction Type */}
            {transaction.type && (
              <>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Type
                  </span>
                  <div className="text-sm capitalize">{transaction.type}</div>
                </div>
                <Separator />
              </>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Actions
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(transaction.digest, 'Transaction ID')
                  }
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const explorerUrl = `https://neptune.vxb.ai/block?h=${transaction.digest}`;
                    try {
                      await navigator.clipboard.writeText(explorerUrl);
                      toast.success('Explorer link copied to clipboard');
                    } catch {
                      // Fallback to opening in new tab if clipboard fails
                      window.open(explorerUrl, '_blank');
                    }
                  }}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Explorer Link
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
