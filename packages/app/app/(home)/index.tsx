import { useTheme } from "@/src/theme";
import Camera from "@/src/components/Camera";
import { Text, View, StyleSheet } from "react-native";
import { ConnectGoogle } from "@/src/components/connectGoogle";
import { useUser } from "@clerk/expo";

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

  const { user } = useUser();

    if (!user?.externalAccounts.some(a => a.provider === "google" && a.verification?.status === "verified"))
      return <ConnectGoogle />;

  return (
    <View style={styles.container}>
      {/*<Text style={styles.text}>Home Screen</Text>*/}
      <Camera />
    </View>
  );
}
