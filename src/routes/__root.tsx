import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DragRegion } from '@/components/layout/drag-region';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SidebarWrapper } from '@/components/layout/SidebarWrapper';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { Toaster } from '@/components/ui/sonner';
import { usePricePolling } from '@/hooks/use-price-polling';
import { useAutoPolling } from '@/renderer/hooks/use-onchain-data';
import { useLoadSettings } from '@/store/neptune-core-settings.store';

const MainApp = () => {
  // Load settings on app startup
  const loadSettings = useLoadSettings();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Start auto-polling blockchain data every 10 seconds
  useAutoPolling(10000);

  // Start price polling if enabled in settings
  usePricePolling();

  return (
    <div className="h-screen flex flex-col relative">
      <DragRegion title="Neptune Core Wallet" />
      <Header />
      <div className="flex flex-1 min-h-0">
        <SidebarWrapper />
        <main className="flex-1 min-h-0">
          <Outlet />
        </main>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};

const RootLayout = () => {
  const [showMainApp, setShowMainApp] = useState(false);

  const handleSplashReady = () => {
    setShowMainApp(true);
  };

  if (!showMainApp) {
    return <SplashScreen onReady={handleSplashReady} />;
  }

  return <MainApp />;
};

export const Route = createRootRoute({ component: RootLayout });
