/**
 * PageContainer Component
 *
 * Reusable container for route pages with dashed border and internal scrolling
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReactNode } from "react";

interface PageContainerProps {
    children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <div className="h-full w-full p-3">
            <div className="h-full w-full border-2 border-dashed border-border rounded-lg overflow-hidden">
                <ScrollArea className="h-full w-full">
                    <div className="p-8">{children}</div>
                </ScrollArea>
            </div>
        </div>
    );
}
