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

| Variable                     | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `EXPO_PUBLIC_MIXPANEL_TOKEN` | Mixpanel project token. Empty disables analytics.  |

## Check

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## Build for the stores

```bash
npx eas-cli@latest build --platform android
npx eas-cli@latest build --platform ios
```

## Design reference

- `docs/figma-spec.md`: values read from Figma for each screen.
- `docs/figma-export/`: the screens, images and icons exported from Figma.
  `geometry/` lists the exact position and size of every layer.
- `src/components/icons/glyphs.ts`: the icon vectors, generated from the export.
- `assets/fonts/README.md`: why Selawik stands in for Segoe UI.

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
