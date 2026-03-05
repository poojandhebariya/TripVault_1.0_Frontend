import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../../pages/types/user";
import { del, get, set, clear } from "idb-keyval";
import type { AuthResponse } from "../../pages/types/auth-response";

interface UserContextProps {
  user?: User;
  updateUser: (user: User) => Promise<void>;
  /** Call immediately after saveTokens() to reflect login state in memory */
  markLoggedIn: () => void;
  clearUser: () => Promise<void>;
  clearAll: () => Promise<void>;
  /** True when the user has an active auth token (signed in via login/signup) */
  isLoggedIn: boolean;
  /** True when the user has completed their profile setup */
  isProfileSetup: boolean;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextProps | undefined>(
  undefined,
);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const [storedUser, storedToken] = await Promise.all([
        get<User>("user"),
        get<AuthResponse>("bearerToken"),
      ]);

      // Has a bearer token = authenticated (logged in / signed up)
      if (storedToken?.accessToken) {
        setIsLoggedIn(true);
      }

      // Has user object = profile is set up
      if (storedUser) {
        setUser(storedUser);
        setIsProfileSetup(true);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  /** Immediately marks the user as logged in (has bearer token) without setting the profile */
  const markLoggedIn = () => {
    setIsLoggedIn(true);
  };

  const updateUser = async (user: User) => {
    setUser(user);
    await set("user", user);
    setIsLoggedIn(true);
    setIsProfileSetup(true);
  };

  const clearUser = async () => {
    setUser(undefined);
    await del("user");
    await del("bearerToken");
    setIsLoggedIn(false);
    setIsProfileSetup(false);
  };

  const clearAll = async () => {
    await clear();
    setUser(undefined);
    setIsLoggedIn(false);
    setIsProfileSetup(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        markLoggedIn,
        clearUser,
        clearAll,
        isLoggedIn,
        isProfileSetup,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
