import { FlaskConical } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useUIStore } from '@/store/ui.store';

export function HeaderRight() {
  const experimentalMode = useUIStore((state) => state.experimentalMode);

  return (
    <div className="flex items-center gap-2">
      {/* Experimental Mode Indicator */}
      {experimentalMode && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
          <FlaskConical className="h-3 w-3 text-orange-500" />
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
            Experimental
          </span>
        </div>
      )}

      <ModeToggle />
    </div>
  );
}
