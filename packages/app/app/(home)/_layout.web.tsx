import { homeTabs } from "@/src/tabs";
import { Stack } from "expo-router";
import { Text } from "@react-navigation/elements";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
export default function TabLayoutWeb() {
  return (
    <>
      <Tabs>
        <TabSlot />
        <TabList>
          {homeTabs.map((tab) => (
            <TabTrigger name={tab.name} href={tab.href} key={tab.name}>
              <Text>{tab.label}</Text>
            </TabTrigger>
          ))}
        </TabList>
      </Tabs>

      {/*<Stack.Screen options={{ title: "Home" }} />*/}
    </>
  );
}
