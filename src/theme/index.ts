import { darkTheme } from "./dark";
import { lightTheme } from "./light";

export type AppTheme = typeof lightTheme | typeof darkTheme;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export function getTheme(mode: "light" | "dark") {
  return mode === "dark" ? darkTheme : lightTheme;
}
