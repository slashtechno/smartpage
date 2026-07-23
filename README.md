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
