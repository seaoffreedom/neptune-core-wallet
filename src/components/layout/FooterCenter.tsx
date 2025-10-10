import { Activity } from 'lucide-react';

export function FooterCenter() {
  return (
    <div className="flex items-center space-x-2">
      <Activity className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground text-sm">
        Neptune Core Wallet v1.0.0
      </span>
    </div>
  );
}
