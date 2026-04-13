import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);
export const THEME_STORAGE_KEY = "accord-theme";

function normalizeTheme(value) {
  return value === "light" ? "light" : "dark";
}

function readStoredTheme() {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY) || "dark");
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState(() => readStoredTheme() || "dark");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!storedTheme && user?.theme) {
      setThemeState(normalizeTheme(user.theme));
    }
  }, [user?.theme]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      return;
    }

    document.documentElement.classList.remove("dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
  }, [theme]);

  const setTheme = (nextTheme) => setThemeState(normalizeTheme(nextTheme));
  const toggle = () => setThemeState((current) => (current === "dark" ? "light" : "dark"));

  const value = {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggle,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
