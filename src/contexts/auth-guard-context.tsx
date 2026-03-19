import React, { createContext, useContext, useState, useCallback } from "react";
import { useUserContext } from "./user/user";
import AuthRequiredModal from "../components/ui/auth-required-modal";

interface AuthGuardContextType {
  /**
   * Guards a function. If the user is logged in, executes it.
   * If not, shows the AuthRequiredModal globally.
   * Returns true if allowed/executed, false otherwise.
   */
  guard: (action: () => void, activity: string) => boolean;
}

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(
  undefined,
);

export const AuthGuardProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activity, setActivity] = useState("");

  const guard = useCallback(
    (action: () => void, activityName: string) => {
      if (isLoggedIn) {
        action();
        return true;
      }
      setActivity(activityName);
      setIsOpen(true);
      return false;
    },
    [isLoggedIn],
  );

  return (
    <AuthGuardContext.Provider value={{ guard }}>
      {children}
      <AuthRequiredModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        action={activity}
      />
    </AuthGuardContext.Provider>
  );
};

export const useAuthGuard = () => {
  const context = useContext(AuthGuardContext);
  if (!context) {
    throw new Error("useAuthGuard must be used within an AuthGuardProvider");
  }
  return context;
};
