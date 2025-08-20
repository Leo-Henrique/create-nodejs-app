import { useCurrentRoute } from "@/hooks/use-current-route";
import { Outlet } from "react-router";

export function AppLayout() {
  const currentRoute = useCurrentRoute();

  return (
    <>
      {currentRoute && <title>{currentRoute.title}</title>}

      <div>
        <Outlet />
      </div>
    </>
  );
}
