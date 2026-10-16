# A1 · Mobile: remove Amplify, runtimeVersion policy, secure token storage, API client, social SDKs

Status: needs-info
Type: task
Blocked by: 08
Tracker card: A1

Outline until Layer 7. The runtime-version change must ship in this build (design doc, "Two traps").

- `npx expo install expo-secure-store expo-application expo-apple-authentication @react-native-google-signin/google-signin react-native-fbsdk-next`; `npm uninstall aws-amplify amazon-cognito-identity-js @react-native-community/netinfo core-js` (AsyncStorage stays for the legacy cleanup).
- `app.config.ts`: `runtimeVersion: { policy: 'appVersion' }`, `version: '1.1.0'`, iOS `buildNumber: '23'`, Android `versionCode: 23`; plugins for secure-store, Apple authentication, Google sign-in (iOS URL scheme), Facebook (app id, client token, display name); keep `com.apple.developer.applesignin`; `linking` config for `vic://login?email=`. `eas.json` / `.env.example`: drop `EXPO_PUBLIC_AWS_*`; add Google / Facebook ids, store URLs, `EXPO_PUBLIC_MIGRATION_NOTICE_UNTIL`.
- `src/services/auth/token.storage.ts` (SecureStore `vic.accessToken` / `vic.refreshToken`, in-memory cache, `clearLegacyStorage()` once removing `CognitoIdentityServiceProvider.*` and `amplify-*` keys).
- `src/services/api.ts`: bearer from storage, `x-app-version`, one shared refresh (`POST /mobile/auth/refresh`), 426 → `updateRequired`, 503 → `maintenance` (zustand `src/store/app/app.slice.ts`), `authEvents` logout. `src/services/auth/auth.api.ts`.
- Delete `src/common/config/amplify.ts` and `Amplify.configure` in `App.tsx`.

## Comments
