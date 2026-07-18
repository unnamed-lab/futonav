// Seeds a remote Supabase `pois` table with the baseline campus POIs.
//
// Idempotent: BASELINE_POIS carry stable UUIDs, so re-running only inserts rows
// that aren't already present (existing rows — including admin edits — are left
// untouched).
//
// Usage (env can come from apps/admin/.env.production):
//   set -a; . apps/admin/.env.production; set +a; npx tsx scripts/seed-remote.ts
//
// Required env: SUPABASE_SERVICE_KEY and one of
//   SUPABASE_URL | NEXT_PUBLIC_SUPABASE_URL | EXPO_PUBLIC_SUPABASE_URL

import { getSupabaseClient, createPoiRepository } from "@futonav/api-client";
import { BASELINE_POIS } from "../apps/mobile/src/data/baselinePois";

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error(
    "Missing env. Need SUPABASE_SERVICE_KEY and a Supabase URL.\n" +
      "Try: set -a; . apps/admin/.env.production; set +a; npx tsx scripts/seed-remote.ts",
  );
  process.exit(1);
}

async function main() {
  const repo = createPoiRepository(getSupabaseClient(url!, key!));

  let existing;
  try {
    existing = await repo.fetchAll();
  } catch (err) {
    console.error(
      "Could not read the pois table. Is the schema applied (run supabase/migrations)?",
      (err as Error)?.message ?? err,
    );
    process.exit(1);
  }

  const existingIds = new Set(existing.map((p) => p.id));
  console.log(`Remote pois currently: ${existing.length}. Baseline to seed: ${BASELINE_POIS.length}.`);

  let inserted = 0;
  let skipped = 0;
  for (const poi of BASELINE_POIS) {
    if (existingIds.has(poi.id)) {
      skipped++;
      continue;
    }
    await repo.upsert({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      latitude: poi.latitude,
      longitude: poi.longitude,
      description: poi.description,
      tags: poi.tags,
      imageUrl: poi.imageUrl,
    });
    inserted++;
    console.log(`  + ${poi.name}`);
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped} (already present).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
