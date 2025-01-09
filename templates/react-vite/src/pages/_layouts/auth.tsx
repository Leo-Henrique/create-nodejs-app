import { useCurrentRouteHandleParams } from "@/hooks/use-current-route-handle-params";
import { authNavigationRoutes } from "@/routes";
import { Helmet } from "react-helmet-async";
import { Link, Outlet } from "react-router";

export function AuthLayout() {
  const { handleParams } = useCurrentRouteHandleParams();

  return (
    <>
      <Helmet title={handleParams.metadata.title} />

      <header>
        <nav>
          <ul>
            {authNavigationRoutes.map(route => (
              <li key={route.path}>
                <Link to={route.path}>{route.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div>
        <Outlet />
      </div>
    </>
  );
}
