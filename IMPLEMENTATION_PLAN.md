# FutoNav — Implementation Plan

## Agile cycles (12 weeks, 4 cycles)

### Cycle 0 / Milestone 1 — Foundations (Weeks 1–2)
- [x] Monorepo scaffold (pnpm, turbo, tsconfig)
- [ ] Packages: shared (Zod schemas), core (Haversine, ETA, search)
- [ ] Supabase project + migrations
- [x] 54 POI survey → seed.csv
- **Exit:** `pnpm dev:mobile` runs; DB seeded; core tests green

### Cycle 1 / Milestone 2 — Map & location (Weeks 3–4)
- [ ] MapCanvas with react-native-maps
- [ ] Location service + permission flow + blue dot
- [ ] POI markers from cache
- [ ] SQLite cache + baseline snapshot + sync service
- **Exit:** Map shows live position + all POI markers, online and offline

### Cycle 2 / Milestone 3 — Search, detail, distance/ETA (Weeks 5–6)
- [ ] SearchBar + ResultsSheet (debounced, Fuse.js)
- [ ] Category filter chips
- [ ] POI detail sheet with distance + ETA (live recompute)
- **Exit:** UC-01 and UC-03 complete

### Cycle 3 / Milestone 4 — Routing, nav view, offline hardening (Weeks 7–8)
- [ ] Route polyline + auto-fit markers
- [ ] Navigation Active View with ETA bar
- [ ] Tile pre-warm + full offline hardening
- [ ] Settings screen
- **Exit:** Full navigation works in airplane mode

### Milestone 5 — QA, beta, optimization (Weeks 9–10)
- [ ] Functional matrix testing (all FRs)
- [ ] Component + E2E tests
- [ ] Performance pass (cold start, map, search targets)
- [ ] Preview build → student beta testers
- [ ] UAT + GPS accuracy validation
- **Exit:** UAT scores collected; critical bugs closed

### Milestone 6 — Production release (Weeks 11–12)
- [ ] Production EAS builds
- [ ] Store listings + privacy docs
- [ ] EAS Update channel
- [ ] (Optional) Admin panel
- **Exit:** v1.0 live on Play Store
