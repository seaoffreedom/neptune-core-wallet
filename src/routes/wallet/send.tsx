import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { SendFormEnhanced } from '@/components/send';

function SendFunds() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">Send Funds</h3>
          <p className="text-muted-foreground">
            Send Neptune tokens to one or multiple recipients with privacy.
          </p>
        </div>

        <SendFormEnhanced />

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold">Privacy Notice</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>All transactions use privacy-preserving cryptography</li>
            <li>Transaction amounts and recipients are shielded</li>
            <li>Only you and the recipient can see transaction details</li>
            <li>
              Use "Send to Many" to send to multiple recipients in one
              transaction
            </li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}

export const Route = createFileRoute('/wallet/send')({
  component: SendFunds,
});
