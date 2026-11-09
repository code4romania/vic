# A4 · Mobile: the Update now OTA for the old app

Status: banner built and checked locally (2026-11-06); staging check and publish still ready-for-human
Type: task
Blocked by: —
Tracker card: A4

Independent of the backend. One last over-the-air update for the installed 1.0.x app, built from the current code on the current runtime (Expo SDK 51, `sdkVersion` policy, `production` channel): an "Update now" banner with the store links on every screen. No version check, no backend call, no new native module.

- [ ] Branch `ota/update-now` off the commit store 1.0.19 was built from. `UpdateNowBanner.tsx` at the top of the root navigator, always visible, two store links hard-coded, text ro + en. `npx expo-doctor` passes; `package.json` diff adds nothing native.
- [ ] Staging check: `eas update --channel staging --branch ota/update-now` reaches a device on the old preview build on the second launch; a device on the new 1.1.0 preview build (runtime 1.1.0) does not receive it. Record both.
- [ ] Production command for the cutover runbook: `eas update --channel production --branch ota/update-now --message "Update now banner"`, with the expected `eas update:list` output. Note the known limit: expo-updates applies on the next launch.

## Comments

- 2026-11-06, local (nothing published):
  - Branch `ota/update-now` in its own worktree `~/Documents/vic-ota-update-now`, from `main` (`ac237772`) rather than the 1.0.19 commit `2e2ef545`: between them only `mobile/src/assets/locales/ro/translation.json` changed (no native, dependency or config change), so main runs on the same runtime and keeps translation fixes that may already have reached phones. `main` itself is unchanged; the work is uncommitted in that worktree.
  - `src/components/UpdateNowBanner.tsx`: dark purple, "Actualizează aplicația VIC" + one line, an "Actualizează" button opening the store for the platform; not dismissible; hard-coded links: Play `https://play.google.com/store/apps/details?id=org.commitglobal.vic`, App Store `https://apps.apple.com/ro/app/vic/id6474194051` (the "VIC" listing by Code for Romania found by web search: confirm before publishing). Translations ro + en (`update_now`).
  - `App.tsx`: `SafeAreaProvider` (the banner sits outside the navigators), banner at the top, the screens below get a top inset of 0 (`SafeAreaInsetsContext`) so the notch is not added twice; status bar icons light (they were dark on the purple banner).
  - Checks: no change to package.json / package-lock.json (nothing native); tsc shows only main's 4 existing errors; eslint clean. `expo-doctor` fails 3 checks on main already (SDK 51 package versions, native tooling); they cannot be fixed in an OTA, which must match the native 1.0.19 build exactly, so "expo-doctor passes" does not hold for this branch.
  - Android emulator, dev build from the branch (versionName 1.0.19 / 22, runtime `exposdk:51.0.0`, API pointed at localhost, no Cognito settings): banner on Landing and Login, layout right, "Actualizează" opens the Play Store.
  - Upgrade path (device checklist): with Cognito / Amplify keys planted in the 1.0.19 app's AsyncStorage plus an unrelated key, the 1.1.0 build installed over it (runtime 1.1.0) opens on Landing; the Cognito / Amplify keys are gone, the unrelated key stays, `vic.legacyCleared` is set.
  - Still open: `eas update --channel staging --branch ota/update-now` on real builds (both directions) and the production command (need the Expo account).
- 2026-11-09, the Expo 57 release (chore/upgrade-expo-sdk, still Cognito) gets the update prompt built in, so it needs no second OTA at the cutover. Uncommitted in `~/Documents/vic` (the user asked for it on that branch): `api.ts` sends `x-app-version` (from `expo-constants`, no new native module) and sets `updateRequired` on 426; `store/app` slice + selector; `Router` shows `screens/UpdateRequired.tsx` (MissingEntity, store links from `EXPO_PUBLIC_APP_STORE_URL` / `EXPO_PUBLIC_PLAY_STORE_URL` or hard-coded fallbacks, App Store link still to confirm); `SafeAreaProvider` in App; `getProfile` resolves on 426 (no toast, login does not hang); ro + en `update_required`. tsc: only the branch's 4 existing errors; eslint clean.
  - Checked on the Android emulator (Expo branch dev build 1.0.19, logged out, a temporary startup call to `/mobile/user/profile`, removed after): own-auth backend with `MOBILE_MIN_VERSION=1.1.0` → 426 AUTH_011 → Update screen, the button opens the Play Store; with `MOBILE_MIN_VERSION=1.0.19` → 401, Landing as usual. Today's production backend ignores the header.
  - At the cutover: only the 1.0.19 store build (SDK 51) still needs the `ota/update-now` banner. Expo release users see the screen on the first backend call (at launch if logged in, right after the Cognito login otherwise). The Expo release's version must stay below MOBILE_MIN_VERSION (1.1.0).
  - When the Expo branch is merged into feat/own-auth again, `api.ts`, `Router.tsx`, `store.ts`, `App.tsx`, the app slice and `UpdateRequired.tsx` will conflict with own-auth's versions: keep own-auth's.
