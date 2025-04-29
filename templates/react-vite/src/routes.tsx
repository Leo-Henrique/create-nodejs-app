import { createBrowserRouter, RouteObject } from "react-router";
import { AppLayout } from "./pages/_layouts/app";
import { AuthLayout } from "./pages/_layouts/auth";
import { Dashboard } from "./pages/app/dashboard/dashboard";
import { SignIn } from "./pages/auth/sign-in";
import { publicEnv } from "./public-env";

export const publicRoutes = Object.freeze({
  signIn: {
    path: "/",
    element: <SignIn />,
    title: createTitleTemplate("Sign In"),
  },
} as const);

export const privateRoutes = Object.freeze({
  dashboard: {
    path: "/dashboard",
    element: <Dashboard />,
    title: createTitleTemplate("Dashboard"),
  },
} as const);

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      ...Object.values(publicRoutes).map<RouteObject>(publicRoute => ({
        path: publicRoute.path,
        element: publicRoute.element,
        index: true,
      })),
    ],
  },
  {
    element: <AppLayout />,
    children: [
      ...Object.values(privateRoutes).map<RouteObject>(publicRoute => ({
        path: publicRoute.path,
        element: publicRoute.element,
        index: true,
      })),
    ],
  },
]);

function createTitleTemplate(title: string) {
  return `${title} | ${publicEnv.APP_NAME}`;
}
