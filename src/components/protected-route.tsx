import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../contexts/user/user";
import { ROUTES } from "../utils/constants";

const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useUserContext();

  if (isLoading) {
    return null; // Or a spinner if you prefer
  }

  if (!isLoggedIn) {
    // On mobile, we handle this via modals in MobileLayout,
    // but as a fallback/security for direct URL access,
    // we redirect to Home or Sign In.
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
