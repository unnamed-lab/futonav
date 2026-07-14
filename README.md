# FutoNav — FUTO Smart Navigation System

An offline-first campus navigation app for the Federal University of Technology, Owerri. Built as an Expo mobile app with a Supabase backend and optional admin web panel.

## Monorepo structure

```
futonav/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── admin/           # Next.js admin panel
├── packages/
│   ├── config/          # Shared ESLint, tsconfig, jest presets
│   ├── shared/          # Zod schemas, TS types, constants
│   ├── core/            # Pure business logic (Haversine, ETA, search, sync)
│   └── api-client/      # Typed Supabase data-access layer
├── supabase/            # Schema migrations, Edge Functions, seed data
└── scripts/             # Data validation & seed tooling
```

## Getting started

Google Maps (`PROVIDER_GOOGLE`) requires the API key to be linked into the native binary, which **Expo Go cannot do** — it's a generic prebuilt client with no way to embed your project's key. Use a dev client instead:

```bash
pnpm install

# one-time: build a dev client with the Maps key baked in
cd apps/mobile
eas build --profile development --platform android   # cloud build, no local Android SDK needed
# or, with Android Studio installed locally:
npx expo run:android

# day-to-day: start the JS bundler and open it in the dev client you built above
npx expo start --dev-client
```

## Tech stack

- **App:** Expo SDK 56 / React Native 0.85 (New Architecture + Hermes)
- **Map:** react-native-maps (Google provider, requires a custom dev client — see Getting started)
- **Backend:** Supabase (PostgreSQL, PostgREST, RLS)
- **State:** Zustand
- **Search:** Fuse.js (offline, fuzzy)
- **Local DB:** expo-sqlite
- **Monorepo:** pnpm workspaces + Turborepo
