import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import "./index.css";
import { swrConfig } from "./lib/swr-config";
import { tanstackRouterInstance } from "./lib/tanstack-router-instance";
import "./lib/zod-config";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Root element is not defined.");

createRoot(rootElement).render(
  <StrictMode>
    <SWRConfig value={swrConfig}>
      <RouterProvider router={tanstackRouterInstance} />
    </SWRConfig>
  </StrictMode>,
);
