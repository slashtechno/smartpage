import { useUser } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { borderRadius, useTheme } from "@/src/theme";

export function ConnectGoogle() {
  const theme = useTheme();
  const { user } = useUser();

  const connectGoogle = async () => {
    // redirectUrl must match what's registered in Clerk dashboard
    const redirectUrl = AuthSession.makeRedirectUri({ path: "oauth-native-callback" });

    // Creates a pending external account and returns the Google consent URL
    const account = await user!.createExternalAccount({
      strategy: "oauth_google",
      redirectUrl,
    });

    const verifyUrl = account.verification!.externalVerificationRedirectURL!;

    // Opens Google consent screen in a browser, waits for redirect back
    const result = await WebBrowser.openAuthSessionAsync(verifyUrl.toString(), redirectUrl);

    console.log("OAuth result:", result.type, result.type === "success" ? result.url : "");
    if (result.type === "success") {
      const nonce = new URL(result.url).searchParams.get("rotating_token_nonce") ?? "";
      console.log("Nonce:", nonce);
      await user!.reload({ rotatingTokenNonce: nonce } as Parameters<typeof user.reload>[0]);
      console.log("Google accounts after reload:", user!.externalAccounts.filter(a => a.provider === "google"));
    }
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: borderRadius,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: { color: theme.foreground, fontSize: 16, fontWeight: "600" },
  });

  return (
    <View className={"centered-full"} style={{backgroundColor: theme.background}}>
    <TouchableOpacity style={styles.button} onPress={connectGoogle}>
      <Text style={styles.buttonText}>Connect Google Calendar</Text>
      </TouchableOpacity>
    </View>
  );
}
