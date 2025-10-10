import { Info } from 'lucide-react';

export function FooterLeft() {
  return (
    <div className="flex items-center space-x-2">
      <Info className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground text-sm">Status: Connected</span>
    </div>
  );
}
