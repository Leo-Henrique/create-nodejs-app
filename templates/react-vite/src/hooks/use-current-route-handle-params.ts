import { ReactRouterRouteHandleDefinition } from "@/@types/routes";
import { useLocation, useMatches } from "react-router";

export function useCurrentRouteHandleParams() {
  const { pathname } = useLocation();
  const routeMatches = useMatches();
  const currentRouteHandleParams = routeMatches.find(routeMatch => {
    return routeMatch.pathname === pathname && routeMatch.handle;
  });

  return {
    pathname,
    handleParams:
      currentRouteHandleParams?.handle as ReactRouterRouteHandleDefinition,
  };
}
