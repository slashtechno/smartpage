// https://docs.expo.dev/versions/latest/sdk/sharing/

export async function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    // Check if the URL is from the share extension/intent
    if (new URL(path).hostname === 'expo-sharing') {
      return '/handle-share';
    }
    return path;
  } catch (e) {
    // Fallback to the root path on error
    console.error('Error parsing path:', e);
    return '/';
  }
}
