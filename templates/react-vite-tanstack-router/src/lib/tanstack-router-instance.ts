import { routeTree } from "@/route-tree.gen";
import { createRouter } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof tanstackRouterInstance;
  }
}

export const tanstackRouterInstance = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});
