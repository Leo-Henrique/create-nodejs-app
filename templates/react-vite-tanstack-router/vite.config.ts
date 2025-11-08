import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: "./src/pages",
      generatedRouteTree: "./src/route-tree.gen.ts",
      indexToken: "index",
      routeToken: "layout",
      quoteStyle: "double",
      semicolons: true,
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths(),
  ],
  envPrefix: "PUBLIC",
});
