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
    PROFILE: "/user/profile",
    PROFILE_VAULTS: "/user/profile/vaults",
    PROFILE_TAGGED: "/user/profile/tagged",
    PROFILE_EDIT: "/user/profile/edit",
    SAVED: "/user/profile/saved",
  },
  VAULT: {
    CREATE_VAULT: "/vault/create",
    EDIT_VAULT: "/vault/edit/:id",
    VAULT_DETAIL: "/vault/:id",
  },
  PLAN_TRIP: "/plan-trip",
  EXPLORE: "/explore",
  SEARCH: "/search",
  HOME: "/",
};

export const LOCAL_STORAGE_KEYS = {
  BEARER_TOKEN: "bearer_token",
  TOKEN: "token",
};

/** Base URL of the web app — used to build shareable deep-links */
export const APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL ?? window.location.origin;

/** Returns the full shareable URL for a vault */
export const getVaultShareUrl = (vaultId: string) =>
  `${APP_BASE_URL}/vault/${vaultId}`;
