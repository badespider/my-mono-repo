"use client";

import { createContext, useContext, useState, useEffect } from "react";

type ColorMode = "light" | "dark";

interface ColorModeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
  isHydrated: boolean;
}

const ColorModeContext = createContext<ColorModeContextType>({
  colorMode: "light",
  toggleColorMode: () => {},
  setColorMode: () => {},
  isHydrated: false,
});

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>("light");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved theme from localStorage after hydration
  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true);
    
    // Then load the theme preference
    const saved = localStorage.getItem("chakra-ui-color-mode");
    if (saved === "dark" || saved === "light") {
      setColorModeState(saved);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setColorModeState(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  // Apply theme to document only after hydration
  useEffect(() => {
    if (isHydrated) {
      document.documentElement.setAttribute("data-theme", colorMode);
      localStorage.setItem("chakra-ui-color-mode", colorMode);
    }
  }, [colorMode, isHydrated]);

  const toggleColorMode = () => {
    setColorModeState(prev => (prev === "light" ? "dark" : "light"));
  };

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
  };

  const value = {
    colorMode,
    toggleColorMode,
    setColorMode,
    isHydrated,
  };

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return context;
}
