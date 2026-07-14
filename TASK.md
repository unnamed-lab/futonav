# FutoNav — Task List

## Phase A — Monorepo root (done)
- [x] pnpm-workspace.yaml
- [x] turbo.json
- [x] tsconfig.base.json
- [x] Root package.json
- [x] .gitignore, .env.example, .prettierrc

## Phase B — Packages
- [x] packages/config — shared ESLint, tsconfig, jest presets
- [x] packages/shared — Zod schemas, types, constants
- [x] packages/core — Haversine, ETA, search, sync (pure TS + tests)
- [x] packages/api-client — typed Supabase data access

## Phase C — Mobile app
- [x] Expo SDK 56 scaffold
- [x] Monorepo-aware Metro config
- [x] app.config.ts (env injection)
- [x] Dependencies installed
- [x] Route stubs (Expo Router)
- [x] Folder structure (components, stores, services, theme)

## Phase D — Supabase
- [x] Local stack (docker-compose.yml → PostgreSQL + PostgREST)
- [x] Migration 0001: pois table, enum, indexes
- [x] Migration 0002: RLS policies
- [x] Seed data (10 placeholder POIs)

## Phase E — Zustand stores + services
- [x] useLocationStore
- [x] useNavStore
- [x] useSettingsStore
- [x] locationService
- [x] syncService
- [x] mapKeyProvider

## Phase F — Core screens
- [x] MapCanvas (full-screen map, markers, blue dot)
- [x] SearchBar + ResultsSheet
- [x] PoiDetailScreen
- [x] EtaBar + Navigation overlay

## Phase G — Offline support
- [x] SQLite cache layer
- [x] Baseline bundled snapshot
- [x] Tile caching

## Phase H — CI/CD
- [x] GitHub Actions CI
- [x] EAS build profiles

## Phase I — Local backend
- [x] docker-compose.yml with PostgreSQL + PostgREST
- [x] Init SQL combining roles, schema, and seed data
- [x] Generated anon JWT key
- [x] .env configured for local stack
- [x] Connect sqliteCache to MapScreen (replace PLACEHOLDER_POIS)
- [ ] Verify mobile app launches with backend

## Phase J — Admin panel (Next.js)
- [ ] Scaffold Next.js app in apps/admin
- [ ] Add admin turbo.json task
- [ ] POI CRUD pages (list, create, edit, delete)
- [ ] CSV bulk import page
- [ ] Connect to local Supabase backend
- [ ] Basic auth (optional)

## Phase K — Real campus POI survey
- [x] Corrected FUTO_CENTROID: the original (5.3927, 7.0009) had no real buildings
      within ~1km of it -- it was a fabricated grid center, not surveyed data.
- [x] Added 18 OpenStreetMap-verified buildings (Overpass API, 2026-07-14) --
      Admin Building, Architecture studios/department, Biochemistry, Entrepreneurial
      Studies, GST (2 blocks), SAAT (2 buildings), SOES (6 buildings), SOSC Extension.
- [ ] The original 10 Phase D placeholder POIs (Library, Senate, SEET, SMAT, SHT, SAAT,
      SPGS, Student Affairs, Medical Centre) are still on the fabricated grid -- no OSM
      or Places API data exists for them. Google Places API is blocked on the project's
      current Maps key (legacy Places API not enabled; Places API (New) returns
      API_KEY_SERVICE_BLOCKED) -- enable it in Google Cloud Console to unblock a lookup,
      or get coordinates by dropping pins in Google Maps on-site.
- [ ] Hostels, campus gates, and sports facilities have no POI entries at all yet.
