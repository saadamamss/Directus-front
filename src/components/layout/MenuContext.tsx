"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface MenuContextType {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const COOKIE_NAME = "menuSidebarOpen";

function readCookie(): boolean {
  if (typeof document === "undefined") return true;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match) return true;
  return match[1] !== "false";
}

function writeCookie(value: boolean) {
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(readCookie);

  useEffect(() => {
    writeCookie(menuOpen);
  }, [menuOpen]);

  return (
    <MenuContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
