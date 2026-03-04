import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../../pages/types/user";
import { del, get, set, clear } from "idb-keyval";

interface UserContextProps {
  user?: User;
  updateUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
  clearAll: () => Promise<void>;
  isLoggedIn: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    get("user").then((user: User | undefined) => {
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    });
  }, []);

  const updateUser = async (user: User) => {
    setUser(user);
    await set("user", user);
    setIsLoggedIn(true);
  };

  const clearUser = async () => {
    setUser(undefined);
    await del("user");
    setIsLoggedIn(false);
  };

  const clearAll = async () => {
    await clear();
    setUser(undefined);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider
      value={{ user, updateUser, clearUser, clearAll, isLoggedIn, isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};
