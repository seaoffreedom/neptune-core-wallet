import { Clock, Wifi } from 'lucide-react';

export function FooterRight() {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1">
        <Wifi className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground text-sm">Network</span>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground text-sm">12:34 PM</span>
      </div>
    </div>
  );
}
