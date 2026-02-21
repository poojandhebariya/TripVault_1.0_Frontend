import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../../pages/types/user";
import { del, get, set } from "idb-keyval";

interface UserContextProps {
  user?: User;
  updateUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
  isLoggedIn: boolean;
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

  useEffect(() => {
    get("user").then((user: User | undefined) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const updateUser = async (user: User) => {
    setUser(user);
    await set("user", user);
  };

  const clearUser = async () => {
    setUser(undefined);
    await del("user");
  };

  const isLoggedIn = !!user;

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};
