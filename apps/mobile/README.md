# PowerWatch mobile

The PowerWatch app for Android and iPhone, built with Expo and React Native.
Every screen follows the PowerWatch Figma file (HI-FI section).

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator.

## Configure

Copy `.env.example` to `.env`:

| Variable                            | Purpose                                                          |
| ------------------------------------ | ----------------------------------------------------------------- |
| `EXPO_PUBLIC_MIXPANEL_TOKEN`         | Mixpanel project token. Empty disables analytics.                  |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`   | Google Sign-In web client ID (the API's token audience).           |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`   | Google Sign-In iOS client ID.                                      |
| `EXPO_PUBLIC_APPLE_SIGN_IN_ENABLED`  | Set to `1` once Sign in with Apple is wired up (see `src/config/features.ts`). Unset/empty keeps the button as "coming soon". |

Google Sign-In needs a development build, not Expo Go — see "Testing Google Sign-In" below.

## Check

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## Testing Google Sign-In

`@react-native-google-signin/google-signin` has native code and isn't included in Expo
Go, so "Continue with Google" shows "Google sign-in needs the installed app" there. Build
a development build instead:

```bash
npx expo run:android    # or: npx expo run:ios
# or, without a local Android/iOS toolchain:
npx eas-cli@latest build --profile development --platform android
```

## Local dev against a LAN API over HTTP

Release and preview builds never allow cleartext (plain `http://`) traffic — Android 9+
already blocks it by default, and the app's config intentionally does not re-enable it
(see `app.json`, no `expo-build-properties`/`usesCleartextTraffic` override).

- **Expo Go**: works out of the box. Expo Go is a separate host app with its own
  permissive network config, so `http://<your-machine-ip>:3000` (what
  `src/services/api/config.ts` derives automatically in `__DEV__`) just works — no
  changes needed.
- **A custom development build** (`npx expo run:android`, or
  `eas build --profile development`) uses the app's *own* manifest, so on Android 9+ it
  blocks cleartext the same as a release build unless you opt in for that build only:
  1. `npx expo install expo-build-properties`
  2. Temporarily add to `app.json` under `expo.plugins`:
     ```json
     ["expo-build-properties", { "android": { "usesCleartextTraffic": true } }]
     ```
  3. Rebuild the dev client (`npx expo run:android`).
  4. **Revert step 2 before building anything with the `preview` or `production` EAS
     profile** (and before committing, unless you're only working locally) — those
     builds must never ship with cleartext enabled.
- Prefer not to touch `app.json` at all? Point `EXPO_PUBLIC_API_URL` at an HTTPS tunnel
  to your local API instead (e.g. `ngrok http 3000` or `cloudflared tunnel --url
  http://localhost:3000`) and skip the cleartext toggle entirely.

## Build for the stores

```bash
npx eas-cli@latest build --platform android
npx eas-cli@latest build --platform ios
```

## Releasing a new Android version

The landing page's download button and the in-app update prompt (`src/services/appUpdate.ts`)
both read the latest release from `GET /api/v1/app/latest`, which the API builds from
GitHub Releases on `oyinlola-tech/PowerWatch`, and releases happen by themselves: every push
to `main` that changes this app runs the **Android release** workflow
(`.github/workflows/android-release.yml`). It picks the version (latest release plus one patch,
or `version` in `app.json` if higher), builds the APK on EAS with the `preview` profile, and
publishes the GitHub Release with the APK attached. `versionCode` goes up automatically
(`autoIncrement`), so each APK installs over the last one.

- Bigger version jump: raise `version` in `app.json` (e.g. `1.1.0`) before pushing.
- Push without releasing: put `[skip release]` in the commit message.
- Release a specific version by hand: `git tag -a v1.0.2 -m "What changed, for users" && git push origin v1.0.2`,
  or run the workflow from the Actions tab.
- The workflow needs the repository secret `EXPO_TOKEN`.

The landing page and the in-app update prompt pick up the new release within about 5
minutes (the API caches GitHub's response for 5 minutes). The release notes in the
GitHub Release body are shown in the app's update prompt, so keep them short and
user-facing.

## Design reference

- `docs/figma-spec.md`: values read from Figma for each screen.
- `docs/figma-export/`: the screens, images and icons exported from Figma.
  `geometry/` lists the exact position and size of every layer.
- `src/components/icons/glyphs.ts`: the icon vectors, generated from the export.
- `assets/fonts/README.md`: why Selawik stands in for Segoe UI.

## Light and dark mode

Figma only has light designs. `src/theme/index.ts` holds `lightColors` (from Figma) and
`darkColors` (derived, same values as the landing page). The app follows the phone's
setting until the user flips Profile → Dark Mode, which is saved on the device.

- Style a component with `makeStyles((c) => ({ ... }))` and `const styles = useStyles()`,
  or read `useTheme().colors` for inline colours (`src/theme/ThemeContext.tsx`).
- Use `card` for white surfaces and `white` only for text and icons on coloured fills.
  Use `accent` for blue text and icons, and `primary` for blue fills.
- Icons drawn in their Figma colour are remapped to the matching token automatically.
- The splash screen stays brand blue in both themes. The map switches to OpenFreeMap's dark style.

## Screens

| Route                        | Figma frame                  |
| ---------------------------- | ---------------------------- |
| `/`                          | Splash Screen                |
| `/onboarding`                | Onboarding - Welcome         |
| `/login`                     | Login Screen Wireframe       |
| `/register`                  | Signup Screen Wireframe      |
| `/verify`                    | Email Confirmation Wireframe |
| `/how-it-works`              | How it works                 |
| `/location`                  | select location              |
| `/notifications`             | Onboarding - Notifications   |
| `/dashboard`                 | Home Screen (Status Hub)     |
| `/confirm/[status]`          | Reporting power on / off     |
| `/report-submitted/[status]` | Report submitted on / off    |
| `/history`                   | History                      |
| `/settings`                  | Profile                      |
