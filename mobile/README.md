# VIC mobile

Expo (React Native) app for volunteers. Authentication is VIC's own: an emailed 6-digit code, Google
or Apple sign-in, with access and refresh tokens from the backend (`/mobile/auth/*`). No Cognito.

## Environment

The public settings are `EXPO_PUBLIC_*` variables (see `.env.example`):

| Variable | Use |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | backend URL |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google sign-in; the backend must list them in `GOOGLE_CLIENT_IDS` |
| `EXPO_PUBLIC_TERMS_AND_CONDITIONS_LINK`, `EXPO_PUBLIC_PRIVACY_POLICY_LINK` | accepted when the account is created |
| `EXPO_PUBLIC_INFORMATION_LINK`, `EXPO_PUBLIC_CONTACT_EMAIL` | Profil › Informații, contact |
| `EXPO_PUBLIC_APP_STORE_URL`, `EXPO_PUBLIC_PLAY_STORE_URL` | the "Update required" screen |

Store builds take them from the build profile in `eas.json` or from the EAS environment
(`eas env:list --environment production`). A production build stops if the Google client ids are
missing. `GOOGLE_SERVICES_JSON` (Firebase config for Android push) is a file secret in EAS.

## Development

1. Copy `.env.example` to `.env` and fill it in.
2. Build a development client: `eas build --profile development --platform <ios|android>` (or
   `npx expo prebuild` and `npx expo run:<platform>` for a local build).
3. `npm run start`.

Checks: `npx tsc --noEmit`, `npx eslint src`, `npx jest`.

## Builds

- `preview`: internal build against staging (`eas build --profile preview --platform all`).
- `production`: `eas build --profile production --platform all`, then `eas submit`.

Version numbers: `version` lives in `app.config.ts` (bump it for every native change: it is also the
over-the-air `runtimeVersion`). Build numbers are managed by EAS (`appVersionSource: remote`,
`autoIncrement` on production); check them with `eas build:version:get` and set a floor with
`eas build:version:set` if the stores are ahead.

## Useful docs

1. [Environment variables in EAS](https://docs.expo.dev/eas/environment-variables/)
2. [App version management](https://docs.expo.dev/build-reference/app-versions/)
3. [Local builds](https://docs.expo.dev/build-reference/local-builds/)
