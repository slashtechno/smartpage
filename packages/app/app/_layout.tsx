import "@/src/global.css";
import { VariableContextProvider } from "nativewind";
import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Platform, useColorScheme } from "react-native";
import { colors, themes } from "@/src/theme";
import { ClientProvider, UrlProvider } from "@/src/components/client";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  // https://docs.expo.dev/tutorial/configuration/#configure-the-status-bar & https://docs.expo.dev/router/advanced/stack/#configure-header-bar
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
  return (
    <UrlProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClientProvider>
          <VariableContextProvider value={themes[colorScheme]}>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors[colorScheme].background,
                },
                headerTitleStyle: {
                  color: colors[colorScheme].foreground,
                },
                // https://docs.expo.dev/router/advanced/platform-specific-modules/#platform-module
                // headerShadowVisible: Platform.OS === "web" ? false : true
                headerShown: Platform.OS === "web" ? false : true,
              }}
            >
              {/*<Stack.Screen name="(home)" options={{title: "hello"}} />*/}
            </Stack>
          </VariableContextProvider>
        </ClientProvider>
      </ClerkProvider>
    </UrlProvider>
  );
}
