/**
 * Quick Actions Component
 *
 * Displays action buttons to navigate to different wallet functions
 */

import { Link } from '@tanstack/react-router';
import { BookUser, Coins, QrCode, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function QuickActions() {
  const actions = [
    {
      icon: Send,
      label: 'Send Funds',
      href: '/wallet/send',
      description: 'Send Neptune tokens',
      variant: 'default' as const,
    },
    {
      icon: QrCode,
      label: 'Receive',
      href: '/wallet/receive',
      description: 'Get receiving address',
      variant: 'outline' as const,
    },
    {
      icon: Coins,
      label: 'View UTXOs',
      href: '/wallet/utxos',
      description: 'Manage coins',
      variant: 'outline' as const,
    },
    {
      icon: BookUser,
      label: 'Address Book',
      href: '/wallet/address-book',
      description: 'Saved addresses',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Button
                variant={action.variant}
                className="w-full h-auto flex flex-col items-center gap-2 p-4"
              >
                <action.icon className="h-5 w-5" />
                <div className="space-y-1 text-center">
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
