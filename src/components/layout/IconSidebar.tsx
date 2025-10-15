import { useLocation, useNavigate } from '@tanstack/react-router';
import { FlaskConical, Settings, Wallet } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';

export function IconSidebar() {
  const {
    handleNavigationClick,
    setLastClickedRoute,
    experimentalMode,
    toggleExperimentalMode,
  } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize lastClickedRoute with current route on mount and route changes
  useEffect(() => {
    setLastClickedRoute(location.pathname);
  }, [location.pathname, setLastClickedRoute]);

  const sidebarItems = [{ icon: Wallet, label: 'Wallet', href: '/wallet' }];

  const onNavigationClick = (href: string) => {
    const shouldNavigate = handleNavigationClick(href, location.pathname);

    if (shouldNavigate) {
      navigate({ to: href });
    }
  };

  return (
    <div className="flex h-full w-16 flex-col bg-background border-r">
      {/* Navigation Items */}
      <nav className="flex-1 p-1.5 space-y-1 pt-4">
        {sidebarItems.map((item) => {
          // For wallet, check if we're on any wallet route
          const isActive =
            item.href === '/wallet'
              ? location.pathname.startsWith('/wallet')
              : location.pathname === item.href;
          return (
            <button
              key={item.label.toLowerCase()}
              type="button"
              onClick={() => onNavigationClick(item.href)}
              className={cn(
                'flex items-center justify-center w-full h-10 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
              )}
              title={`${item.label} - Navigate & Toggle Sidebar`}
            >
              <item.icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>

      {/* Footer with Experimental Toggle and Settings */}
      <div className="p-1.5 space-y-1">
        {/* Experimental Mode Toggle */}
        <button
          type="button"
          onClick={toggleExperimentalMode}
          className={cn(
            'flex items-center justify-center w-full h-10 rounded-md text-sm font-medium transition-colors',
            experimentalMode
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
          )}
          title={`Experimental Mode - ${experimentalMode ? 'Enabled' : 'Disabled'}`}
        >
          <FlaskConical className="h-5 w-5" />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => onNavigationClick('/settings')}
          className={cn(
            'flex items-center justify-center w-full h-10 rounded-md text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
          )}
          title="Settings - Navigate & Toggle Sidebar"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
