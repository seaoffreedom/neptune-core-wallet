/**
 * Peers Empty State
 *
 * Displays when there are no peers to show
 */

import { Network, Shield } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

interface PeersEmptyProps {
  type: 'active' | 'banned';
}

export function PeersEmpty({ type }: PeersEmptyProps) {
  if (type === 'active') {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Network className="h-12 w-12" />
          </EmptyMedia>
          <EmptyTitle>No active peers</EmptyTitle>
          <EmptyDescription>
            Add peer connections to improve your network connectivity
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Shield className="h-12 w-12" />
        </EmptyMedia>
        <EmptyTitle>No banned peers</EmptyTitle>
        <EmptyDescription>Peers you ban will appear here</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
