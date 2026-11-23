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

Use `--environment production` if they are set as EAS environment variables (check with
`eas env:list --environment production`), or export them in the shell before publishing.

## Staging check (before the cutover)
1. A phone with an old SDK 51 preview build (channel `staging`).
2. `eas update --channel staging --branch ota/update-now --message "Update now banner"` with the staging values.
3. Open the app twice (expo-updates applies on the next launch): the banner is on every screen,
   "Actualizează" opens the store. A VIC 2.0 preview build (other runtime) does not receive it.

## Production (cutover runbook)
eas update --channel production --branch ota/update-now --message "Update now banner" --environment production
Then `eas update:list --branch ota/update-now` shows one group for android + ios, runtime exposdk:51.0.0.
