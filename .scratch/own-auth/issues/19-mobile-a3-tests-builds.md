# A3 · Mobile: unit tests, preview and production builds, OTA isolation check

Status: needs-info
Type: test
Blocked by: 17, 18
Tracker card: A3

- `jest-expo`, `@testing-library/react-native`; `src/test/setup.ts` mocks expo-secure-store, AsyncStorage and the three social SDKs. Specs: `token.storage.test.ts`, `api.test.ts`, `AuthContextProvider.test.tsx`, deep link.
- `eas build --profile preview --platform all` against staging; `eas build --profile production --platform all` submitted a week before the cutover and held (manual release / managed publishing). Confirm runtimeVersion 1.1.0 and the Apple team from issue 00.
- OTA isolation in both directions recorded (cutover exit criterion with issue 18).

## Comments
