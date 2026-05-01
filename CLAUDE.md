# kyoos — User mobile app

Expo SDK 55 / React Native 0.83. Part of the [kyoos monorepo](../CLAUDE.md). Backend at [../server/](../server/).

## Stack

- Expo SDK 55, RN 0.83
- Navigation: Expo Router (file-based) + React Navigation bottom tabs
- State: Redux Toolkit + Redux Saga, Redux Persist
- HTTP: Axios · Realtime: socket.io-client
- Native: react-native-maps, Vision Camera, PDF viewer, Calendars, Expo Image / Image Picker / Image Manipulator

## Layout

- [app/](app/) — Expo Router routes
- [components/](components/) — shared UI
- [constants/](constants/) — config + API base URL
- Redux store, slices, and sagas live alongside the above

## Workflows

- Start: `npm run start` / `expo start`
- iOS: `npm run ios` · Android: `npm run android`
- Local prod EAS builds: `npm run build:ios:prod:local`, `npm run build:android:prod:local`

## Server-change checklist

When [../server/](../server/) changes, verify in this app:

1. REST shapes consumed by sagas (Axios responses)
2. **Socket.io event names** — users receive booking status / messaging events
3. Local TS types in slices/sagas — these are hand-maintained mirrors

## Skills

- `upgrading-expo` — for SDK bumps
- `building-native-ui`
- `native-data-fetching`
- `expo-tailwind-setup`
- `expo-dev-client`
- `expo-deployment`
- `expo-cicd-workflows`
- `expo-api-routes`
- `expo-module`
- `use-dom`

Versions pinned in [../skills-lock.json](../skills-lock.json).
