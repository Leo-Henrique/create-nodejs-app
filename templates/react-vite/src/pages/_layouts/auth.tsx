import { useCurrentRouteHandleParams } from "@/hooks/use-current-route-handle-params";
import { publicEnv } from "@/public-env";
import { Outlet } from "react-router";

export function AuthLayout() {
  const { handleParams } = useCurrentRouteHandleParams();
  const title = `${handleParams.metadata.title} | ${publicEnv.APP_NAME}`;

  return (
    <>
      <title>{title}</title>

      <div>
        <Outlet />
      </div>
    </>
  );
}
