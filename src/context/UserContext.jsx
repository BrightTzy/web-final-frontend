// src/context/UserContext.jsx

import { createContext, useEffect, useRef, useState } from "react";

const rawApiUrl = import.meta.env.VITE_API_URL || "";
export const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

export const UserContext = createContext();

export function UserProvider({ children }) {
  const isInit = useRef(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");
  const [isLogInError, setIsLoginError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Authenticated fetch helper: sends credentials (cookies) and Authorization Bearer header
  const authFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
    const headers = { ...(options.headers || {}) };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });
  };

  useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authFetch("/api/me", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const login = async (emailOrUsername, password) => {
    setIsLoginError(false);
    setLoginErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailOrUsername,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setUser(data.user);
        setIsLoggedIn(true);
        setIsLoginError(false);
        setLoginErrorMsg("");
        return true;
      } else {
        setIsLoggedIn(false);
        setIsLoginError(true);
        setLoginErrorMsg(data.message || "Invalid credentials");
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setIsLoggedIn(false);
      setIsLoginError(true);
      setLoginErrorMsg("Network error during login");
      return false;
    }
  };

  const register = async (username, email, password, role) => {
    setIsLoginError(false);
    setLoginErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setUser(data.user);
        setIsLoggedIn(true);
        setIsLoginError(false);
        setLoginErrorMsg("");
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (err) {
      console.error("Register error:", err);
      return { success: false, message: "Network error during registration" };
    }
  };

  const logout = async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        isInitializing,
        isLogInError,
        loginErrorMsg,
        login,
        register,
        logout,
        authFetch,
        checkAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
