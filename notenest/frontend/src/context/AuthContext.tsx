import { createContext, ReactNode, useEffect, useState } from "react";
import { authApi } from "@/api/auth.api";
import { User } from "@/types";
import { getErrorMessage } from "@/api/axios";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "notenest_token";
const USER_KEY = "notenest_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, trust a cached user for an instant UI, then verify the
  // token against the server in the background (in case it expired).
  useEffect(() => {
    const cachedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (cachedUser && token) {
      setUser(JSON.parse(cachedUser));
      authApi
        .me()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        })
        .catch(() => {
          // Interceptor in axios.ts already clears storage + redirects on 401.
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  function persistSession(nextUser: User, token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  async function login(email: string, password: string) {
    try {
      const { user: loggedInUser, token } = await authApi.login(email, password);
      persistSession(loggedInUser, token);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const { user: newUser, token } = await authApi.register(name, email, password);
      persistSession(newUser, token);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
