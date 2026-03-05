import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/app-layout";
import MobileLayout from "./layout/mobile-layout";
import SignIn from "./pages/sign-in/sign-in";
import SignUp from "./pages/sign-up/sign-up";
import ProfileSetup from "./pages/profile-setup/profile-setup";
import ForgotPassword from "./pages/forgot-password/forgot-password";
import ResetPassword from "./pages/reset-password/reset-password";
import { ROUTES } from "./utils/constants";
import Home from "./pages/home/home";
import useIsMobile from "./hooks/isMobile";
import Profile from "./pages/profile/profile";
import Vaults from "./pages/profile/vaults";
import Tagged from "./pages/profile/tagged";
import EditProfile from "./pages/profile/edit-profile";
import CreateVault from "./pages/vault/create-vault";
import ProtectedRoute from "./components/protected-route";
import ProfileSetupRoute from "./components/profile-setup-route";
import HomeRoute from "./components/home-route";

const AppRoutes = () => {
  const isMobile = useIsMobile();

  const Layout = isMobile ? MobileLayout : AppLayout;

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes — but redirect to profile-setup if logged in without a profile */}
        <Route element={<HomeRoute />}>
          <Route index element={<Home />} />
          <Route path={ROUTES.AUTH.SIGN_IN} element={<SignIn />} />
          <Route path={ROUTES.AUTH.SIGN_UP} element={<SignUp />} />
          <Route
            path={ROUTES.AUTH.FORGOT_PASSWORD}
            element={<ForgotPassword />}
          />
          <Route
            path={ROUTES.AUTH.RESET_PASSWORD}
            element={<ResetPassword />}
          />
          <Route path={ROUTES.SEARCH} element={<>Search </>} />
        </Route>

        {/* Profile Setup — only accessible when logged in but profile not yet complete */}
        <Route element={<ProfileSetupRoute />}>
          <Route path={ROUTES.USER.PROFILE_SETUP} element={<ProfileSetup />} />
        </Route>

        {/* Protected Routes — requires login AND completed profile setup */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.USER.PROFILE} element={<Profile />}>
            <Route
              index
              element={<Navigate to={ROUTES.USER.PROFILE_VAULTS} replace />}
            />
            <Route path="vaults" element={<Vaults />} />
            <Route path="tagged" element={<Tagged />} />
          </Route>
          <Route path={ROUTES.USER.PROFILE_EDIT} element={<EditProfile />} />
          <Route path={ROUTES.VAULT.CREATE_VAULT} element={<CreateVault />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
