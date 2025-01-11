import { Link } from "react-router";
import "./styles.css";

export function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <h1>Hello world!</h1>

      <Link to="/sign-in">Sign out</Link>
    </div>
  );
}
