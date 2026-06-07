import { AppType } from "api";
import { hc } from "hono/client";
import { fetch, FetchRequestInit, FetchRequestLike } from "expo/fetch";
import Constants from "expo-constants";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@clerk/expo";

// https://docs.expo.dev/versions/latest/config/app/#extra
const backendUrls: string[] = Constants.expoConfig?.extra?.backendUrls ?? [
  "http://localhost:3000/",
];

async function pickUrl(urls: string[]): Promise<string> {
  for (const url of urls) {
    try {
      await pingUrl(url);
      return url; // first one that succeeds wins
    } catch {
      continue; // try next
    }
  }
  throw new Error("No backend reachable");
}

async function pingUrl(url: string): Promise<string> {
  // https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // cancel after 3s

  try {
    // Fetch will abort if controller.abort() is called
    await fetch(url, { signal: controller.signal });
    clearTimeout(timeout); // cancel the timeout if fetch succeeded
    return url;
  } catch {
    // fetch was aborted or failed
    throw new Error(`${url} unreachable`);
  }
}

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
// This allows us to use an authed client anywhere easily
export const ClientContext = createContext<ReturnType<
  typeof hc<AppType>
> | null>(null);

// We need the context provider to be able to run useContext(ClientContext) in other coponents
export function ClientProvider({ children }: { children: React.ReactNode }) {
  const url = useContext(UrlContext)!;
  const { getToken } = useAuth();

  const authFetch = async (
    input: string | URL | FetchRequestLike,
    init?: FetchRequestInit,
  ) => {
    const token = await getToken();
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, {
      ...init,
      headers,
    });
  };

  const client = hc<AppType>(url, { fetch: authFetch });

  return <ClientContext value={client}>{children}</ClientContext>;
}

const UrlContext = createContext<string | null>(null);
// Without this, every component would need to redo the async URL discovery itself
export function UrlProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  // The effect makes it so we can use async (https://react.dev/reference/react/useEffect#usage)
  // That's literally the only reason it's here: to serve as an escape hatch fro the synchronous component body
  useEffect(() => {
    // https://react.dev/reference/react/useState#storing-a-function-in-state: "If you pass a function as nextState, it will be treated as an updater function... To store a function in state, you must put it into a lambda before passing
    (async () => {
      const foundUrl = await pickUrl(backendUrls);
      setUrl(foundUrl);
    })();
  }, []);
  if (!url)
    return (
      <View className="centered-full">
        <ActivityIndicator />
      </View>
    ); // loading state
  return <UrlContext value={url}>{children}</UrlContext>;
}

// Not doing this to keep it simple. May start using later to lessen overall code.
// export function useClient() {
//   const client = useContext(ClientContext)
//   if (!client) throw new Error('useClient must be used inside ClientProvider')
//   return client
// }
