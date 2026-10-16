# A4 · Mobile: the Update now OTA for the old app

Status: ready-for-human
Type: task
Blocked by: —
Tracker card: A4

Independent of the backend. One last over-the-air update for the installed 1.0.x app, built from the current code on the current runtime (Expo SDK 51, `sdkVersion` policy, `production` channel): an "Update now" banner with the store links on every screen. No version check, no backend call, no new native module.

- [ ] Branch `ota/update-now` off the commit store 1.0.19 was built from. `UpdateNowBanner.tsx` at the top of the root navigator, always visible, two store links hard-coded, text ro + en. `npx expo-doctor` passes; `package.json` diff adds nothing native.
- [ ] Staging check: `eas update --channel staging --branch ota/update-now` reaches a device on the old preview build on the second launch; a device on the new 1.1.0 preview build (runtime 1.1.0) does not receive it. Record both.
- [ ] Production command for the cutover runbook: `eas update --channel production --branch ota/update-now --message "Update now banner"`, with the expected `eas update:list` output. Note the known limit: expo-updates applies on the next launch.

## Comments
