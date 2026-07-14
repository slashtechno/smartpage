import { useTheme } from "@/src/theme";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState, useContext } from "react";
import { ClientContext } from "./client";
import { AppType } from "api";
import { hc } from "hono/client";
import { EventDraft, EventDraftContext } from "./eventDraft";
import { router } from "expo-router";

let ref: React.RefObject<CameraView | null>;

const takePicture = async (
  setImageUri: React.Dispatch<React.SetStateAction<string | null>>,
  setEventDrafts: React.Dispatch<React.SetStateAction<EventDraft[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  client: ReturnType<typeof hc<AppType>>,
) => {
  setLoading(true);
  const photo = await ref.current?.takePictureAsync();
  if (!photo?.uri) {
    console.error("Failed to take picture");
    setLoading(false);
    return;
  }
  setImageUri(photo.uri);
  const photoFetched = await fetch(photo.uri);
  const photoBlob = await photoFetched.blob();


  // Initate upload
  let initateUploadRes = await client.api.storage.$post({
    json: {
      imageFormat: photo.format,
    },
  })
  if (!initateUploadRes.ok) {
    console.error("Failed to initiate upload");
    setLoading(false);
    return;
  }
  const { presignedUrl, jwtToken } = await initateUploadRes.json();

  // Upload to the presignedUrl
  const uploadRes = await fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'content-type': `image/${photo.format}`},
  body: photoBlob,
});
  if (!uploadRes.ok) {
    console.error("Failed to upload image to presigned URL");
    setLoading(false);
    return;
  }


  const processRes = await client.api.events.process.$post({
    form: {
      uploadJwt: jwtToken,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });
  setLoading(false);
  if (!processRes.ok) return;
  const eventData = await processRes.json();
  console.log("Event data:", eventData)
  setEventDrafts(eventData.eventDetails.events);
  router.push("/confirm");
};

export default function Camera() {
  const client = useContext(ClientContext);
  const { setEventDrafts, setImageUri } = useContext(EventDraftContext)!;
  const [isProcessing, setIsProcessing] = useState(false);

  ref = useRef<CameraView>(null);
  let theme = useTheme();
  const styles = StyleSheet.create({
    text: {
      color: theme.foreground,
      textAlign: "center",
    },

    message: {
      textAlign: "center",
      paddingBottom: 10,
    },

    cameraContainer: {
      // aspectRatio: 4 / 3,
      overflow: "hidden", // clip to aspect ratio
      // aspectRatio: 3/4,
      aspectRatio: Platform.select({ web: 4 / 3, default: 3 / 4 }),
      width: Platform.select({ web: "50%", default: "85%" }),
      maxHeight: "100%",

      // controls itself within parent
      alignSelf: "center",

      borderRadius: "5%",
    },
    cameraView: {
      width: "100%",
      height: "100%",
    },
    buttonContainer: {
      position: "absolute",
      bottom: 32,
      flexDirection: "row", // if more buttons get added
      backgroundColor: "transparent",
      width: "100%",
      paddingHorizontal: 64,
    },
    button: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 15,
      borderRadius: "10%",
      backgroundColor: theme.background,
    },
  });

  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) {
    return (
      <View className="centered-full">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ justifyContent: "center", flex: 1 }}>
      {/*Expand this container in whatever space is left after the text (using flex) and then center children on the primary axis*/}
      {permission.granted ? (
        <View style={styles.cameraContainer}>
          <CameraView ref={ref} style={styles.cameraView} facing="back" />
          <View style={styles.buttonContainer}>
            {isProcessing ? (
              <ActivityIndicator style={styles.button} />
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  takePicture(
                    setImageUri,
                    setEventDrafts,
                    setIsProcessing,
                    client!,
                  );
                }}
              >
                <Text style={styles.text}>Take picture</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={{ backgroundColor: theme.background }}>
          <Text style={styles.message}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      )}
    </View>
  );
}
