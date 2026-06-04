import { useTheme } from "@/src/theme";
import Camera from "@/src/components/Camera";
import { Text, View, StyleSheet } from "react-native";
export default function Index() {
  let theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    text: {
      color: theme.foreground,
      textAlign: "center",
      margin: "1%",
    },
  });
  return (
    <View style={styles.container}>
      {/*<Text style={styles.text}>Home Screen</Text>*/}
      <Camera />
    </View>
  );
}
