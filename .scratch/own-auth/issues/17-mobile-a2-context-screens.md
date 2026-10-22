# A2 · Mobile: AuthContext over the backend, social buttons back, code screen for Forgot password, deep link, Maintenance and Update required

Status: needs-info
Type: task
Blocked by: 16
Tracker card: A2

Outline until Layer 7. `../decisions.md` wins over this text and over the Guide. Keep the `AuthContext.ts` signatures (except R30 below) so the screens stay as they are. Screen names in this app: Register = `CreateAccount.tsx`, code screen = `ValidateAccount.tsx`, reset = `ConfirmPassword.tsx`.

- `AuthContextProvider`: fix `getProfile` so every error path settles (today a non-404 error hangs login); "no profile" = 404 or `USER_001`; `login` maps AUTH_001 (+ migration hint while the date is in the future), 002, 003 → `{ confirmAccount: true }`, 004; `signUp` (009 → username_exists, then "check your email"); `resendConfirmationCode`; `forgotPassword` → code; `forgotPasswordSubmit` → reset with code → tokens → profile; `changePassword`; `loginWithSocial(provider)`; `logout` (unregister push token, `POST /mobile/auth/logout`, clear). `COGNITO_ERRORS` → `AUTH_ERRORS` from `code_error`. In `AuthContext.ts`, replace `CognitoHostedUIIdentityProvider` with a local `'google' | 'facebook' | 'apple'` union and remove `confirmSignUp` (R30); every other signature stays.
- Social: restore the three buttons on `Landing.tsx` (Apple always on iOS); fix the swapped Google / Facebook colours and the hardcoded labels in `GoogleButton.tsx`, `FacebookButton.tsx`, `AppleButton.tsx`; Google `idToken`, Apple `identityToken`, Facebook `AccessToken` → `POST /mobile/auth/social`.
- Screens: `ValidateAccount.tsx` → "check your email, then open the link" with resend (code input goes); `ConfirmPassword.tsx` keeps the 6-digit code + new password; `CreateUser.tsx` drops `Auth.currentAuthenticatedUser` and `cognitoId`; `DeleteAccount.tsx` already calls `logout()`. New `Maintenance.tsx`, `UpdateRequired.tsx`, rendered from the app slice in `Router.tsx`.
- Deep link `vic://login?email=` opens Login with the email filled. The email comes from the web page: mobile-realm `POST /auth/set-password` and `POST /auth/confirm-email` answer `{ realm: 'mobile', email }` and create no session, so the volunteer always logs in in the app (R17).
- A migrated volunteer (`pending_password`) who signs in with Google, Facebook or Apple gets in and is set active by the backend (R4); nothing extra in the app.
- Translations ro / en; policy and terms links no longer at ngohub.ro (with issue 21).

## Comments
