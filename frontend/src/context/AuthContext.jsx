import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);
const tokenKey = "gwn_admin_token";
const userKey = "gwn_admin_user";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(userKey));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState(readUser);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: async (email, password) => {
        const response = await api.post("/auth/login", { email, password });
        localStorage.setItem(tokenKey, response.data.token);
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
        setToken(response.data.token);
        setUser(response.data.user);
        return response.data;
      },
      logout: () => {
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
