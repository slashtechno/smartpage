import { sendPicture } from "@/src/process";
import { borderRadius, useTheme } from "@/src/theme";
import { Link, router, Stack } from "expo-router";
import { useIncomingShare } from "expo-sharing";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { EventDraftContext } from "@/src/components/eventDraft";
import { useContext, useEffect, useState } from "react";
import { ClientContext } from "@/src/components/client";

export default function ShareReceived() {
  const { resolvedSharedPayloads, isResolving } = useIncomingShare();
  let theme = useTheme();
  const { setEventDrafts, setImageUri } = useContext(EventDraftContext)!;
  const client = useContext(ClientContext);
  const [isLoading, setLoading] = useState(false);

  //   https://react.dev/learn/synchronizing-with-effects#step-2-specify-the-effect-dependencies
  useEffect(() => {
    (async () => {
      console.log("resolvedSharedPayloads", resolvedSharedPayloads);
      if (resolvedSharedPayloads.length === 1 && !isResolving) {
        setLoading(true);
        setImageUri(resolvedSharedPayloads[0].contentUri);
        await sendPicture(
          resolvedSharedPayloads[0].contentUri!,
          resolvedSharedPayloads[0].mimeType === "image/png" ? "png" : "jpg",
          setEventDrafts,
          setLoading,
          client!,
        );
        //   Use replace since the user should never manually come back to this page
        router.replace("/confirm");
      } else if (!isResolving && resolvedSharedPayloads.length  < 0) {
        router.replace("/");
      }
    })();
  }, [resolvedSharedPayloads, isResolving]);

  if (isResolving) {
    return (
      <View
        className="centered-full"
        style={{
          backgroundColor: theme.background,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack.Screen options={{ title: "Smartpage" }} />
        <Text
          style={{
            color: theme.foreground,
          }}
        >
          Resolving shared content...
        </Text>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        className="centered-full"
        style={{
          backgroundColor: theme.background,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <>
            <Text style={{ color: theme.foreground }}>Processing shared content...</Text>
            <ActivityIndicator />
          </>
        ) : (
        // This should never be reached since the user should automatically be redirected to /confirm (or /)
        <Link
          href="/"
          style={{
            color: theme.foreground,
            padding: 10,
            backgroundColor: theme.primary,
            borderRadius: borderRadius,
          }}
        >
          Go home
        </Link>
        )}
      </View>
      {/* {resolvedSharedPayloads.map((payload, index) => { */}
      {/* if (payload.contentType === 'image') { */}
      {/* return <Image source={{ uri: payload.contentUri }} style={styles.image} key={index} />; */}
      {/* } */}
      {/* return null; */}
      {/* })} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
});
