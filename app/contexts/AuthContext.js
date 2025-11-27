"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCookie, removeCookie } from "../libs/cookies";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getCookie("auth_token");
    const userData = getCookie("user_data");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    setCookie("auth_token", token, 7);
    setCookie("user_data", JSON.stringify(userData), 7);
    setUser(userData);
  };

  const logout = () => {
    removeCookie("auth_token");
    removeCookie("user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
