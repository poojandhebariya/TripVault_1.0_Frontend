import { Route, Routes } from "react-router-dom";
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

const AppRoutes = () => {
  const isMobile = useIsMobile();

  const Layout = isMobile ? MobileLayout : AppLayout;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path={ROUTES.AUTH.SIGN_IN} element={<SignIn />} />
        <Route path={ROUTES.AUTH.SIGN_UP} element={<SignUp />} />
        <Route
          path={ROUTES.AUTH.FORGOT_PASSWORD}
          element={<ForgotPassword />}
        />
        <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={ROUTES.USER.PROFILE_SETUP} element={<ProfileSetup />} />
        <Route path={ROUTES.SEARCH} element={<>Search </>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
