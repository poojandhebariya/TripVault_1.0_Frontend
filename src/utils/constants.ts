export const ROUTES = {
  AUTH: {
    BASE: "/auth",
    SIGN_IN: "/auth/sign-in",
    SIGN_UP: "/auth/sign-up",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USER: {
    PROFILE_SETUP: "/user/profile-setup",
  },
  CREATE_VAULT: "/create-vault",
  PLAN_TRIP: "/plan-trip",
  EXPLORE: "/explore",
  SEARCH: "/search",
  HOME: "/",
};

export const LOCAL_STORAGE_KEYS = {
  BEARER_TOKEN: "bearer_token",
  TOKEN: "token",
};
