/**
 * Renderer Process Entry Point
 *
 * This is the renderer process entry point for the Electron application.
 * It initializes React and the routing system.
 */

import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// Import the generated route tree
import { routeTree } from '../routeTree.gen';

// Import CSS
import '../globals.css';

// Import theme provider
import { ThemeProvider } from '../components/theme-provider';

// Create a hash history instance for Electron
const hashHistory = createHashHistory();

// Create a new router instance with hash routing
const router = createRouter({ routeTree, history: hashHistory });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="nautical" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>
  );
}
