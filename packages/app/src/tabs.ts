import { Href } from 'expo-router';
import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
export type Tab = {
  // `index` for index.tsx, for example
  name: string,
  label: string
  href: Href
  // Apple SF symbol (https://github.com/andrewtavis/sf-symbols-online)
  sf: SFSymbol,
  // Google Material symbol (https://fonts.google.com/icons)
  md: AndroidSymbol
}


export const homeTabs: Tab[] = [
  {
    name: "index",
    label: "Home",
    href: "/",
    sf: "house",
    md: "house",
  },
  {
    name: "profile",
    href: "/profile",
    label: "Profile",
    sf: "person.circle",
    md: "account_box",
  },
];
