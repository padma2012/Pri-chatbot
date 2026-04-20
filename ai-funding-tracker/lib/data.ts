import fs from "node:fs";
import path from "node:path";
import type { Dataset } from "./types";

export function loadDataset(): Dataset {
  const p = path.join(process.cwd(), "data", "deals.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as Dataset;
}
