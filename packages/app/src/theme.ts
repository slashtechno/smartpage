import { useColorScheme } from "react-native";

export const colors = {
  // background: page/screen fill | foreground: default text | primary: brand/action color
  light: { background: "#FFFFFF", foreground: "#264653", primary: "#2A9D8F" },
  dark: { background: "#111827", foreground: "#F9FAFB", primary: "#2A9D8F" },
} as const;

export const themes = {
  light: {
    "--color-primary": colors.light.primary,
    "--color-background": colors.light.background,
    "--color-foreground": colors.light.foreground,
  },
  dark: {
    "--color-primary": colors.dark.primary,
    "--color-background": colors.dark.background,
    "--color-foreground": colors.dark.foreground,
  },
} as const;

export function useTheme() {
  const scheme = useColorScheme();
  return colors[scheme === "dark" ? "dark" : "light"];
}

export const borderRadius = 12;