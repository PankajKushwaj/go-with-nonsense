import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";

const NotFound = () => (
  <div className="container-page py-16">
    <EmptyState
      title="Page not found"
      message="The page you are looking for does not exist."
      action={
        <Link to="/" className="btn-primary">
          Back Home
        </Link>
      }
    />
  </div>
);

export default NotFound;
