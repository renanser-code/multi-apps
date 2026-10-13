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

function browser() {
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
  vm.runInContext("generate = generateClosure = updateScriptPreview = renderServerKbLookup = () => {};", context);
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
  assert(urls[0].startsWith("https://raw.githubusercontent.com/renanser-code/multi-apps/main/tanium_kb_catalog.json?t="));
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
