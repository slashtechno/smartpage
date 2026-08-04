# smartpage
See it. Snap it. Scheduled.

NOTE: this app works, but was primarily a way for me to learn how to build mobile apps with Expo. You may encounter bugs, but issues + PRs are welcome.


Take a photo of an event flyer and have it automatically added to your calendar. 

Other features:
* Share images to analyze from other apps (including from Screenshot Markup)
* Repeating events
* Ability to select which calendar to add events to

Stack:
* Expo (TypeScript, Expo Router)  
* Hono (integrated with Hono RPC)  
* Postgres  
* Vercel Blob  
    - Images are stored in Vercel Blob so images can get from the app to the server without sending potentially large images to a serverless function  
* Vercel AI Gateway  
    - AI Gateway provides $5/mo of free AI inference if you haven't yet added credit  
* Clerk for auth

This app isn't on the App Store yet. Click below to add it to an alternative iOS App Store to install it. If you don't yet have one, check out SideStore.
<!--Alternatively, download the .ipa from the [rolling release](https://github.com/slashtechno/smartpage/releases/rolling) and sideload it using a Mac.-->

<h1 align="left">
<a href="https://stikstore.app/altdirect/?url=https://github.com/slashtechno/smartpage/releases/download/rolling/altstore-source.json"><img src="https://github.com/StikStore/altdirect/blob/main/assets/png/AltSource_Blue.png?raw=true" width="200"></a>
<a href="https://github.com/slashtechno/smartpage/releases/download/rolling/smartpage.ipa"><img src="https://github.com/StikStore/altdirect/blob/main/assets/png/Download_Blue.png?raw=true" width="200"></a>
</h1>


## Running locally
1. Clone the repo, `cd` into it
2. `bun install` to install dependencies
3. Copy `.env.example` to `.env` and fill in the values, same with `packages/app/.env.example` to `packages/app/.env`
4. `bun run dev:api` in the root of the repo to start the backend
5. In another terminal, `cd packages/app` and run `bunx expo run:ios --device --configuration Debug`
    a. You might need to open the project in Xcode, go to the Signing & Capabilities tab, and enable signing
6. Open the app on your iOS device
    a. If you get a "Untrusted Developer" error, go to Settings > General > VPN & Device Management and trust the developer certificate 