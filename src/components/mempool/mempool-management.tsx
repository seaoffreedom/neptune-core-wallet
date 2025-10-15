import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Radio,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

interface MempoolManagementProps {
  txCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function MempoolManagement({
  txCount,
  onRefresh,
  isRefreshing,
}: MempoolManagementProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleBroadcastAll = async () => {
    setIsBroadcasting(true);
    try {
      const result =
        await window.electronAPI.blockchain.broadcastAllMempoolTxs();
      if (result.success) {
        showSuccessToast('All mempool transactions broadcasted successfully');
        onRefresh(); // Refresh data after broadcasting
      } else {
        showErrorToast(`Failed to broadcast transactions: ${result.error}`);
      }
    } catch (error) {
      showErrorToast(
        `Error broadcasting transactions: ${(error as Error).message}`
      );
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleClearMempool = async () => {
    setIsClearing(true);
    try {
      const result = await window.electronAPI.blockchain.clearMempool();
      if (result.success) {
        showSuccessToast('Mempool cleared successfully');
        onRefresh(); // Refresh data after clearing
      } else {
        showErrorToast(`Failed to clear mempool: ${result.error}`);
      }
    } catch (error) {
      showErrorToast(`Error clearing mempool: ${(error as Error).message}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Mempool Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {txCount > 0 ? (
                <Badge
                  variant="default"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {txCount} Pending
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Empty
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {txCount === 0
                ? 'No transactions waiting in mempool'
                : `${txCount} transaction${txCount !== 1 ? 's' : ''} pending broadcast`}
            </span>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-12"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh Data
          </Button>

          {/* Broadcast Button */}
          <Button
            variant="outline"
            onClick={handleBroadcastAll}
            disabled={isBroadcasting || txCount === 0}
            className="h-12"
          >
            {isBroadcasting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Radio className="mr-2 h-4 w-4" />
            )}
            Broadcast All
          </Button>

          {/* Clear Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isClearing || txCount === 0}
                className="h-12"
              >
                {isClearing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Clear Mempool
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clear Mempool
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to clear all transactions from the
                  mempool? This action cannot be undone and will remove{' '}
                  {txCount} pending transaction
                  {txCount !== 1 ? 's' : ''}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearMempool}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Clear Mempool
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Help Text */}
        {/* <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                        <strong>Broadcast All:</strong> Sends all pending
                        transactions to the network
                    </p>
                    <p>
                        <strong>Clear Mempool:</strong> Removes all pending
                        transactions (use with caution)
                    </p>
                    <p>
                        <strong>Refresh:</strong> Updates mempool data from the
                        node
                    </p>
                </div> */}
      </CardContent>
    </Card>
  );
}
