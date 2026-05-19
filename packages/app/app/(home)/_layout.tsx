import { Stack } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { homeTabs } from "@/src/tabs";
export default function TabLayoutMobile() {
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
