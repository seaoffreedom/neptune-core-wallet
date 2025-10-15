import { useLocation } from '@tanstack/react-router';
import { SettingsSidebar, WalletSidebar } from '@/components/sidebar';

export function Sidebar() {
  const location = useLocation();

  // Determine which sidebar content to show based on route
  const renderSidebarContent = () => {
    // Show settings sidebar for all settings-related routes
    if (location.pathname.startsWith('/settings')) {
      return <SettingsSidebar />;
    }

    // Show wallet sidebar for all wallet-related routes
    if (location.pathname.startsWith('/wallet')) {
      return <WalletSidebar />;
    }

    // Default to wallet sidebar
    return <WalletSidebar />;
  };

  return <div className="h-full w-full">{renderSidebarContent()}</div>;
}
