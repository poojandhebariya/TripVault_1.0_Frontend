import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../contexts/user/user";
import { ROUTES } from "../utils/constants";

const ProtectedRoute = () => {
  const { isLoggedIn, isProfileSetup, isLoading } = useUserContext();

  if (isLoading) {
    return null;
  }

  // Not authenticated at all → go home
  if (!isLoggedIn) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Authenticated but profile not set up → force profile setup first
  if (!isProfileSetup) {
    return <Navigate to={ROUTES.USER.PROFILE_SETUP} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
