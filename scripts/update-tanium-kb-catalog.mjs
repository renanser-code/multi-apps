import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const OUTPUT = resolve(process.argv[2] || "tanium_kb_catalog.json");

function asArray(value) {
  return value ? (Array.isArray(value) ? value : [value]) : [];
}

function documentId(date, offset = 0) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
  return `${value.getUTCFullYear()}-${MONTHS[value.getUTCMonth()]}`;
}

function osKey(name) {
  const value = String(name || "").toLowerCase();
  if (value.includes("windows server 2025") || value.includes("microsoft server operating system version 24h2")) return "2025";
  if (value.includes("windows server 2022") || value.includes("microsoft server operating system version 21h2")) return "2022";
  if (value.includes("windows server 2019")) return "2019";
  if (value.includes("windows server 2016")) return "2016";
  if (value.includes("windows 11")) return "11";
  if (value.includes("windows 10")) return "10";
  return "";
}

function kbFrom(remediation) {
  const values = [remediation?.Description?.Value, remediation?.Description, remediation?.URL];
  for (const value of values) {
    const match = String(value || "").match(/(?:KB)?(\d{7})/i);
    if (match) return `KB${match[1]}`;
  }
  return "";
}

function compareBuild(left, right) {
  const a = String(left || "").split(".").map(Number);
  const b = String(right || "").split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0);
  }
  return 0;
}

function extractCatalog(data, docId) {
  const products = {};
  const walk = node => {
    if (!node || typeof node !== "object") return;
    const register = product => {
      const key = osKey(product?.Value);
      if (key && product?.ProductID && !/\.net|dynamic update|hotpatch/i.test(product.Value)) {
        products[String(product.ProductID)] = key;
      }
    };
    register(node);
    asArray(node.FullProductName).forEach(register);
    asArray(node.Branch).forEach(walk);
    asArray(node.Items).forEach(walk);
  };
  walk(data.ProductTree);

  const candidates = {};
  for (const vulnerability of asArray(data.Vulnerability)) {
    for (const remediation of asArray(vulnerability.Remediations)) {
      const subtype = String(remediation?.SubType || "");
      if (remediation?.Type && remediation.Type !== 2) continue;
      if (!/security update|monthly rollup/i.test(subtype) || /hotpatch|dynamic|\.net/i.test(subtype)) continue;
      const kb = kbFrom(remediation);
      if (!kb) continue;
      for (const productId of asArray(remediation.ProductID)) {
        const key = products[String(productId)];
        if (!key) continue;
        const candidate = { kb, build: remediation.FixedBuild || "", subtype };
        if (!candidates[key] || compareBuild(candidate.build, candidates[key].build) > 0 ||
            (compareBuild(candidate.build, candidates[key].build) === 0 && /cumulative/i.test(subtype) && !/cumulative/i.test(candidates[key].subtype))) {
          candidates[key] = candidate;
        }
      }
    }
  }

  const title = data?.DocumentTitle?.Value || data?.DocumentTitle || docId;
  const catalog = {};
  for (const [key, item] of Object.entries(candidates)) {
    const product = key === "10" || key === "11" ? `Windows ${key}` : `Windows Server ${key}`;
    catalog[key] = { kb: item.kb, name: `${product} Cumulative Update (${title})` };
  }
  for (const required of ["2016", "2019", "2022", "2025"]) {
    if (!catalog[required]) throw new Error(`Documento ${docId} nao produziu KB para Windows Server ${required}.`);
  }
  return { title, catalog };
}

async function fetchLatest() {
  let lastError;
  for (let offset = 0; offset >= -2; offset -= 1) {
    const docId = documentId(new Date(), offset);
    const sourceUrl = `https://api.msrc.microsoft.com/cvrf/v3.0/cvrf/${docId}`;
    try {
      const response = await fetch(sourceUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { docId, sourceUrl, ...extractCatalog(data, docId) };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Nenhum documento MSRC recente foi encontrado.");
}

const latest = await fetchLatest();
const output = {
  schemaVersion: 1,
  documentId: latest.docId,
  documentTitle: latest.title,
  generatedAt: new Date().toISOString(),
  sourceUrl: latest.sourceUrl,
  catalog: latest.catalog
};
await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Catalogo ${latest.docId} salvo em ${OUTPUT}`);
console.log(Object.entries(latest.catalog).map(([key, item]) => `${key}: ${item.kb}`).join("\n"));
