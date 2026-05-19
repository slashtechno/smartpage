import '@/src/global.css';
import { VariableContextProvider } from "nativewind";
  import { Stack } from "expo-router";
import { Platform, useColorScheme } from "react-native";
import { colors, themes } from '@/src/theme';

export default function RootLayout() {
  // https://docs.expo.dev/tutorial/configuration/#configure-the-status-bar & https://docs.expo.dev/router/advanced/stack/#configure-header-bar
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
  <VariableContextProvider value={themes[colorScheme]}>
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors[colorScheme].background,
        },
        headerTitleStyle: {
          color: colors[colorScheme].foreground
        },
        // https://docs.expo.dev/router/advanced/platform-specific-modules/#platform-module
        // headerShadowVisible: Platform.OS === "web" ? false : true
        headerShown: Platform.OS === "web" ? false : true,
      }}
    >
      {/*<Stack.Screen name="(home)" options={{title: "hello"}} />*/}
      </Stack>
  </VariableContextProvider>
  );
}
