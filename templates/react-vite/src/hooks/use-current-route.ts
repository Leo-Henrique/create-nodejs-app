import { routeGroups } from "@/routes";
import { useLocation } from "react-router";

type RouteGroup = (typeof routeGroups)[number];

type Route = RouteGroup extends Record<string, infer Route> ? Route : never;

export function useCurrentRoute() {
  const { pathname } = useLocation();
  let currentRoute: Route | null = null;

  for (const routeGroup of routeGroups) {
    const matchedRoute = Object.values(routeGroup).find(route => {
      return route.path === pathname;
    });

    if (matchedRoute) {
      currentRoute = matchedRoute;
      break;
    }
  }

  return currentRoute;
}
