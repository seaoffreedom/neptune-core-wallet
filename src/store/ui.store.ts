/**
 * UI State Store
 *
 * Zustand store for managing UI state, modals, themes, navigation,
 * and user interface-related state. Provides centralized UI state
 * management and UI operations.
 *
 * Responsibilities:
 * - Manage UI state and user interface elements
 * - Handle modals, dialogs, and overlays
 * - Provide theme and appearance management
 * - Manage navigation and routing state
 * - Integrate with UI services and components
 *
 * Usage Pattern:
 * - Use for managing modal and dialog states
 * - Use for theme and appearance management
 * - Use for navigation and routing state
 * - Use for UI component state management
 * - Use for user interface interactions
 *
 * State Properties:
 * - modals: Modal and dialog states
 * - theme: Application theme and appearance
 * - navigation: Navigation and routing state
 * - sidebar: Sidebar and panel states
 * - notifications: Notification states
 * - loading: UI loading states
 *
 * Actions:
 * - openModal: Open modal or dialog
 * - closeModal: Close modal or dialog
 * - setTheme: Set application theme
 * - setNavigation: Set navigation state
 * - toggleSidebar: Toggle sidebar visibility
 * - showNotification: Show notification
 * - hideNotification: Hide notification
 *
 * Features:
 * - Type-safe UI state management
 * - Modal and dialog management
 * - Theme and appearance management
 * - Navigation state management
 * - Notification management
 *
 * Integration Points:
 * - UI components for state consumption
 * - Theme service for appearance management
 * - Navigation service for routing
 * - Notification service for alerts
 * - IPC communication for cross-process UI
 *
 * Features:
 * - UI state management
 * - Modal and dialog management
 * - Theme and appearance management
 * - Navigation state management
 * - Performance optimization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  variant: 'icon' | 'full';
}

interface NavigationState {
  lastClickedRoute: string | null;
}

interface UIStore {
  // Sidebar state
  sidebar: SidebarState;

  // Navigation state
  navigation: NavigationState;

  // Hydration state
  isHydrated: boolean;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarVariant: (variant: 'icon' | 'full') => void;

  // Navigation actions
  setLastClickedRoute: (route: string | null) => void;
  handleNavigationClick: (route: string, currentRoute: string) => boolean;

  // Hydration actions
  setHydrated: (hydrated: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial sidebar state
      sidebar: {
        isOpen: true,
        variant: 'icon',
      },

      // Initial navigation state
      navigation: {
        lastClickedRoute: null,
      },

      // Initial hydration state
      isHydrated: false,

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isOpen: !state.sidebar.isOpen,
          },
        })),

      setSidebarOpen: (open: boolean) =>
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isOpen: open,
          },
        })),

      setSidebarVariant: (variant: 'icon' | 'full') =>
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            variant,
          },
        })),

      // Navigation actions
      setLastClickedRoute: (route: string | null) =>
        set((state) => ({
          navigation: {
            ...state.navigation,
            lastClickedRoute: route,
          },
        })),

      handleNavigationClick: (route: string, _currentRoute: string) => {
        const state = get();
        const { lastClickedRoute } = state.navigation;

        // If clicking the same route that was last clicked, just toggle sidebar
        if (lastClickedRoute === route) {
          state.toggleSidebar();
          return false; // Don't navigate
        }

        // If clicking a different route, navigate and open sidebar
        state.setLastClickedRoute(route);
        state.setSidebarOpen(true);
        return true; // Should navigate
      },

      // Hydration actions
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebar: state.sidebar,
        navigation: state.navigation,
      }),
    }
  )
);
