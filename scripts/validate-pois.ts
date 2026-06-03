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

let exitCode = 0;

const rows = parseCsv(readFileSync("supabase/seed/pois.csv", "utf-8"));

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const lineNum = i + 2;

  if (!r.name) {
    console.error(`Row ${lineNum}: missing name`);
    exitCode = 1;
  }

  const catResult = PoiCategory.safeParse(r.category);
  if (!catResult.success) {
    console.error(`Row ${lineNum}: invalid category "${r.category}"`);
    exitCode = 1;
  }

  const lat = parseFloat(r.latitude);
  const lng = parseFloat(r.longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    console.error(`Row ${lineNum}: invalid latitude "${r.latitude}"`);
    exitCode = 1;
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    console.error(`Row ${lineNum}: invalid longitude "${r.longitude}"`);
    exitCode = 1;
  }

  if (r.description && r.description.length > 200) {
    console.error(`Row ${lineNum}: description too long (${r.description.length} chars)`);
    exitCode = 1;
  }
}

if (exitCode === 0) {
  console.log(`All ${rows.length} POIs validated successfully.`);
}

process.exit(exitCode);
