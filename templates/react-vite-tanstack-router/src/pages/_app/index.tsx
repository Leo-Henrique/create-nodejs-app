import { env } from "@/env";
import { createFileRoute, Link } from "@tanstack/react-router";
import "./styles.css";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: `Dashboard | ${env.PUBLIC_APP_NAME}`,
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="dashboard-wrapper">
      <h1>Hello world!</h1>

      <Link to="/sign-in">Sign out</Link>
    </div>
  );
}
