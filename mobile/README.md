# Publish new versions

## 1. New development build

1. Create a new file at the root of the project called `.env.development`;
2. Check if the `google-services.json` is present in the secrets (`eas secret:list`), otherwise go to your firebase console for your app and download the `google-services.json` and copy it in the root of your project
3. Add the following lines with values from your cognito app client for your development environment:

> EXPO_PUBLIC_AWS_REGION={{value}}
> EXPO_PUBLIC_USER_POOL_ID={{value}}
> EXPO_PUBLIC_USER_POOL_CLIENT_ID={{value}}
> EXPO_PUBLIC_AWS_DOMAIN={{value}}

4. Create a new build either a [local build](https://docs.expo.dev/workflow/prebuild/) with `npx expo prebuild --platform <platform>` or a new eas build to be downloaded: `eas build --platform android --profile development`. Using the prebuild value since it's not an eas build it will require us to have also the environment variables from the `eas.json` in the `.env.development` created at point 1.
5. Run the the app in development mode: `npm run start`

## 2. New staging build

## 3. New production build

## Useful docs

1. [Environment variables values precedence](https://docs.expo.dev/build-reference/variables/#how-are-naming-collisions-between-secrets-the-env--field-in-easjson-and-env-files-handled)
2. [Local build](https://docs.expo.dev/build-reference/local-builds/)
3. [Prebuild](https://docs.expo.dev/workflow/prebuild/)
