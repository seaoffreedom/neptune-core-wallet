/**
 * Settings Sidebar Content
 *
 * Displays settings navigation aligned with Neptune Core settings categories
 */

import { Link, useLocation } from '@tanstack/react-router';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  DollarSign,
  Gauge,
  LayoutDashboard,
  Network,
  Pickaxe,
  RotateCcw,
  Settings2,
  Shield,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function SettingsSidebar() {
  const location = useLocation();

  // For now, we'll show "Up to Date" always
  // TODO: Implement needsRestart state in Zustand store
  const needsRestart = false;

  // Neptune Core Settings Categories
  const settingsNavItems = [
    {
      icon: LayoutDashboard,
      label: 'Overview',
      href: '/settings',
      description: 'Settings summary',
    },
    {
      icon: Network,
      label: 'Network',
      href: '/settings/network',
      description: 'Peer connections and ports',
    },
    {
      icon: Pickaxe,
      label: 'Mining',
      href: '/settings/mining',
      description: 'Proof upgrading and guessing',
    },
    {
      icon: Gauge,
      label: 'Performance',
      href: '/settings/performance',
      description: 'Proof generation and sync',
    },
    {
      icon: Shield,
      label: 'Security',
      href: '/settings/security',
      description: 'Privacy and access control',
    },
    {
      icon: Database,
      label: 'Data & Storage',
      href: '/settings/data',
      description: 'Directories and imports',
    },
    {
      icon: Settings2,
      label: 'Advanced',
      href: '/settings/advanced',
      description: 'Debug and notifications',
    },
    {
      icon: DollarSign,
      label: 'Price & Currency',
      href: '/settings/price',
      description: 'Price fetching and currency display',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure Neptune Core</p>
      </div>

      <Separator />

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Navigation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Categories
              </h3>
              <div className="space-y-1">
                {settingsNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'w-full flex items-start gap-3 px-3 py-2 rounded-md transition-colors text-left',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 mt-0.5',
                          isActive
                            ? 'text-accent-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </button>
              </div>
            </div>

            <Separator />

            {/* Info Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Information
              </h3>
              {needsRestart ? (
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">
                      Restart Required
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Settings have been saved. Restart the app to apply changes.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Up to Date</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All settings are saved and applied.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Current Settings Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Status
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between px-3 py-1">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="text-xs">Encrypted</span>
                </div>
                <div className="flex justify-between px-3 py-1">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-xs font-mono">~/.config</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
