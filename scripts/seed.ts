import { readFileSync } from "node:fs";
import { PoiCategory } from "@futonav/shared";

interface CsvRow {
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  description: string;
  tags: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h.trim()] = values[i]?.trim() ?? ""));
    return row as unknown as CsvRow;
  });
}

const rows = parseCsv(readFileSync("supabase/seed/pois.csv", "utf-8"));

for (const r of rows) {
  const tags = r.tags
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);

  const sql = `insert into public.pois (name, category, latitude, longitude, description, tags)
values ('${r.name.replace(/'/g, "''")}', '${r.category}', ${parseFloat(r.latitude)}, ${parseFloat(r.longitude)}, ${r.description ? `'${r.description.replace(/'/g, "''")}'` : "null"}, '{${tags.join(",")}}')
on conflict do nothing;`;

  console.log(sql);
}
