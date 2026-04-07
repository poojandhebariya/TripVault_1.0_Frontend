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
    BUCKETLIST: "/user/profile/bucket-list",
    PUBLIC_PROFILE: "/user/:id",
    PUBLIC_PROFILE_PATH: (id: string) => `/user/${id}`,
    OWN_FOLLOWERS: "/user/profile/followers",
    OWN_FOLLOWING: "/user/profile/following",
    PUBLIC_FOLLOWERS: (id: string) => `/user/${id}/followers`,
    PUBLIC_FOLLOWING: (id: string) => `/user/${id}/following`,
    MAP: "/user/profile/map",
  },
  VAULT: {
    CREATE_VAULT: "/vault/create",
    EDIT_VAULT: "/vault/edit/:id",
    VAULT_DETAIL: "/vault/:id",
  },
  EXPLORE: "/explore",
  EXPLORE_COUNTRY_DETAIL: "/explore/country/:code",
  EXPLORE_PLACE_DETAIL: "/explore/place/:id",
  EXPLORE_PLACE_DETAIL_PATH: (id: string) => `/explore/place/${id}`,
  SEARCH: "/search",
  HOME: "/",
  NOTIFICATIONS: "/notifications",
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
