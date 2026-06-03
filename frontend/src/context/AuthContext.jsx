import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);
const tokenKey = "gwn_admin_token";
const userKey = "gwn_admin_user";

const readUser = () => {
  try {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    return JSON.parse(sessionStorage.getItem(userKey));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    return sessionStorage.getItem(tokenKey);
  });
  const [user, setUser] = useState(readUser);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: async (email, password) => {
        const response = await api.post("/auth/login", { email, password });
        sessionStorage.setItem(tokenKey, response.data.token);
        sessionStorage.setItem(userKey, JSON.stringify(response.data.user));
        setToken(response.data.token);
        setUser(response.data.user);
        return response.data;
      },
      logout: () => {
        sessionStorage.removeItem(tokenKey);
        sessionStorage.removeItem(userKey);
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
