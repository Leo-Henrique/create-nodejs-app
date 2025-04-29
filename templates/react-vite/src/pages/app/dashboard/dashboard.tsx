import { publicRoutes } from "@/routes";
import { Link } from "react-router";
import "./styles.css";

export function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <h1>Hello world!</h1>

      <Link to={publicRoutes.signIn.path}>Sign out</Link>
    </div>
  );
}
