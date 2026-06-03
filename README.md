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

```bash
pnpm install
cd apps/mobile && npx expo start
```

## Tech stack

- **App:** Expo SDK 56 / React Native 0.85 (New Architecture + Hermes)
- **Map:** react-native-maps (Google provider, dev via Expo Go)
- **Backend:** Supabase (PostgreSQL, PostgREST, RLS)
- **State:** Zustand
- **Search:** Fuse.js (offline, fuzzy)
- **Local DB:** expo-sqlite
- **Monorepo:** pnpm workspaces + Turborepo
