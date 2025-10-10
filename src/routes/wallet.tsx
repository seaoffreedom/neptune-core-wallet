import { createFileRoute, Outlet } from '@tanstack/react-router';

function WalletLayout() {
  return <Outlet />;
}

export const Route = createFileRoute('/wallet')({
  component: WalletLayout,
});
