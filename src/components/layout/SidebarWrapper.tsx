import { domAnimation, LazyMotion, m } from 'framer-motion';
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { IconSidebar } from './IconSidebar';
import { Sidebar } from './Sidebar';

export function SidebarWrapper() {
  const { sidebar, isHydrated, setHydrated } = useUIStore();

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  // Don't render until hydrated to prevent flicker
  if (!isHydrated) {
    return (
      <div className="flex h-full">
        <IconSidebar />
        <div
          className="bg-primary/2 flex h-full w-80 flex-col items-center justify-center"
          style={{
            width: '0px',
            overflow: 'hidden',
          }}
        >
          <div className="w-[320px] h-full flex flex-col">
            <span className="text-foreground font-semibold">Main Sidebar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <IconSidebar />
      <div className="relative overflow-hidden">
        <LazyMotion features={domAnimation}>
          <m.div
            className="bg-primary/2 flex h-full flex-col items-center justify-center"
            initial={{
              x: sidebar.isOpen ? 0 : -320,
              width: sidebar.isOpen ? 320 : 0,
            }}
            animate={{
              x: sidebar.isOpen ? 0 : -320,
              width: sidebar.isOpen ? 320 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            style={{
              overflow: 'hidden',
            }}
          >
            <div className="w-[320px] h-full flex flex-col">
              <Sidebar />
            </div>
          </m.div>
        </LazyMotion>
      </div>
    </div>
  );
}
