const { test } = require("node:test");
const assert = require("node:assert/strict");
const { DOMParser } = require("linkedom");
const sync = require("./tanium-kb-sync.cjs");
const readV1 = require("./fixtures/tanium-kb-v1-client.cjs");
const now = new Date("2026-11-12T19:00:00Z");
const versions = Object.keys(sync.SERVERS);
const build = version => `${sync.SERVERS[version]}.9000`;
const item = (version, kb, date = "2026-10-13", kind = "security") => sync.record(version, kb, date, kind, "https://support.microsoft.com/help/5000001", build(version));
const baseline = () => ({ schemaVersion: 2, catalog: Object.fromEntries(versions.map((v, i) => [v, item(v, `KB500000${i + 1}`)])), sync: { status: "success", lastSuccessfulAt: "2026-11-12T18:30:00Z", lastCompleteSuccessAt: "2026-11-12T18:30:00Z" } });
const history = (date = "2026-10-13", kind = "B") => versions.map((v, i) => `<strong>Windows Server ${v} (OS build ${sync.SERVERS[v]})</strong><table><tr><th>Servicing option</th><th>Update type</th><th>Availability date</th><th>Build</th><th>KB article</th></tr><tr><td>LTSC</td><td>${date.slice(0, 7)} ${kind}</td><td>${date}</td><td>${build(v)}</td><td><a href="https://support.microsoft.com/help/500000${i + 1}">KB500000${i + 1}</a></td></tr></table>`).join("");
const catalogRow = (title, product, classification = "Security Updates", date = "11/10/2026") => `<tr id="aaaaaaaa-1111-2222-3333-aaaaaaaaaaaa_R0"><td></td><td>${title}</td><td>${product}</td><td>${classification}</td><td>${date}</td></tr>`;
const table = rows => `<table id="ctl00_catalogBody_updateMatches">${rows}</table>`;
const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body, text: async () => body });
const product = v => v === "2022" ? "Microsoft Server operating system-21H2" : v === "2025" ? "Microsoft Server Operating System-24H2" : `Windows Server ${v}`;
const titleProduct = v => v === "2022" ? "Microsoft server operating system version 21H2" : v === "2025" ? "Microsoft server operating system version 24H2" : `Windows Server ${v}`;

function fakeSources(options = {}) {
  return async url => {
    if (options.failAll) return response("", 503);
    if (url === sync.HISTORY) return response(history());
    if (url.endsWith("/updates")) return response([]);
    if (url.includes("/cvrf/")) return response({ ProductTree: {}, Vulnerability: [] });
    if (url.startsWith("https://support.microsoft.com/help/")) return response(`<h1>November 12, 2026 - KB6000003 (OS Build 20348.9001) Out-of-band</h1>`);
    if (url.includes("catalog.update.microsoft.com")) {
      const query = new URL(url).searchParams.get("q");
      const v = versions.find(v => query.includes(titleProduct(v)));
      if (options.failServer === v) return response("", 503);
      if (!query.startsWith("2026-11")) return response(table(""));
      const i = versions.indexOf(v);
      const date = options.oob && v === "2022" ? "11/12/2026" : "11/10/2026";
      return response(table(catalogRow(`2026-11 Cumulative Update for ${titleProduct(v)} for x64-based Systems (KB600000${i + 1})`, product(v), options.oob && v === "2022" ? "Updates" : "Security Updates", date)));
    }
    throw new Error(`Unexpected URL ${url}`);
  };
}

test("next monthly publication replaces all four old KBs without month-specific rules", async () => {
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, fetchImpl: fakeSources(), sleep: async () => {} });
  assert.equal(result.sync.status, "success");
  assert.equal(result.documentId, "2026-Nov");
  versions.forEach((v, i) => assert.equal(result.catalog[v].kb, `KB600000${i + 1}`));
  sync.validateSnapshot(result, now);
});

test("Catalog publication is accepted while MSRC is early and history still contains previous month", async () => {
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, fetchImpl: fakeSources(), sleep: async () => {} });
  assert.equal(result.catalog["2025"].releaseDate, "2026-11-10");
  assert.equal(result.catalog["2022"].osVersion, "2022");
});

test("unpublished current month is not requested and does not falsely degrade synchronization", async () => {
  const early = new Date("2026-11-01T00:30:00Z");
  const calls = [];
  const sources = fakeSources();
  const fetchImpl = async url => {
    calls.push(url);
    if (url.endsWith("/updates")) return response({ value: [{ ID: "2026-Oct", InitialReleaseDate: "2026-10-13T07:00:00Z" }] });
    if (url.endsWith("/cvrf/2026-Nov")) return response("", 404);
    return sources(url);
  };
  const result = await sync.synchronize({ previous: baseline(), now: early, Parser: DOMParser, fetchImpl, sleep: async () => {} });
  assert.equal(result.sync.status, "success");
  assert.equal(result.sync.errors.length, 0);
  assert(calls.some(url => url.endsWith("/cvrf/2026-Oct")));
  assert(!calls.some(url => url.endsWith("/cvrf/2026-Nov")));
  versions.forEach((v, i) => assert.equal(result.catalog[v].kb, `KB500000${i + 1}`));
});

test("newly announced MSRC document is queried on the next sync without a calendar gate", async () => {
  const calls = [];
  const sources = fakeSources();
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, sleep: async () => {}, fetchImpl: async url => {
    calls.push(url);
    if (url.endsWith("/updates")) return response({ value: [{ ID: "2026-Nov", InitialReleaseDate: "2026-11-10T07:00:00Z" }] });
    return sources(url);
  } });
  assert.equal(result.sync.status, "success");
  assert(calls.some(url => url.endsWith("/cvrf/2026-Nov")));
});

test("404 for a published MSRC document remains a real source failure", async () => {
  const sources = fakeSources();
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, sleep: async () => {}, fetchImpl: async url => {
    if (url.endsWith("/updates")) return response([{ ID: "2026-Nov", InitialReleaseDate: "2026-11-10" }]);
    if (url.endsWith("/cvrf/2026-Nov")) return response("", 404);
    return sources(url);
  } });
  assert.equal(result.sync.status, "degraded");
  assert(result.sync.errors.some(error => error.source === "MSRC 2026-Nov" && error.message.includes("404")));
});

test("publication index outage preserves fallback document queries and reports the failure", async () => {
  const calls = [];
  const sources = fakeSources();
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, sleep: async () => {}, fetchImpl: async url => {
    calls.push(url);
    if (url.endsWith("/updates")) return response("", 503);
    return sources(url);
  } });
  assert.equal(result.sync.status, "degraded");
  assert(result.sync.errors.some(error => error.source === "MSRC publications"));
  assert(calls.some(url => url.endsWith("/cvrf/2026-Nov")));
  assert(calls.some(url => url.endsWith("/cvrf/2026-Oct")));
});

test("emergency classified as Updates is recognized but never replaces the monthly KB", async () => {
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, fetchImpl: fakeSources({ oob: true }), sleep: async () => {} });
  assert.equal(result.catalog["2022"].kb, baseline().catalog["2022"].kb);
  assert(result.history.some(entry => entry.kb === "KB6000003" && entry.kind === "oob"));
});

test("preview, .NET, hotpatch, architecture and incorrect product associations are rejected", () => {
  const base = "2026-11 Cumulative Update for Windows Server 2016 for x64-based Systems (KB6000001)";
  const html = table([
    catalogRow(base, "Windows Server 2016"),
    catalogRow(base.replace("Cumulative Update", "Cumulative Update Preview"), "Windows Server 2016"),
    catalogRow(base.replace("Cumulative Update", "Cumulative Update for .NET Framework"), "Windows Server 2016"),
    catalogRow(base.replace("x64", "arm64"), "Windows Server 2016"),
    catalogRow(base, "Windows Server 2019"),
    catalogRow(base.replace("Cumulative Update", "Cumulative Hotpatch Update"), "Windows Server 2016")
  ].join(""));
  assert.equal(sync.parseCatalog(html, "2016", DOMParser, now).length, 1);
  assert.equal(sync.validRecord({ ...item("2016", "KB5000001"), build: "20348.9000" }, now), false);
});

test("MSRC filters components and selects valid full OS build, without confusing Server 2022 and 2025", () => {
  const data = { ProductTree: { FullProductName: [
    { ProductID: "22", Value: "Windows Server 2022" },
    { ProductID: "25", Value: "Windows Server 2025" },
    { ProductID: "net", Value: ".NET Framework 4.8 for Windows Server 2022" }
  ] }, DocumentTracking: { InitialReleaseDate: "2026-11-10T07:00:00Z" }, Vulnerability: [{ Remediations: [
    { Type: 2, SubType: "Security Update", Description: { Value: "6000001" }, ProductID: ["22"], FixedBuild: "10.0.20348.9001" },
    { Type: 2, SubType: "Security Update", Description: { Value: "6000002" }, ProductID: ["25"], FixedBuild: "10.0.20348.9001" },
    { Type: 2, SubType: "Security Update", Description: { Value: "6000003" }, ProductID: ["net"], FixedBuild: "10.0.20348.9001" }
  ] }] };
  const parsed = sync.parseMsrc(data, "2026-Nov", now);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].osVersion, "2022");
});

test("history OOB recognized independently from the second Tuesday; previews not deployed", () => {
  assert.equal(sync.parseHistory(history("2026-10-20", "OOB"), DOMParser, now).length, 4);
  assert.equal(sync.parseHistory(history("2026-10-20", "D"), DOMParser, now).length, 0);
  assert.throws(() => sync.parseHistory("<html>Format changed</html>", DOMParser, now));
});

test("partial source outage updates other versions and preserves previously validated KB for affected version", async () => {
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, fetchImpl: fakeSources({ failServer: "2016" }), sleep: async () => {} });
  assert.equal(result.sync.status, "degraded");
  assert.equal(result.catalog["2016"].kb, "KB5000001");
  assert.equal(result.catalog["2025"].kb, "KB6000004");
  assert.equal(result.sync.lastCompleteSuccessAt, baseline().sync.lastCompleteSuccessAt);
  assert(result.sync.errors.some(e => e.source.includes("2016")));
});

test("complete outage retains last successful timestamp and data, never reports success", async () => {
  const result = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, fetchImpl: fakeSources({ failAll: true }), sleep: async () => {} });
  assert.equal(result.sync.status, "error");
  assert.equal(result.sync.lastSuccessfulAt, baseline().sync.lastSuccessfulAt);
  assert.deepEqual(result.catalog, baseline().catalog);
});

test("transient network/429/timeout failures retry, permanent 404 does not repeat", async () => {
  let calls = 0;
  const retries = [];
  assert.equal(await sync.request(sync.HISTORY, { fetchImpl: async () => response("ok", ++calls < 3 ? 429 : 200), sleep: async ms => retries.push(ms) }), "ok");
  assert.equal(calls, 3);
  assert.deepEqual(retries, [500, 1000]);
  calls = 0;
  await assert.rejects(sync.request(sync.HISTORY, { fetchImpl: async () => { calls++; return response("", 404); }, sleep: async () => {} }));
  assert.equal(calls, 1);
  calls = 0;
  await sync.request(sync.HISTORY, { fetchImpl: async () => { if (++calls < 3) throw new Error("TimeoutError"); return response("ok"); }, sleep: async () => {} });
  assert.equal(calls, 3);
});

test("invalid dates/future KBs are rejected; no duplicate results or downgrade on older snapshot", () => {
  const good = item("2016", "KB5000001");
  assert.equal(sync.validRecord({ ...good, releaseDate: "2026-02-31" }, now), false);
  assert.equal(sync.validRecord({ ...good, releaseDate: "2026-12-01" }, now), false);
  const previous = { "2016": { ...good, build: "14393.9001", kb: "KB5000002" } };
  assert.equal(sync.selectLatest([good, good], previous, now)["2016"].kb, "KB5000002");
  assert.equal(Object.keys(sync.selectLatest([good, good], {}, now)).length, 1);
});

test("calendar uses actual second Tuesday, alert awaits confirmation from data, independent of fixed day", () => {
  assert.equal(sync.patchTuesday(new Date("2026-10-01")).toISOString(), "2026-10-13T17:00:00.000Z");
  assert.equal(sync.patchTuesday(new Date("2026-11-01")).toISOString(), "2026-11-10T17:00:00.000Z");
  const stale = baseline();
  assert(sync.freshness(stale, now).some(reason => reason.includes("2026-11")));
});

test("a known emergency is excluded even if another source calls it a security update", () => {
  const monthly = item("2022", "KB6000001", "2026-11-10");
  const emergency = { ...item("2022", "KB6000002", "2026-11-11", "oob"), build: "20348.9005" };
  const mislabeled = item("2022", emergency.kb, "2026-11-10");
  assert.equal(sync.selectLatest([monthly, mislabeled, emergency], {}, now)["2022"].kb, monthly.kb);
});

test("off-cycle MSRC and Catalog records do not pass without monthly release history", () => {
  const monthly = item("2022", "KB6000001", "2026-11-10");
  const ambiguous = { ...item("2022", "KB6000002", "2026-11-12"), build: "20348.9005" };
  for (const sourceUrl of [`${sync.MSRC}/cvrf/2026-Nov`, "https://www.catalog.update.microsoft.com/Search.aspx?q=KB6000002"]) {
    assert.equal(sync.selectLatest([monthly, { ...ambiguous, sourceUrl }], {}, now)["2022"].kb, monthly.kb);
  }
  assert.equal(sync.selectLatest([monthly, ambiguous], {}, now)["2022"].kb, ambiguous.kb);
});

test("old published snapshots recover the last monthly KB instead of using an emergency", () => {
  const old = baseline();
  const monthly = old.catalog["2022"];
  old.history = [monthly];
  old.catalog["2022"] = item("2022", "KB6000002", "2026-11-12", "oob");
  const migrated = sync.monthlySnapshot(old, {}, now);
  assert.equal(migrated.catalog["2022"].kb, monthly.kb);
  assert.equal(migrated.documentId, "2026-Oct");
  assert.deepEqual(migrated.sync, old.sync);
  assert.throws(() => sync.monthlySnapshot({ ...old, history: [] }, {}, now), /Nenhum KB mensal/);
});

test("old cached HTML rejects V2 but accepts the companion V1 catalog with identical new KBs", async () => {
  const latest = await sync.synchronize({ previous: baseline(), now, Parser: DOMParser, fetchImpl: fakeSources(), sleep: async () => {} });
  const url = "https://raw.githubusercontent.com/renanser-code/multi-apps/main/tanium_kb_catalog.json";
  await assert.rejects(readV1(async () => response(latest), url), /Catalogo automatico invalido/);
  const legacy = sync.legacySnapshot(latest, now);
  const accepted = await readV1(async () => response(legacy), url);
  assert.equal(accepted.schemaVersion, 1);
  versions.forEach((v, i) => assert.equal(accepted.catalog[v].kb, `KB600000${i + 1}`));
  assert.equal(accepted.generatedAt, latest.generatedAt);
  assert.equal(accepted.sync.lastSuccessfulAt, latest.sync.lastSuccessfulAt);
  assert.equal(latest.schemaVersion, 2);
  sync.validateSnapshot(latest, now);
});
