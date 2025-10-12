import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUIStore } from '@/store/ui.store';

export const Route = createFileRoute('/extension')({
  component: Extension,
});

function Extension() {
  const navigate = useNavigate();
  const experimentalMode = useUIStore((state) => state.experimentalMode);

  // Redirect to wallet if experimental mode is disabled
  useEffect(() => {
    if (!experimentalMode) {
      navigate({ to: '/wallet' });
    }
  }, [experimentalMode, navigate]);

  // Show warning if experimental mode is disabled
  if (!experimentalMode) {
    return (
      <div className="p-8 space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Extension features are only available in experimental mode. Enable
            experimental mode in the sidebar to access this feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h3 className="text-2xl font-bold">Neptune Accomplice</h3>
      <p className="text-muted-foreground">
        Configure browser extension integration and manage allowed hosts. Click
        the extension icon again to toggle the sidebar.
      </p>
      <div className="space-y-2">
        <div className="w-full h-8 bg-muted rounded"></div>
        <div className="w-full h-8 bg-muted rounded"></div>
        <div className="w-full h-8 bg-muted rounded"></div>
      </div>
    </div>
  );
}
