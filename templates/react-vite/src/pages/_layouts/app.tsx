import { useCurrentRouteHandleParams } from "@/hooks/use-current-route-handle-params";
import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router";

export function AppLayout() {
  const { handleParams } = useCurrentRouteHandleParams();

  return (
    <>
      <Helmet title={handleParams.metadata.title} />

      <div>
        <Outlet />
      </div>
    </>
  );
}
