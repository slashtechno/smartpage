import { useColorScheme } from "react-native";

const palette = {
  light: { background: "#FFFFFF", text: "#264653", accent: "#2A9D8F" },
  dark: { background: "#111827", text: "#F9FAFB", accent: "#2A9D8F" },
};

export function useTheme() {
  const scheme = useColorScheme();
  return palette[scheme ?? "light"];
}
// To use it in a component:
// get the theme with `const theme = useTheme();`
// and then use theme.text or whtever in place of a color
