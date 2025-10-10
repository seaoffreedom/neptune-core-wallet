import { Home } from 'lucide-react';

export function HeaderLeft() {
  return (
    <div className="flex items-center space-x-2">
      <Home className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground text-sm">Neptune Core Wallet</span>
    </div>
  );
}
