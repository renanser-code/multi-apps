(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TaniumKbSync = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const SERVERS = { "2016": "14393", "2019": "17763", "2022": "20348", "2025": "26100" };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MSRC = "https://api.msrc.microsoft.com/cvrf/v3.0";
  const HISTORY = "https://learn.microsoft.com/en-us/windows/release-health/windows-server-release-info";
  const array = value => value ? (Array.isArray(value) ? value : [value]) : [];
  const text = value => String(value?.Value || value || "");
  const clean = value => text(value).replace(/\s+/g, " ").trim();
  const excluded = /\.net|framework|hotpatch|dynamic|preview|insider|arm64|x86|servicing stack/i;

  function isoDate(value) {
    const valueText = text(value);
    const match = valueText.match(/^(\d{4})-(\d{2})-(\d{2})/) || valueText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return "";
    const parts = match[1].length === 4 ? [match[1], match[2], match[3]] : [match[3], match[1].padStart(2, "0"), match[2].padStart(2, "0")];
    const date = parts.join("-");
    const time = Date.parse(date);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === date && parts[0] >= "2000" ? date : "";
  }

  function monthId(date, offset = 0) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
    return `${d.getUTCFullYear()}-${MONTHS[d.getUTCMonth()]}`;
  }

  function monthLabel(date, offset = 0) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
    return d.toISOString().slice(0, 7);
  }

  function patchTuesday(date) {
    const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const day = 1 + ((2 - first.getUTCDay() + 7) % 7) + 7;
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), day, 17));
  }

  function osVersion(name) {
    if (excluded.test(text(name))) return "";
    const match = text(name).match(/Windows Server (2016|2019|2022|2025)\b/i);
    if (match) return match[1];
    if (/Microsoft server operating system(?: version |-)21H2\b/i.test(name)) return "2022";
    if (/Microsoft server operating system(?: version |-)24H2\b/i.test(name)) return "2025";
    return "";
  }

  function normalizeBuild(value) {
    return text(value).replace(/^10\.0\./, "");
  }

  function compareBuild(left, right) {
    const a = normalizeBuild(left).split(".").map(Number);
    const b = normalizeBuild(right).split(".").map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0);
    }
    return 0;
  }

  function validRecord(item, now = new Date()) {
    if (!item || !SERVERS[item.osVersion] || !/^KB\d{7}$/.test(item.kb || "")) return false;
    if (item.architecture !== "x64" || !["security", "oob"].includes(item.kind) || excluded.test(item.name || "")) return false;
    if (osVersion(item.name) !== item.osVersion) return false;
    if (!isoDate(item.releaseDate) || item.releaseDate > now.toISOString().slice(0, 10)) return false;
    if (item.build && !new RegExp(`^${SERVERS[item.osVersion]}\\.\\d+$`).test(normalizeBuild(item.build))) return false;
    try {
      const url = new URL(item.sourceUrl);
      if (url.protocol !== "https:" || !["api.msrc.microsoft.com", "support.microsoft.com", "learn.microsoft.com", "www.catalog.update.microsoft.com"].includes(url.hostname)) return false;
    } catch { return false; }
    return true;
  }

  function record(version, kb, releaseDate, kind, sourceUrl, build = "") {
    return { kb, osVersion: version, architecture: "x64", kind, releaseDate, build: normalizeBuild(build), sourceUrl,
      name: `Windows Server ${version} Cumulative Update${kind === "oob" ? " Out-of-Band" : ""} (${releaseDate})` };
  }

  function parseMsrc(data, docId, now = new Date()) {
    if (!data?.ProductTree || !Array.isArray(data.Vulnerability)) throw new Error(`MSRC ${docId}: formato invalido`);
    const products = new Map();
    const walk = node => {
      if (!node || typeof node !== "object") return;
      for (const p of [node, ...array(node.FullProductName)]) {
        const version = osVersion(p.Value);
        if (version && p.ProductID) products.set(String(p.ProductID), version);
      }
      [...array(node.Branch), ...array(node.Items)].forEach(walk);
    };
    walk(data.ProductTree);
    const results = [];
    for (const vulnerability of data.Vulnerability) {
      for (const rem of array(vulnerability.Remediations)) {
        if (rem.Type !== 2 || !/^security update$|^monthly rollup$/i.test(rem.SubType || "")) continue;
        const match = [text(rem.Description), rem.URL || ""].join(" ").match(/\b(?:KB)?(\d{7})\b/i);
        if (!match || excluded.test([text(rem.Description), rem.SubType].join(" "))) continue;
        for (const pid of array(rem.ProductID)) {
          const version = products.get(String(pid));
          if (!version || !rem.FixedBuild) continue;
          const releaseDate = isoDate(rem.Date) || isoDate(data.DocumentTracking?.InitialReleaseDate);
          const item = record(version, `KB${match[1]}`, releaseDate, "security", `${MSRC}/cvrf/${docId}`, rem.FixedBuild);
          if (validRecord(item, now)) results.push(item);
        }
      }
    }
    return results;
  }

  function parseHistory(html, Parser, now = new Date()) {
    const document = new Parser().parseFromString(html, "text/html");
    const results = [];
    const covered = new Set();
    for (const table of document.querySelectorAll("table")) {
      const headers = [...table.querySelectorAll("th")].map(th => clean(th.textContent));
      if (!headers.includes("KB article") || !headers.includes("Availability date")) continue;
      let previous = table.previousElementSibling;
      let version = "";
      for (let i = 0; previous && i < 4 && !version; i++, previous = previous.previousElementSibling) version = osVersion(previous.textContent);
      if (!version) continue;
      covered.add(version);
      for (const row of table.querySelectorAll("tr")) {
        const cells = [...row.querySelectorAll("td")];
        if (cells.length !== headers.length) continue;
        const value = header => clean(cells[headers.indexOf(header)]?.textContent);
        const kind = value("Update type");
        if (!/\b(?:B|OOB)$/.test(kind)) continue;
        const kb = value("KB article").match(/KB\d{7}/)?.[0];
        const url = cells[headers.indexOf("KB article")]?.querySelector("a")?.getAttribute("href");
        const item = record(version, kb, isoDate(value("Availability date")), /OOB$/.test(kind) ? "oob" : "security", url, value("Build"));
        if (validRecord(item, now)) results.push(item);
      }
    }
    if (covered.size !== 4) throw new Error("Historico Microsoft: tabelas dos quatro Servers nao identificadas");
    return results;
  }

  function parseCatalog(html, version, Parser, now = new Date()) {
    const document = new Parser().parseFromString(html, "text/html");
    const table = document.querySelector('table[id$="updateMatches"]');
    if (!table) {
      if (/did not find any results|no results were found/i.test(document.body?.textContent || "")) return [];
      throw new Error(`Update Catalog ${version}: formato inesperado`);
    }
    const results = [];
    for (const row of table.querySelectorAll("tr")) {
      const cells = [...row.querySelectorAll("td")];
      if (cells.length < 5) continue;
      const title = clean(cells[1].textContent);
      const product = clean(cells[2].textContent);
      const classification = clean(cells[3].textContent);
      if (excluded.test(title) || osVersion(title) !== version || !/cumulative update/i.test(title) || !/x64/i.test(title)) continue;
      if (osVersion(product) !== version && !product.toLowerCase().includes(`server ${version}`)) continue;
      const kb = title.match(/\bKB\d{7}\b/i)?.[0].toUpperCase();
      const releaseDate = isoDate(clean(cells[4].textContent));
      const titleMonth = title.match(/^(\d{4}-\d{2})\b/)?.[1];
      // Catalog dates can reflect metadata revisions, not a new cumulative release.
      if (!titleMonth || !releaseDate || releaseDate.slice(0, 7) !== titleMonth) continue;
      if (releaseDate < `${monthLabel(now, -2)}-01`) continue;
      const sourceUrl = `https://www.catalog.update.microsoft.com/Search.aspx?q=${kb}`;
      const kind = /out.of.band|\bOOB\b/i.test(title) ? "oob" : /^Security Updates$/i.test(classification) ? "security" : "";
      const item = record(version, kb, releaseDate, kind, sourceUrl, title.match(/\((\d+\.\d+)\)/)?.[1] || "");
      const updateId = row.id?.match(/^[\da-f-]{36}/i)?.[0];
      if (kind && validRecord(item, now)) results.push(item);
      else if (!kind && /^Updates$/i.test(classification) && updateId) results.push({ ...item, needsOobVerification: true, updateId });
    }
    return results;
  }

  function selectLatest(candidates, previous = {}, now = new Date()) {
    const result = {};
    for (const version of Object.keys(SERVERS)) {
      const records = [...candidates, previous[version]].filter(item => item?.osVersion === version && validRecord(item, now));
      const unique = new Map();
      for (const item of records) {
        const known = unique.get(item.kb);
        if (!known) unique.set(item.kb, { ...item });
        else {
          const preferred = item.build && !known.build ? item : known;
          unique.set(item.kb, { ...preferred, releaseDate: [known.releaseDate, item.releaseDate].sort()[0] });
        }
      }
      const items = [...unique.values()];
      items.sort((a, b) => {
        if (a.build && b.build) return compareBuild(b.build, a.build) || b.releaseDate.localeCompare(a.releaseDate);
        return b.releaseDate.localeCompare(a.releaseDate) || Number(Boolean(b.build)) - Number(Boolean(a.build));
      });
      if (items[0]) result[version] = { ...items[0] };
    }
    return result;
  }

  function validateSnapshot(snapshot, now = new Date()) {
    if (snapshot?.schemaVersion !== 2 || !snapshot.catalog || !isoDate(snapshot.sync?.lastSuccessfulAt) || !Number.isFinite(Date.parse(snapshot.sync.lastSuccessfulAt)) || !["success", "degraded", "error"].includes(snapshot.sync.status)) throw new Error("Catalogo sem metadados de sincronizacao validos");
    if (Date.parse(snapshot.sync.lastSuccessfulAt) > now.getTime() + 5 * 60 * 1000) throw new Error("Data de sincronizacao futura");
    for (const version of Object.keys(SERVERS)) if (!validRecord(snapshot.catalog[version], now) || snapshot.catalog[version].osVersion !== version) throw new Error(`KB invalido para Server ${version}`);
    return snapshot;
  }

  function freshness(snapshot, now = new Date()) {
    const reasons = [];
    if (!snapshot?.sync?.lastSuccessfulAt || now - new Date(snapshot.sync.lastSuccessfulAt) > 90 * 60 * 1000) reasons.push("Ultima consulta oficial ha mais de 90 minutos");
    if (snapshot?.sync?.status !== "success") reasons.push("Uma ou mais fontes oficiais estao indisponiveis");
    const currentMonth = monthLabel(now);
    if (now.getTime() >= patchTuesday(now).getTime() + 24 * 60 * 60 * 1000) {
      const lagging = Object.keys(SERVERS).filter(version => (snapshot?.catalog?.[version]?.releaseDate || "") < `${currentMonth}-01`);
      if (lagging.length) reasons.push(`Ciclo ${currentMonth} ainda nao confirmado para Server ${lagging.join(", ")}`);
    }
    return reasons;
  }

  async function request(url, options = {}) {
    const { fetchImpl = fetch, attempts = 3, timeoutMs = 20000, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), json = false } = options;
    let lastError;
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const response = await fetchImpl(url, { cache: "no-store", headers: { Accept: json ? "application/json" : "text/html" }, signal: AbortSignal.timeout(timeoutMs) });
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`);
          error.permanent = response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status);
          throw error;
        }
        return json ? await response.json() : await response.text();
      } catch (error) {
        lastError = error;
        if (error.permanent || attempt === attempts - 1) break;
        await sleep(Math.min(500 * 2 ** attempt, 4000));
      }
    }
    throw new Error(`${url}: ${lastError?.message || "Falha de consulta"}`);
  }

  async function synchronize(options = {}) {
    const { now = new Date(), previous = {}, Parser, fetchImpl = fetch, sleep } = options;
    const candidates = [];
    const errors = [];
    const checks = [];
    const covered = new Set();
    const read = (url, json = false) => request(url, { fetchImpl, sleep, json, timeoutMs: options.timeoutMs || 20000 });
    const check = async (label, action) => {
      try { await action(); checks.push({ source: label, ok: true }); }
      catch (error) { errors.push({ source: label, message: error.message }); checks.push({ source: label, ok: false }); }
    };
    await check("Microsoft release history", async () => {
      candidates.push(...parseHistory(await read(HISTORY), Parser, now));
      Object.keys(SERVERS).forEach(version => covered.add(version));
    });
    let ids = [monthId(now), monthId(now, -1)];
    await check("MSRC publications", async () => {
      const data = await read(`${MSRC}/updates`, true);
      const updates = Array.isArray(data) ? data : data.value;
      if (!Array.isArray(updates)) throw new Error("MSRC: lista de publicacoes invalida");
      const recent = updates.filter(item => /^\d{4}-[A-Z][a-z]{2}$/.test(item.ID || "") && isoDate(item.InitialReleaseDate) >= `${monthLabel(now, -2)}-01` && isoDate(item.InitialReleaseDate) <= now.toISOString().slice(0, 10));
      ids = [...new Set([...ids, ...recent.map(item => item.ID)])];
    });
    for (const id of ids) await check(`MSRC ${id}`, async () => {
      const items = parseMsrc(await read(`${MSRC}/cvrf/${id}`, true), id, now);
      candidates.push(...items);
      items.forEach(item => covered.add(item.osVersion));
    });
    for (const version of Object.keys(SERVERS)) {
      for (let offset = 0; offset >= -1; offset--) await check(`Update Catalog ${version} ${monthLabel(now, offset)}`, async () => {
        const product = version === "2022" ? "Microsoft server operating system version 21H2" : version === "2025" ? "Microsoft server operating system version 24H2" : `Windows Server ${version}`;
        const query = `${monthLabel(now, offset)} Cumulative Update ${product} x64`;
        const url = `https://www.catalog.update.microsoft.com/Search.aspx?q=${encodeURIComponent(query)}`;
        const items = parseCatalog(await read(url), version, Parser, now);
        for (const item of items) {
          if (item.needsOobVerification) {
            const known = candidates.find(candidate => candidate.kb === item.kb && candidate.osVersion === version && candidate.kind === "oob");
            if (known) candidates.push(known);
            else {
              const support = new Parser().parseFromString(await read(`https://support.microsoft.com/help/${item.kb.slice(2)}`), "text/html");
              const title = clean(support.querySelector("h1")?.textContent);
              const build = /OS Builds?/i.test(title) ? title.match(new RegExp(`\\b${SERVERS[version]}\\.\\d+\\b`))?.[0] : "";
              if (/out.of.band/i.test(title) && title.includes(item.kb) && build?.startsWith(`${SERVERS[version]}.`)) candidates.push({ ...item, kind: "oob", build, sourceUrl: `https://support.microsoft.com/help/${item.kb.slice(2)}` });
            }
          } else candidates.push(item);
        }
        covered.add(version);
      });
    }
    const catalog = selectLatest(candidates, previous.catalog, now);
    for (const version of Object.keys(SERVERS)) {
      if (!catalog[version]) throw new Error(`Nenhum KB cumulativo validado para Server ${version}`);
      if (!covered.has(version)) errors.push({ source: `Server ${version}`, message: "Nenhuma fonte oficial consultada com sucesso" });
    }
    const successful = covered.size === 4;
    const dates = Object.values(catalog).map(item => item.releaseDate).sort();
    return { schemaVersion: 2, documentId: monthId(new Date(`${dates.at(-1)}T12:00:00Z`)), documentTitle: "Windows Server Security / Out-of-Band Cumulative Updates", generatedAt: now.toISOString(),
      sourceUrl: HISTORY, catalog,
      sync: { status: successful ? (errors.length ? "degraded" : "success") : "error", lastAttemptAt: now.toISOString(), lastSuccessfulAt: successful ? now.toISOString() : previous.sync?.lastSuccessfulAt || null,
        lastCompleteSuccessAt: successful && !errors.length ? now.toISOString() : previous.sync?.lastCompleteSuccessAt || null, checks, errors },
      history: [...new Map(candidates.filter(item => validRecord(item, now)).map(item => [`${item.osVersion}:${item.kb}`, item])).values()].filter(item => item.releaseDate >= `${monthLabel(now, -2)}-01`).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)) };
  }

  return { SERVERS, MSRC, HISTORY, isoDate, monthId, patchTuesday, osVersion, validRecord, record, parseMsrc, parseHistory, parseCatalog, selectLatest, validateSnapshot, freshness, request, synchronize };
});
