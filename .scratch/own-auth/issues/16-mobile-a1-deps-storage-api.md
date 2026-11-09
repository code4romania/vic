# A1 · Mobile: remove Amplify, runtimeVersion policy, secure token storage, API client, social SDKs

Status: done locally (2026-11-06), on Expo SDK 57
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

- 2026-11-06, done locally on feat/own-auth (on top of the merged chore/upgrade-expo-sdk, Expo 57):
  - Installed expo-secure-store ~57.0.4, expo-application ~57.0.3, expo-apple-authentication ~57.0.2, @react-native-google-signin/google-signin ^17, react-native-fbsdk-next ^13.4; removed aws-amplify, amazon-cognito-identity-js (and its override), netinfo, core-js.
  - app.config.ts: version 1.1.0, build 23, runtimeVersion appVersion; plugins secure-store and apple-authentication. The Google plugin (iosUrlScheme derived from EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) and the Facebook plugin (EXPO_PUBLIC_FACEBOOK_APP_ID + build-time FACEBOOK_CLIENT_TOKEN, auto-init and event logging off) are added only when their ids are set, because both refuse to run without them. The `vic://login?email=` navigation linking goes with A2.
  - eas.json: AWS keys dropped; the new keys added to every profile, empty until Infrastructure (I1) gives the values; Play Store URL filled.
  - token.storage.ts: the install flag lives in AsyncStorage (not the keychain), and the first run also clears tokens the iOS keychain kept from an earlier install.
  - api.ts: refresh ends the session (clearTokens + authEvents logout) only when the backend answers 401/403 to the refresh; offline or 5xx keeps the session. Any 503 sets maintenance (the ALB 503 has no code), a later success clears it; 426 sets updateRequired.
  - auth.events.ts, store/app (slice + useAppState), auth.api.ts, common/errors/entities/auth.errors.ts (enum only; texts in A2).
  - Until A2: tsc fails in AuthContext.ts, AuthContextProvider.tsx and CreateUser.tsx (they still import Amplify). The 4 errors the Expo branch already had remain.
  - A development build needs a new native build (`npx expo prebuild --clean` or EAS): five new native modules.
