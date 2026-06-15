import { useTheme } from "@/src/theme";
import Camera from "@/src/components/Camera";
import { View, StyleSheet } from "react-native";

export default function Index() {
  let theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
  });

  return (
    <View style={styles.container}>
      <Camera />
    </View>
  );
}
