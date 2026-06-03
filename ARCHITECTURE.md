# FutoNav — Architecture

## System architecture

```
Mobile App (Expo)
  ├── Expo Router (file-based routing)
  ├── react-native-maps (MapView, Marker, Polyline)
  ├── expo-location (GPS)
  ├── Zustand stores (location, nav, settings)
  ├── expo-sqlite (offline POI cache)
  ├── Fuse.js (fuzzy search)
  └── packages/api-client (Supabase data access)
         │
         ▼
  Supabase (cloud)
  ├── PostgreSQL (pois table)
  ├── Row Level Security
  ├── Auth (admin only)
  └── Edge Functions
         │
         ▼
  Admin Panel (Next.js)
  └── POI CRUD (reuses shared schemas)
```

## Four-layer model

| Layer | Location | Responsibility |
|---|---|---|
| Presentation | `apps/mobile/app/` + `src/components/` | Screens, UI components, navigation |
| Business logic | `packages/core/src/` | Haversine, ETA, fuzzy search, sync algorithm |
| Data | `packages/api-client/` + `supabase/` | DB access, migrations, RLS, offline cache |
| External services | Google Maps Platform, device GPS | Map tiles, directions, location |

## Dependency direction

```
apps/* → packages/{shared, core, api-client}
packages/{core, api-client} → packages/shared
```

- Nothing in `packages/*` imports from `apps/*`
- `packages/core` is React-free (pure TS, Node-testable)

## Offline-first sync

1. **Bundled snapshot** — All POI data ships with the app binary for zero-connectivity first launch
2. **Delta sync** — On launch, requests only POIs updated since `last_sync_at`
3. **SQLite cache** — Search reads exclusively from local DB, never the network
4. **Tile caching** — Pre-warm FUTO bounding region on first online launch

## Security

- No PII collected or stored
- Google Maps key injected at build time via EAS secrets
- RLS: anon key is read-only; admin role gates all writes
- All traffic over HTTPS/TLS
