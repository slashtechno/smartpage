import { useTheme } from "@/src/theme";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {
  // https://docs.expo.dev/tutorial/configuration/#configure-the-status-bar & https://docs.expo.dev/router/advanced/stack/#configure-header-bar
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.text,
        },
        // https://docs.expo.dev/router/advanced/platform-specific-modules/#platform-module
        // headerShadowVisible: Platform.OS === "web" ? false : true
        headerShown: Platform.OS === "web" ? false : true,
      }}
    />
  );
}
