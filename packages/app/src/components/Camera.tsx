import { useTheme } from "@/src/theme";
import { Text, View, StyleSheet, Button, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function Camera() {
  let theme = useTheme();
  const styles = StyleSheet.create({
    text: {
      color: theme.text,
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

      borderRadius: "5%"
    },
    cameraView: {
      width: "100%",
      height: "100%",
    },
    buttonContainer: {
      position: "absolute",
      bottom: 64,
      flexDirection: "row",
      backgroundColor: "transparent",
      width: "100%",
      paddingHorizontal: 64,
    },
    button: {
      flex: 1,
      alignItems: "center",
    },
  });

  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) {
    return <View />; // eventually change this to a loading spinner componnt
  }

  return (
    <View style={{ justifyContent: "center", flex: 1 }}>
      {/*Expand this container in whatever space is left after the text (using flex) and then center children on the primary axis*/}
      {permission.granted ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.cameraView} facing="back" />
          {/*<View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>*/}
        </View>
      ) : (
        <View style={{backgroundColor: theme.background}}>
          <Text style={styles.message}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      )}
    </View>
  );
}
