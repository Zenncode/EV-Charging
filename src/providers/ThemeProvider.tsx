import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { AppTheme, getTheme } from "../theme/index";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  theme: AppTheme;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const value = useMemo<ThemeContextValue>(() => {
    const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));
    return {
      mode,
      theme: getTheme(mode),
      setMode,
      toggleMode,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}
