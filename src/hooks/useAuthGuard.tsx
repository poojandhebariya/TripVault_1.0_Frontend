import { useAuthGuard as useGlobalAuthGuard } from "../contexts/auth-guard-context";

/**
 * Hook to consume the global AuthGuard.
 * Triggers the global AuthRequiredModal when unauthorized actions are attempted.
 */
export const useAuthGuard = () => {
  return useGlobalAuthGuard();
};
