import { AppLayout } from "@/pages/_layouts/app";
import { AuthLayout } from "@/pages/_layouts/auth";
import { privateRoutes, publicRoutes } from "@/routes";
import { createBrowserRouter, RouteObject } from "react-router";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      ...Object.values(publicRoutes).map(
        publicRoute =>
          ({
            path: publicRoute.path,
            element: <publicRoute.element />,
            index: true,
          }) satisfies RouteObject,
      ),
    ],
  },
  {
    element: <AppLayout />,
    children: [
      ...Object.values(privateRoutes).map(
        publicRoute =>
          ({
            path: publicRoute.path,
            element: <publicRoute.element />,
          }) satisfies RouteObject,
      ),
    ],
  },
]);
