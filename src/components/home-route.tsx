import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../contexts/user/user";
import { ROUTES } from "../utils/constants";

/**
 * Public-facing wrapper for the home page.
 * If the user is logged in but has NOT completed profile setup,
 * redirect them to the profile setup page.
 * Everyone else (logged out, or fully set up) sees the Home page normally.
 */
const HomeRoute = () => {
  const { isLoggedIn, isProfileSetup, isLoading } = useUserContext();

  if (isLoading) {
    return null;
  }

  // Logged in but profile incomplete → must finish setup first
  if (isLoggedIn && !isProfileSetup) {
    return <Navigate to={ROUTES.USER.PROFILE_SETUP} replace />;
  }

  return <Outlet />;
};

export default HomeRoute;
