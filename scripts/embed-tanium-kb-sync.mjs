import { readFile, writeFile } from "node:fs/promises";
const engine = await readFile(new URL("./tanium-kb-sync.cjs", import.meta.url), "utf8");
const target = new URL("../gerador_tanium_hostnames_ips_v3.html", import.meta.url);
const html = await readFile(target, "utf8");
const start = "// BEGIN SHARED TANIUM KB SYNC";
const end = "// END SHARED TANIUM KB SYNC";
const block = `${start}\n${engine.trim()}\n${end}`;
const marker = new RegExp(`${start}[\\s\\S]*?${end}`);
const next = marker.test(html) ? html.replace(marker, () => block) : html.replace(/<script>\r?\n/, () => `<script>\n${block}\n`);
if (process.argv.includes("--check")) {
  if (!marker.test(html) || next !== html) throw new Error("HTML e motor de sincronizacao divergentes; execute node scripts/embed-tanium-kb-sync.mjs");
} else await writeFile(target, next, "utf8");
