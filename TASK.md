# FutoNav — Task List

## Phase A — Monorepo root (done)
- [x] pnpm-workspace.yaml
- [x] turbo.json
- [x] tsconfig.base.json
- [x] Root package.json
- [x] .gitignore, .env.example, .prettierrc

## Phase B — Packages
- [ ] packages/config — shared ESLint, tsconfig, jest presets
- [ ] packages/shared — Zod schemas, types, constants
- [ ] packages/core — Haversine, ETA, search, sync (pure TS + tests)
- [ ] packages/api-client — typed Supabase data access

## Phase C — Mobile app
- [ ] Expo SDK 56 scaffold
- [ ] Monorepo-aware Metro config
- [ ] app.config.ts (env injection)
- [ ] Dependencies installed
- [ ] Route stubs (Expo Router)
- [ ] Folder structure (components, stores, services, theme)

## Phase D — Supabase
- [ ] Local stack (supabase init + start)
- [ ] Migration 0001: pois table, enum, indexes
- [ ] Migration 0002: RLS policies
- [ ] Seed data (placeholder POIs)

## Phase E — Zustand stores + services
- [ ] useLocationStore
- [ ] useNavStore
- [ ] useSettingsStore
- [ ] locationService
- [ ] syncService
- [ ] mapKeyProvider

## Phase F — Core screens
- [ ] MapCanvas (full-screen map, markers, blue dot)
- [ ] SearchBar + ResultsSheet
- [ ] PoiDetailScreen
- [ ] EtaBar + Navigation overlay

## Phase G — Offline support
- [ ] SQLite cache layer
- [ ] Baseline bundled snapshot
- [ ] Tile caching

## Phase H — CI/CD
- [ ] GitHub Actions CI
- [ ] EAS build profiles
