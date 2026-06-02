# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.

## Building production apps with EAS (monorepo notes)

This is part of the Unimatrix pnpm monorepo. **Never run `npx eas-cli` or `eas` directly from the monorepo root** (`Unimatrix/`). It will generate wrong `eas.json`/`app.json` at root and upload a massive incorrect archive.

**Correct ways (from monorepo root):**

```bash
pnpm mobile:eas:login
pnpm mobile:eas:init
pnpm mobile:build:all          # both platforms, production profile
pnpm mobile:build:ios
pnpm mobile:build:android
pnpm mobile:build:preview
```

These use `pnpm --filter mobile` which sets the working directory correctly to `apps/mobile`.

For custom flags:
```bash
pnpm --filter mobile exec npx eas-cli@latest build --platform all --profile production --non-interactive
```

Current production identifiers (after last interactive EAS run):
- iOS bundle: `com.tjpoisal.unimatrix`
- Android package: `com.tjpoisal.unimatrix`

`EXPO_PUBLIC_API_URL` is automatically set per profile in `eas.json` (points at the Fly web backend for preview/production).

For one-off with a token (the EXPO_TOKEN secret):

```bash
EXPO_TOKEN=your_token pnpm mobile:build:all
```

See also `../ACCOUNTS_AND_SECRETS.md` (the "REMAINING DELTA" Expo section) and `eas.json`.

The `.easignore` in this directory keeps the upload to EAS small.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
