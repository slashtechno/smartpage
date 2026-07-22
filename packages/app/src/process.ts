import { Alert } from "react-native";
import { AppType } from "api";
import { hc } from "hono/client";
import { router } from "expo-router";
import { EventDraft } from "./components/eventDraft";

export async function sendPicture(
  //   photoBlob: Blob,
  photoUri: string,
  photoFormat: "jpg" | "png",
  setEventDrafts: React.Dispatch<React.SetStateAction<EventDraft[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  client: ReturnType<typeof hc<AppType>>,
): Promise<void> {

  console.log("Sending picture", { photoFormat });
    
  const photoFetched = await fetch(photoUri);
  const photoBlob = await photoFetched.blob();

  // Initate upload
  let initateUploadRes = await client.api.storage.$post({
    json: {
      imageFormat: photoFormat,
    },
  });
  if (!initateUploadRes.ok) {
    console.error("Failed to initiate upload");
    setLoading(false);
    return;
  }
  const { presignedUrl, jwtToken } = await initateUploadRes.json();

  // Upload to the presignedUrl
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "content-type": `image/${photoFormat}` },
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

  if (processRes.status === 429) {
    const { nextReset } = await processRes.json();
    Alert.alert(
      "Rate limit exceeded",
      `You've hit your daily limit. Try again after ${new Date(nextReset).toLocaleTimeString()}.`,
    );
    setLoading(false);
    return;
  }
  if (!processRes.ok) return;
  const eventData = await processRes.json();
  console.log("Event data:", eventData);
  setEventDrafts(eventData.eventDetails.events);
  setLoading(false);
}
