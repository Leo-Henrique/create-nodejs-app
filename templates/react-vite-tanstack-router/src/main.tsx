import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { tanstackRouterInstance } from "./lib/tanstack-router-instance";
import "./lib/zod-config";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Root element is not defined.");

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={tanstackRouterInstance} />
  </StrictMode>,
);
