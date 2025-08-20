import { RouterProvider } from "react-router/dom";
import { router } from "./lib/react-router-config";

export function App() {
  return <RouterProvider router={router} />;
}
