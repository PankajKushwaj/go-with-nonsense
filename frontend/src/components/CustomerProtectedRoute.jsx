import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const CustomerProtectedRoute = ({ children }) => {
  const { isCustomerAuthenticated } = useCustomerAuth();
  const location = useLocation();

  if (!isCustomerAuthenticated) {
    return <Navigate to="/customer-login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default CustomerProtectedRoute;
