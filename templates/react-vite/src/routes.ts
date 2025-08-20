import { DashboardPage } from "./pages/app/dashboard";
import { SignInPage } from "./pages/auth/sign-in";
import { publicEnv } from "./public-env";

export const publicRoutes = Object.freeze({
  signIn: {
    path: "/",
    element: SignInPage,
    title: createPageTitleTemplate("Sign In"),
    label: "Sign In",
  },
} as const);

export const privateRoutes = Object.freeze({
  dashboard: {
    path: "/dashboard",
    element: DashboardPage,
    title: createPageTitleTemplate("Dashboard"),
    label: "Dashboard",
  },
} as const);

export const routeGroups = [publicRoutes, privateRoutes] as const;

function createPageTitleTemplate(title: string) {
  return `${title} | ${publicEnv.APP_NAME}`;
}
