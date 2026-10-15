const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { DOMParser } = require("linkedom");
const engine = require("./tanium-kb-sync.cjs");
const html = fs.readFileSync(require("node:path").join(__dirname, "../gerador_tanium_hostnames_ips_v3.html"), "utf8");
const now = new Date("2026-11-12T19:00:00Z");

function snapshot(fresh = true, newer = false) {
  const date = newer ? "2026-11-10" : "2026-10-13";
  return { schemaVersion: 2, documentId: newer ? "2026-Nov" : "2026-Oct",
    catalog: Object.fromEntries(Object.keys(engine.SERVERS).map((v, i) => [v, engine.record(v, `KB${newer ? 6000001 + i : 5000001 + i}`, date, "security", "https://support.microsoft.com/help/5000001")])),
    sync: { status: "success", lastSuccessfulAt: fresh ? now.toISOString() : "2026-11-12T10:00:00Z", lastCompleteSuccessAt: now.toISOString(), errors: [] } };
}

function browser(realGenerators = false) {
  const elements = new Map();
  const timers = new Map();
  const stored = new Map();
  const events = new Map();
  let timerId = 0;
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
    static now() { return now.getTime(); }
  }
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: "", checked: false, textContent: "", innerHTML: "", style: {}, disabled: false,
      addEventListener() {}, classList: { add() {}, remove() {} } });
    return elements.get(id);
  };
  const context = vm.createContext({ Date: Clock, URL, AbortSignal, DOMParser, console: { log() {}, warn() {} },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    localStorage: { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value) },
    navigator: {}, location: { protocol: "https:", href: "https://renanser-code.github.io/multi-apps/gerador_tanium_hostnames_ips_v3.html" },
    window: { addEventListener: (name, fn) => events.set(name, fn) },
    document: { getElementById: element, querySelectorAll: () => [], hidden: false, addEventListener: (name, fn) => events.set(name, fn) } });
  let script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const startup = /generate\(\);\s*(?:generateClosure\(\);\s*)?updateScriptPreview\(\);\s*initializeKbSynchronization\(\);/;
  assert(startup.test(script), "must suppress startup only, leaving real browser loader intact");
  script = script.replace(startup, "");
  vm.runInContext(script, context);
  if (!realGenerators) vm.runInContext("generate = generateClosure = updateScriptPreview = renderServerKbLookup = () => {};", context);
  const load = vm.runInContext("loadLatestKBsFromMicrosoft", context);
  const initialize = vm.runInContext("initializeKbSynchronization", context);
  const read = expression => vm.runInContext(expression, context);
  return { context, elements, timers, stored, events, element, load, initialize, read };
}

test("HTML uses shared engine, raw catalog first, and shows current heartbeat with automatic polling", async () => {
  const b = browser();
  const urls = [];
  const current = snapshot(true, true);
  b.context.TaniumKbSync.request = async url => { urls.push(url); return current; };
  b.context.TaniumKbSync.synchronize = async () => { throw new Error("fresh catalog must not trigger direct Microsoft queries"); };
  await b.load();
  assert(urls[0].startsWith("https://raw.githubusercontent.com/renanser-code/multi-apps/main/tanium_kb_catalog.v2.json?t="));
  assert.equal(b.read('KB_CATALOG["2016"].kb'), "KB6000001");
  assert.equal(b.element("kbSyncStatus").className, "kb-sync-status ok");
  assert(b.element("kbSyncStatus").textContent.includes("12/11/2026"));
  assert.equal([...b.timers.values()].at(-1).delay, 15 * 60 * 1000);
  assert.equal(b.element("kbSyncRefresh").disabled, false);
});

test("previous-month catalog is not accepted after Patch Tuesday; direct sync refreshes all versions", async () => {
  const b = browser();
  b.context.TaniumKbSync.request = async () => snapshot();
  let calls = 0;
  b.context.TaniumKbSync.synchronize = async () => { calls++; return snapshot(true, true); };
  await b.load();
  assert.equal(calls, 1);
  assert.equal(b.read('KB_CATALOG["2025"].kb'), "KB6000004");
  assert.equal(b.element("kbSyncStatus").className, "kb-sync-status ok");
});

test("overlapping requests share one in-flight synchronization", async () => {
  const b = browser();
  let complete;
  let calls = 0;
  b.context.TaniumKbSync.request = () => { calls++; return new Promise(resolve => { complete = resolve; }); };
  const first = b.load();
  const second = b.load();
  assert.equal(first, second);
  assert.equal(calls, 1);
  assert.equal(b.element("kbSyncRefresh").disabled, true);
  complete(snapshot(true, true));
  await first;
});

test("offline failures preserve validated cache and timestamp, warn, retry with backoff, then recover", async () => {
  const b = browser();
  b.stored.set("tanium-kb-catalog-v2", JSON.stringify(snapshot(false, true)));
  b.context.TaniumKbSync.request = async () => { throw new Error("offline"); };
  b.context.TaniumKbSync.synchronize = async () => { throw new Error("offline"); };
  await b.initialize();
  assert.equal(b.read('KB_CATALOG["2022"].kb'), "KB6000003");
  assert.equal(b.read("kbSyncSnapshot.sync.lastSuccessfulAt"), "2026-11-12T10:00:00Z");
  assert.equal(b.element("kbSyncStatus").className, "kb-sync-status warning");
  assert.equal([...b.timers.values()].at(-1).delay, 60000);
  await b.load();
  assert.equal([...b.timers.values()].at(-1).delay, 120000);
  b.context.TaniumKbSync.request = async () => snapshot(true, true);
  await b.load();
  assert.equal(b.element("kbSyncStatus").className, "kb-sync-status ok");
  assert.equal([...b.timers.values()].at(-1).delay, 15 * 60 * 1000);
  assert.equal(b.read("kbSyncFailures"), 0);
});

test("wrong Server association is rejected without overwriting last valid catalog", async () => {
  const b = browser();
  b.context.TaniumKbSync.request = async () => snapshot(true, true);
  await b.load();
  const invalid = snapshot(true, true);
  invalid.catalog["2016"] = invalid.catalog["2025"];
  b.context.TaniumKbSync.request = async () => invalid;
  b.context.TaniumKbSync.synchronize = async () => { throw new Error("offline"); };
  await b.load();
  assert.equal(b.read('KB_CATALOG["2016"].kb'), "KB6000001");
  assert.equal(b.element("kbSyncStatus").className, "kb-sync-status warning");
});

test("partial sync incorporates newly published KBs, warns about source failure and retries", async () => {
  const b = browser();
  b.context.TaniumKbSync.request = async () => snapshot(false);
  const partial = snapshot(true, true);
  partial.sync.status = "degraded";
  partial.sync.errors = [{ source: "MSRC", message: "HTTP 503" }];
  b.context.TaniumKbSync.synchronize = async () => partial;
  await b.load();
  assert.equal(b.read('KB_CATALOG["2019"].kb'), "KB6000002");
  assert.equal(b.element("kbSyncStatus").className, "kb-sync-status warning");
  assert(b.element("kbSyncStatus").title.includes("MSRC: HTTP 503"));
  assert.equal([...b.timers.values()].at(-1).delay, 60000);
});

test("corrupt local cache is ignored; online and visible events restart synchronization", async () => {
  const b = browser();
  b.stored.set("tanium-kb-catalog-v2", "not-json");
  let calls = 0;
  b.context.TaniumKbSync.request = async () => { calls++; return snapshot(true, true); };
  await b.initialize();
  await b.events.get("online")();
  b.events.get("visibilitychange")();
  await b.load();
  assert.equal(calls, 3);
  assert.equal(b.read('KB_CATALOG["2025"].kb'), "KB6000004");
});

test("local file uses remote automatic catalog without a server or same-origin JSON", async () => {
  const b = browser();
  b.context.location = { protocol: "file:", href: "file:///C:/Manuais/gerador_tanium_hostnames_ips_v3.html" };
  const urls = [];
  b.context.TaniumKbSync.request = async url => { urls.push(url); return snapshot(true, true); };
  await b.load();
  assert.equal(urls.length, 1);
  assert(urls[0].startsWith("https://raw.githubusercontent.com/"));
  assert.equal(b.read('KB_CATALOG["2016"].kb'), "KB6000001");
});

test("new month regenerates opening email, closure email and PDF report using only affected Servers", async () => {
  const b = browser(true);
  b.element("input").value = [
    "SV-KB-2016 Microsoft Windows Server 2016 (64-bit)",
    "SV-KB-2019 Microsoft Windows Server 2019 (64-bit)",
    "SV-KB-2022 Microsoft Windows Server 2022 (64-bit)",
    "SV-KB-2025 Microsoft Windows Server 2025 (64-bit)",
    "SV-KB-2012 Microsoft Windows Server 2012 (64-bit)",
    "SV-KB-LINUX Debian GNU/Linux 12 (64-bit)"
  ].join("\n");
  b.element("closureStatus").value = "Concluida com sucesso";
  b.element("schedGmud").value = "TEST-SYNC";
  b.element("closureClient").value = "TEST";
  b.context.TaniumKbSync.request = async () => snapshot(false);
  b.context.TaniumKbSync.synchronize = async () => snapshot(true, true);
  await b.load();
  const report = b.read("buildClosureReportHtml()");
  for (const markup of [b.element("emailText").innerHTML, b.element("closureEmailText").innerHTML, report]) {
    for (const kb of ["KB6000001", "KB6000002", "KB6000003", "KB6000004"]) assert(markup.includes(kb), `missing ${kb}`);
    assert(!markup.includes("KB5000001"));
    assert(markup.includes("2012"));
  }
  b.element("input").value = "SV-KB-2016 Microsoft Windows Server 2016 (64-bit)";
  b.read("generate()");
  assert(b.element("emailText").innerHTML.includes("KB6000001"));
  assert(!b.element("emailText").innerHTML.includes("KB6000004"));
});

test("GMUD 1010 WIN/2022 is deduplicated and never creates Server 2012 notices or unrelated KBs", () => {
  const b = browser(true);
  const row = "SRV-SQL 192.0.2.66 WIN/2022 DBA | GERENCIA CLIENTE | GARANTIR INTEGRIDADE";
  b.element("removeDuplicates").checked = true;
  b.element("gmudEmailRaw").value = ["GMUD 1010 - CLIENTE | ATUALIZACOES DE SEGURANCA",
    "Time Command: Executor", "Stop dos servicos de banco de dados", row,
    "Garantir snapshot via Virtualizador", row, "Reboot do servidor", row,
    "START dos servicos de banco de dados", row, "LISTAGEM COMPLETA DE SERVIDORES", row].join("\n");
  b.read("parseGmudEmail(); generateClosure()");
  assert.equal(b.element("schedGmud").value, "1010");
  assert.equal(b.element("input").value, row);
  assert.equal(b.read("processInput().hostnames.length"), 1);
  for (const markup of [b.element("emailText").innerHTML, b.element("closureEmailText").innerHTML, b.read("buildClosureReportHtml()")]) {
    assert(markup.includes("Windows Server 2022"));
    assert(!markup.includes("Windows Server 2012"));
    assert(!markup.includes("Windows Server 2025"));
  }
  assert.equal(b.read('getUnsupportedWindowsServerNotices(processInput().lines).length'), 0);
});

test("same hostname in another customer cannot replace the server identified by IP", () => {
  for (const reverse of [false, true]) {
    const b = browser(true);
    b.element("input").value = "SRV-SQL 192.0.2.66 WIN/2022 DBA";
    const records = [
      { ServerID: "target", HostName: "SRV-SQL", IP: "192.0.2.66", Customer: "TARGET", SO: "Windows Server 2022", Status: "Ligada" },
      { ServerID: "unrelated", HostName: "SRV-SQL", IP: "192.0.2.99", Customer: "OTHER", SO: "Windows Server 2012", Status: "Ligada" }
    ];
    b.read(`isCmdbLoaded = true; cmdbDatabase = ${JSON.stringify(reverse ? records.reverse() : records)}; generate(); generateClosure();`);
    const info = b.read("processInput().activeVMs[0].info");
    assert(info.includes("TARGET"));
    assert(info.includes("192.0.2.66"));
    assert(!b.element("emailText").innerHTML.includes("Windows Server 2012"));
    assert(!b.read("buildClosureReportHtml()").includes("Windows Server 2012"));
  }
});

test("explicit Server 2022 from GMUD wins over stale CMDB OS and records a review warning", () => {
  const b = browser(true);
  b.element("input").value = "SRV-SQL 192.0.2.66 WIN/2022 DBA";
  b.read('isCmdbLoaded = true; cmdbDatabase = [{ServerID:"stale",HostName:"SRV-SQL",IP:"192.0.2.66",SO:"Microsoft Windows Server 2012",Status:"Ligada"}]; generate(); generateClosure();');
  assert(b.read("processInput().activeVMs[0].osConflict").includes("Validar cadastro"));
  assert(b.element("gmudReviewItems").innerHTML.includes("SO informado na GMUD"));
  assert(b.element("emailText").innerHTML.includes("Windows Server 2022"));
  assert(!b.element("emailText").innerHTML.includes("Windows Server 2012"));
  assert(!b.read("buildClosureReportHtml()").includes("Windows Server 2012"));
});

test("ambiguous hostname or mismatched IP never silently selects a different CMDB machine", () => {
  const b = browser(true);
  b.read('isCmdbLoaded = true; cmdbDatabase = [{HostName:"SRV-SQL",IP:"192.0.2.1",SO:"Windows Server 2012",Status:"Ligada"},{HostName:"SRV-SQL",IP:"192.0.2.2",SO:"Windows Server 2012",Status:"Ligada"}];');
  for (const line of ["SRV-SQL WIN/2022", "SRV-SQL 192.0.2.66 WIN/2022"]) {
    b.element("input").value = line;
    assert.equal(b.read("processInput().activeVMs.length"), 0);
    assert.equal(b.read("processInput().unknownVMs.length"), 1);
    b.read("generate()");
    assert(!b.element("emailText").innerHTML.includes("Windows Server 2012"));
  }
});

test("OS formats accept WIN slash years, preserve actual 2012 notices, and do not infer 2012 from a hostname", () => {
  const b = browser();
  for (const year of ["2016", "2019", "2022", "2025"]) {
    for (const format of [`WIN/${year}`, `WIN ${year}`, `WIN${year}`, `Windows Server ${year}`]) {
      assert.equal(b.read(`getOsLabelFromText(${JSON.stringify(format)})`), `Windows Server ${year}`);
    }
  }
  assert.equal(b.read('detectWindowsServer2012("SRV1201 192.0.2.66 WIN/2022")'), false);
  assert.equal(b.read('detectWindowsServer2012("SRV12 192.0.2.66 WIN/2022")'), false);
  assert.equal(b.read('detectWindowsServer2012("SERVER12022")'), false);
  assert.equal(b.read('detectWindowsServer2012("WIN/2012 R2")'), true);
  assert.equal(b.read('getUnsupportedWindowsServerNotices(["WIN/2022", "WIN/2012 R2"]).length'), 1);
});
