import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SidebarWrapper } from '@/components/layout/SidebarWrapper';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { Toaster } from '@/components/ui/sonner';
import { useAutoPolling } from '@/renderer/hooks/use-onchain-data';

const MainApp = () => {
  // Start auto-polling blockchain data every 10 seconds
  useAutoPolling(10000);

  return (
    <div className="h-screen flex flex-col">
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
