import { Stack } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { homeTabs } from "@/src/tabs";
import { useAuth } from "@clerk/expo";
import { AuthView } from "@clerk/expo/native";

export default function TabLayoutMobile() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <AuthView mode="signInOrUp" />;

  return (
    <>
      <NativeTabs>
        {homeTabs.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
      <Stack.Screen options={{ title: "Home" }} />
    </>
  );
}
