import type { ReactNode } from 'react';
import { isMacOS } from '../../renderer/utils/platform';
import { WindowControls } from './window-controls';

interface DragRegionProps {
  title?: ReactNode;
  children?: ReactNode;
}

/**
 * Drag region component that allows window dragging
 * Implements custom title bar functionality
 */
export function DragRegion({ title, children }: DragRegionProps) {
  return (
    <div className="flex w-full items-stretch justify-between">
      <div className="drag-region flex-1">
        {title && !isMacOS() && (
          <div className="flex flex-1 p-2 text-xs whitespace-nowrap text-muted-foreground select-none">
            {title}
          </div>
        )}
        {isMacOS() && (
          <div className="flex flex-1 p-2">
            {/* Maintain the same height but do not display content on macOS */}
          </div>
        )}
        {children}
      </div>
      {!isMacOS() && <WindowControls />}
    </div>
  );
}
