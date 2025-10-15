/**
 * SaveChangesBar Component
 *
 * Fixed bottom bar that slides up when settings have unsaved changes.
 * Provides save and reset actions with loading states.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rendererLoggers } from '../../renderer/utils/logger';

const logger = rendererLoggers.components;

interface SaveChangesBarProps {
  isVisible: boolean;
  hasChanges: boolean;
  changeCount: number;
  onSave: () => Promise<void>;
  onReset: () => void;
  isSaving?: boolean;
}

export function SaveChangesBar({
  isVisible,
  hasChanges,
  changeCount,
  onSave,
  onReset,
  isSaving = false,
}: SaveChangesBarProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    try {
      await onSave();
      setIsSaved(true);
      // Reset saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      logger.error('Failed to save settings', {
        error: (error as Error).message,
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && hasChanges && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Unsaved Changes
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {changeCount} {changeCount === 1 ? 'change' : 'changes'}
                </Badge>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                  className="gap-2 min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isSaved ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
