import { homeTabs } from "@/src/tabs";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { Pressable, Text } from "react-native";

function TabButton({
  isFocused,
  children,
  ...props
}: {
  isFocused?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Pressable className="px-4 py-3" {...props}>
      <Text
        className={isFocused ? "text-primary font-semibold" : "text-foreground"}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export default function TabLayoutWeb() {
  return (
    <Tabs>
      <TabSlot />
      <TabList className="bg-background border-t border-foreground/20 justify-center">
        {homeTabs.map((tab) => (
          // these appear to be the defaults:
          // - TabList: flexDirection: 'row' + justifyContent: 'space-between' → triggers spread to opposite ends
          // - TabTrigger: flexDirection: 'row' + justifyContent: 'space-between' → icon + label spread within each trigger
          // so TabList needs justify-center
          <TabTrigger name={tab.name} href={tab.href} key={tab.name} asChild>
            <TabButton>{tab.label}</TabButton>
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}
