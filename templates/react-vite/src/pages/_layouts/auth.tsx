import { publicRoutes } from "@/routes";
import { Outlet, useLocation } from "react-router";

export function AuthLayout() {
  const { pathname } = useLocation();
  const currentPublicRoute = Object.values(publicRoutes).find(publicRoute => {
    return publicRoute.path === pathname;
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
