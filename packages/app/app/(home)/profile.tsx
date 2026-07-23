import { borderRadius, useTheme } from "@/src/theme";
import { useEffect, useState } from "react";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import * as Calendar from "expo-calendar";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useAuth, useUser, useClerk } from "@clerk/expo";
import { AuthView, UserButton, UserProfileView } from "@clerk/expo/native";

export default function Profile() {
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      paddingTop: 60,
      gap: 16,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { fontSize: 28, fontWeight: "bold", color: theme.foreground },
    button: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: borderRadius,
      alignItems: "center",
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  });

  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  // https://react.dev/reference/react-dom/components/select#controlling-a-select-box-with-a-state-variable
  const [selectedCalendar, setSelectedCalendar] =
    useState<Calendar.ExpoCalendar | null>(null);
  const [availableCalendars, setAvailableCalendars] = useState<
    Calendar.ExpoCalendar[] | null
  >(null);
  const [defaultCalendar, setDefaultCalendar] =
    useState<Calendar.ExpoCalendar | null>(null);
  const [storedCalendarId, setStoredCalendarId] = useState<string | null>(null);
  const settingsStorage = createAsyncStorage("settings");

  if (Platform.OS !== "web") {
  // https://docs.expo.dev/versions/v57.0.0/sdk/calendar/#usage
  useEffect(() => {
    (async () => {
      setStoredCalendarId(await settingsStorage.getItem("selectedCalendarId"));
      const { status } = await Calendar.requestCalendarPermissions();
      if (status === "granted") {
        const calendars = await Calendar.getCalendars(
          Calendar.EntityTypes.EVENT,
        );
        setAvailableCalendars(
          calendars.filter((cal) => cal.allowsModifications),
        );
        const defaultCal = Calendar.getDefaultCalendarSync();
        setDefaultCalendar(defaultCal);
        if (storedCalendarId) {
          const storedCalendar = calendars.find(
            (cal) => cal.id === storedCalendarId,
          );
          if (storedCalendar) {
            setSelectedCalendar(storedCalendar);
          }
        } else if (!storedCalendarId && defaultCal) {
          setSelectedCalendar(defaultCal);
        }
      } else if (status === "denied") {
        Alert.alert(
          "Permission denied",
          "Calendar access is required to view available calendars.",
        );
      }
    })();
  }, []);
}

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthView mode="signInOrUp" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: borderRadius,
            overflow: "hidden",
          }}
        >
          <UserButton />
        </View>
      </View>
      {user?.imageUrl && (
        <Image
          source={{ uri: user.imageUrl }}
          style={{ width: 48, height: 48, borderRadius: borderRadius }}
        />
      )}
      <Text style={{ color: theme.foreground }}>
        {user?.fullName ?? user?.id}
      </Text>

      <Text
        style={{
          color: theme.foreground,
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 20,
        }}
      >
        Available Calendars:
      </Text>
      <ScrollView style={{ flexGrow: 0, marginBottom: 40}}>
        {availableCalendars ? (
          availableCalendars.map((calendar) => (
            <TouchableOpacity
              key={calendar.id}
              onPress={async () => {
                setSelectedCalendar(calendar);
                await settingsStorage.setItem(
                  "selectedCalendarId",
                  calendar.id,
                );
                setStoredCalendarId(calendar.id);
              }}
              style={{
                padding: 10,
                borderRadius: borderRadius,
                backgroundColor:
                  selectedCalendar?.id === calendar.id
                    ? theme.primary
                    : theme.background,
              }}
            >
              <Text style={{ color: theme.foreground }}>
                {calendar.title}{" "}
                {calendar.id === defaultCalendar?.id ? "(Default on device)" : ""}{" "}{calendar.id === storedCalendarId ? "(Stored)" : ""}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <ActivityIndicator size="small" />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsProfileVisible(true)}
      >
        <Text style={styles.buttonText}>Manage Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      <Modal
        visible={isProfileVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsProfileVisible(false)}
      >
        <UserProfileView
          style={{ flex: 1 }}
          onDismiss={() => setIsProfileVisible(false)}
        />
      </Modal>
    </View>
  );
}
