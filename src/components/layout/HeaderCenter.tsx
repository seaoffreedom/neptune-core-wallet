import { Search } from 'lucide-react';

export function HeaderCenter() {
  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground text-sm">
        Search transactions...
      </span>
    </div>
  );
}
