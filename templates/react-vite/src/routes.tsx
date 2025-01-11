import { createBrowserRouter } from "react-router";
import {
  CustomRouteDefinition,
  ReactRouterRouteDefinition,
} from "./@types/routes";
import { AppLayout } from "./pages/_layouts/app";
import { AuthLayout } from "./pages/_layouts/auth";
import { SignIn } from "./pages/auth/sign-in";
import { Dashboard } from "./pages/app/dashboard/dashboard";

export const authNavigationRoutes = [
  {
    path: "/sign-in",
    label: "Sign In",
  },
] as const satisfies CustomRouteDefinition[];

export const appNavigationRoutes = [
  {
    path: "/dashboard",
    label: "Dashboard",
  },
] as const satisfies CustomRouteDefinition[];

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "*",
        element: <SignIn />,
        index: true,
        handle: {
          metadata: {
            title: "Sign In",
          },
        },
      },
      {
        path: "/sign-in",
        element: <SignIn />,
        index: true,
        handle: {
          metadata: {
            title: "Sign In",
          },
        },
      },
    ] satisfies ReactRouterRouteDefinition<typeof authNavigationRoutes>[],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
        handle: {
          metadata: {
            title: "Dashboard",
          },
        },
      },
    ] satisfies ReactRouterRouteDefinition<typeof appNavigationRoutes>[],
  },
]);
