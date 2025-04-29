import { privateRoutes } from "@/routes";
import { Outlet, useLocation } from "react-router";

export function AppLayout() {
  const { pathname } = useLocation();
  const currentPublicRoute = Object.values(privateRoutes).find(privateRoute => {
    return privateRoute.path === pathname;
  });

  return (
    <>
      {currentPublicRoute && <title>{currentPublicRoute.title}</title>}

      <div>
        <Outlet />
      </div>
    </>
  );
}
