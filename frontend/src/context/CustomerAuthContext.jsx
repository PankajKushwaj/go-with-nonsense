import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client.js";

const CustomerAuthContext = createContext(null);
const customerTokenKey = "gwn_customer_token";
const customerUserKey = "gwn_customer_user";

const readCustomer = () => {
  try {
    localStorage.removeItem(customerTokenKey);
    localStorage.removeItem(customerUserKey);
    return JSON.parse(sessionStorage.getItem(customerUserKey));
  } catch {
    return null;
  }
};

export const CustomerAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    localStorage.removeItem(customerTokenKey);
    localStorage.removeItem(customerUserKey);
    return sessionStorage.getItem(customerTokenKey);
  });
  const [user, setUser] = useState(readCustomer);

  const saveSession = (data) => {
    sessionStorage.setItem(customerTokenKey, data.token);
    sessionStorage.setItem(customerUserKey, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isCustomerAuthenticated: Boolean(token),
      login: async (email, password) => {
        const response = await api.post("/auth/customer/login", { email, password });
        return saveSession(response.data);
      },
      register: async (payload) => {
        const response = await api.post("/auth/customer/register", payload);
        return saveSession(response.data);
      },
      logout: () => {
        sessionStorage.removeItem(customerTokenKey);
        sessionStorage.removeItem(customerUserKey);
        localStorage.removeItem(customerTokenKey);
        localStorage.removeItem(customerUserKey);
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
};
