# Update now: the last OTA for the 1.0.x store app (own-auth plan, issue 18)

This branch is `main` (ac237772, the same mobile code as the store builds: App Store 1.0.20 and
Google Play 1.0.19, both Expo SDK 51, runtime policy `sdkVersion` = `exposdk:51.0.0`) plus a banner
on every screen that sends people to the store. Nothing native changes, so one update on the
`production` channel reaches both platforms. It is never merged into `main` or `develop`.

## When
Only at the cutover, **after VIC 2.0 is live in both stores**. Published earlier, it would send
people to the store for a version that is not there yet.

## Environment (important)
`eas update` bundles the JavaScript with the variables available when it runs, not with the
`env` of the eas.json build profile. The old app needs all of these with the **production** values,
otherwise it gets a bundle without an API URL or Cognito settings:

EXPO_PUBLIC_API_URL, EXPO_PUBLIC_AWS_REGION, EXPO_PUBLIC_USER_POOL_ID, EXPO_PUBLIC_USER_POOL_CLIENT_ID,
EXPO_PUBLIC_AWS_DOMAIN, EXPO_PUBLIC_PRIVACY_POLICY_LINK, EXPO_PUBLIC_TERMS_AND_CONDITIONS_LINK,
EXPO_PUBLIC_INFORMATION_LINK, EXPO_PUBLIC_CONTACT_EMAIL

**Checked 2026-11-23:** all nine exist in the EAS `production` environment, but only
`EXPO_PUBLIC_API_URL` is readable outside EAS (visibility "sensitive"). The other eight
(`AWS_DOMAIN`, `AWS_REGION`, `USER_POOL_ID`, `USER_POOL_CLIENT_ID`, `CONTACT_EMAIL` and the three
links) have **secret** visibility: they exist only on EAS servers, so `eas update --environment
production` run from a laptop bundles them **empty**. A local `npx expo export` with the pulled
production env confirmed it: the API URL, the banner and the store link are in the bundle; the
Cognito pool, region, domain, contact email and links are not.

So before publishing, pick one:
1. Get the eight production values from whoever owns the Expo project / AWS (none of them is
   really secret: they ship inside every installed app) and put them in an untracked `.env.local`
   next to the pulled API URL; or
2. Change those variables' visibility to "sensitive" on expo.dev (then `--environment production`
   works); or
3. Publish from an EAS Workflow `update` job (runs on EAS servers, where secret variables exist).

Whichever: run `npx expo export --platform android --clear` first (without `--clear`, Metro can
reuse a cached bundle with the values of an earlier export) and check the bundle contains
`https://api-vic.ngohub.ro`, the Cognito domain (`amazoncognito.com`) and `eu-west-1_`, then publish.

## Staging check (before the cutover)
1. A phone with an old SDK 51 preview build (channel `staging`).
2. `eas update --channel staging --branch ota/update-now --message "Update now banner"` with the staging values.
3. Open the app twice (expo-updates applies on the next launch): the banner is on every screen,
   "Actualizează" opens the store. A VIC 2.0 preview build (other runtime) does not receive it.

**Done 2026-11-23 on Android:** EAS preview build from `main` (1.0.19 / 22, exposdk:51.0.0, channel
staging, build b8c2bd57) on the Pixel 8 emulator; `eas update --branch staging --clear-cache` with the
eas.json preview values (group 5cd1da23): no banner on the first launch, banner on the second, on
Landing and Login; "Actualizează" opens Google Play. The Note9 on the VIC 2.0 preview build (runtime
2.0.0, same channel) did not get it. Undone with
`eas update:roll-back-to-embedded --branch staging --runtime-version exposdk:51.0.0` (group a4a51bf2):
banner gone on the second launch. iOS not tested (same mechanism).

## Production (cutover runbook)
The `production` channel serves branch `production` (check with `eas channel:view production`).
With the nine values available (see Environment):
eas update --branch production --message "Update now banner" --clear-cache
Rollback on a no-go: eas update:roll-back-to-embedded --branch production --runtime-version exposdk:51.0.0
Then `eas update:list --branch ota/update-now` shows one group for android + ios, runtime exposdk:51.0.0.
