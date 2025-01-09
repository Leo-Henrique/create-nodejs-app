import { Helmet, HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router/dom";
import { env } from "./env";
import { router } from "./routes";

export function App() {
  return (
    <HelmetProvider>
      <Helmet titleTemplate={`%s | ${env.APP_NAME}`}></Helmet>

      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
