import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({ component: RootLayout });

function RootLayout() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}
