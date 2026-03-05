import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../contexts/user/user";
import { ROUTES } from "../utils/constants";

/**
 * Guards the profile-setup page so that:
 * - Only logged-in users (has a bearer token) can access it.
 * - Users who have already completed profile setup are redirected to Home.
 * - Unauthenticated users are redirected to Sign In.
 */
const ProfileSetupRoute = () => {
  const { isLoggedIn, isProfileSetup, isLoading } = useUserContext();

  if (isLoading) {
    return null;
  }

  // Not authenticated → must sign in / sign up first
  if (!isLoggedIn) {
    return <Navigate to={ROUTES.AUTH.SIGN_IN} replace />;
  }

  // Already completed profile setup → no need to be here
  if (isProfileSetup) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};

export default ProfileSetupRoute;
