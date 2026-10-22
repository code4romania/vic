# A3 · Mobile: unit tests, preview and production builds, OTA isolation check

Status: needs-info
Type: test
Blocked by: 17, 18
Tracker card: A3

- `jest-expo`, `@testing-library/react-native`; `src/test/setup.ts` mocks expo-secure-store, AsyncStorage and the three social SDKs. Specs: `token.storage.test.ts`, `api.test.ts` (one shared refresh, 426 → `updateRequired`, 503 → `maintenance`), `AuthContextProvider.test.tsx` (error mapping, `loginWithSocial` per provider with the local union, no `confirmSignUp`, R30), deep link (`vic://login?email=` fills the email that the web page got from `{ realm: 'mobile', email }`, R17).
- `eas build --profile preview --platform all` against staging; `eas build --profile production --platform all` submitted a week before the cutover and held (manual release / managed publishing). Confirm runtimeVersion 1.1.0 and the Apple team from issue 00.
- Device checklist (Guide, Mobile section) per platform, including a migrated volunteer who signs in with Google or Apple and lands on the old profile (R4), and the transition link → set password in the phone browser → Open the app with the email filled (R17).
- OTA isolation in both directions recorded (cutover exit criterion with issue 18).

## Comments
