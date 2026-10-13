import { readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { DOMParser } from "linkedom";
import sync from "./tanium-kb-sync.cjs";

const output = resolve(process.argv[2] || "tanium_kb_catalog.v2.json");
const legacyOutput = process.argv[2] ? null : resolve("tanium_kb_catalog.json");
let previous = {};
try { previous = JSON.parse(await readFile(output, "utf8")); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  if (legacyOutput) {
    try { previous = JSON.parse(await readFile(legacyOutput, "utf8")); }
    catch (legacyError) { if (legacyError.code !== "ENOENT") throw legacyError; }
  }
}

let snapshot;
try {
  snapshot = await sync.synchronize({ previous, Parser: DOMParser });
  snapshot.catalog = { ...previous.catalog, ...snapshot.catalog };
  sync.validateSnapshot(snapshot);
} catch (error) {
  snapshot = { ...previous, generatedAt: new Date().toISOString(), sync: {
    ...previous.sync, status: "error", lastAttemptAt: new Date().toISOString(),
    lastSuccessfulAt: previous.sync?.lastSuccessfulAt || null,
    errors: [{ source: "Synchronization", message: error.message }]
  } };
  process.exitCode = 1;
}

// Replace the published file only after the entire snapshot has been assembled.
await writeFile(`${output}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
await rename(`${output}.tmp`, output);
// Preserve the V1 contract for generators that remain open with older HTML.
if (legacyOutput && snapshot.schemaVersion === 2) {
  const legacy = sync.legacySnapshot(snapshot);
  await writeFile(`${legacyOutput}.tmp`, `${JSON.stringify(legacy, null, 2)}\n`, "utf8");
  await rename(`${legacyOutput}.tmp`, legacyOutput);
}
console.log(`Sincronizacao: ${snapshot.sync.status}; ultimo sucesso: ${snapshot.sync.lastSuccessfulAt}`);
for (const version of Object.keys(sync.SERVERS)) console.log(`${version}: ${snapshot.catalog?.[version]?.kb || "indisponivel"} (${snapshot.catalog?.[version]?.releaseDate || "sem data"})`);
for (const error of snapshot.sync.errors || []) console.warn(`${error.source}: ${error.message}`);
if (snapshot.sync.status !== "success") process.exitCode = 1;
