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

test("evidence correlates each table row without validating prefix hosts or counting unrelated successes", () => {
  const b = browser(true);
  b.element("input").value = "VM-APP01 WIN/2022\nVM-APP010 WIN/2022\nVM-APP02 WIN/2022";
  b.read(`closureEvidenceFiles=[{type:"image/png",ocrAnalyzed:true,ocrText:"VM-APP010.example.local Complete All Patches Applied\\nVM-OTHER03 Complete All Patches Applied\\nVM-OTHER04 Complete All Patches Applied"}];generateClosure();`);
  const servers = b.read("getClosurePayload().servers");
  assert.equal(servers.find(s => s.name === "VM-APP010").result, "Complete, All Patches Applied");
  for (const name of ["VM-APP01", "VM-APP02"]) assert.notEqual(servers.find(s => s.name === name).evidenceState, "evidenced");
  assert(b.read("buildClosureReportHtml()").includes("Nao evidenciado no encerramento"));
});

test("contradictory evidence for one VM requires review without borrowing the next VM status", () => {
  const b = browser(true);
  b.element("input").value = "VM-APP01 WIN/2022\nVM-APP02 WIN/2022";
  b.read(`closureEvidenceFiles=[{type:"image/png",ocrAnalyzed:true,ocrText:"VM-APP01 Complete All Patches Applied\\nVM-APP02 Pending Restart\\nVM-APP01 Failed"}];generateClosure();`);
  const servers = b.read("getClosurePayload().servers");
  assert.match(servers[0].result, /divergentes/);
  assert.match(servers[1].result, /Pending Restart/);
  assert(!b.read("getClosurePayload().allServersEvidencedSuccessfully"));
});

test("PDF native text keeps spatial rows and avoids unnecessary OCR", async () => {
  const b = browser();
  let destroyed = false;
  const item = (str, x, y) => ({str,transform:[1,0,0,1,x,y],width:100,height:10});
  b.context.window.pdfjsLib = {getDocument: () => ({promise: Promise.resolve({numPages:1,
    getPage: async () => ({getTextContent: async () => ({items:[item("VM-APP02",10,80),item("Pending Restart",300,80),item("Complete All Patches Applied",300,100),item("VM-APP01",10,100)]})}),
    destroy: async () => {destroyed = true;}
  })})};
  b.context.pdfFixture = {file:{arrayBuffer:async () => new ArrayBuffer(1)}};
  const text = await b.read("extractPdfEvidenceText(pdfFixture)");
  assert.equal(text, "VM-APP01 Complete All Patches Applied\nVM-APP02 Pending Restart");
  assert(destroyed);
});

test("a failed evidence file does not stop later files or report overall success", async () => {
  const b = browser(true);
  b.element("input").value = "VM-APP01 WIN/2022";
  b.read(`closureEvidenceFiles=[{name:"bad.pdf",type:"application/pdf"},{name:"good.pdf",type:"application/pdf"}];extractPdfEvidenceText=async file=>{if(file.name==="bad.pdf")throw Error("Falha simulada");return "VM-APP01 Complete All Patches Applied";};`);
  await b.read("analyzeClosureEvidenceStatus()");
  assert.equal(b.read("closureEvidenceFiles[1].ocrAnalyzed"), true);
  assert.equal(b.read("closureEvidenceFiles[0].ocrError"), "Falha simulada");
  assert.equal(b.element("closureStatus").value, "Concluída com ressalvas");
  assert.match(b.element("closureOcrFeedback").textContent, /1 falha\(s\).*1\/1 VM/);
  assert.match(b.element("closureEvidenceList").innerHTML, /Falha simulada/);
});

test("image OCR retries sparse segmentation when the first pass misses scope rows", async () => {
  const b = browser(true);
  b.element("input").value = "VM-APP01 WIN/2022";
  b.context.modes = [];
  b.read(`closureEvidenceFiles=[{name:"table.png",type:"image/png",dataUrl:"source"}];runTesseractRecognize=async (source,progress,mode=6)=>{modes.push(mode);return {data:{text:mode===6?"unreadable":"VM-APP01 Complete All Patches Applied"}};};`);
  await b.read("analyzeClosureEvidenceStatus()");
  assert.deepEqual(b.context.modes, [6,11]);
  assert.equal(b.read("getClosurePayload().servers[0].result"), "Complete, All Patches Applied");
});

test("Installing tables accept letter-only SVR names and unique S/5 and transposed OCR aliases", () => {
  const b = browser(true);
  b.element("input").value = "SVR-SE-HMG WIN/2016\nSVR-APP-WAP WIN/2016\nSVR-DB-HMG WIN/2022";
  b.read(`closureEvidenceFiles=[{type:"image/png",ocrAnalyzed:true,ocrText:"SVR-5E-HMG.example.local Windows Server 2016 Installing Installing Yes\\nSRV-APP-WAP.example.local Windows Server 2016 Installing Installing Yes\\nSVR-DB-HMG.example.local Windows Server 2022 Installing Installing Yes"}];generateClosure();`);
  const servers = b.read("getClosurePayload().servers");
  assert.equal(servers.length,3);
  assert(servers.every(s=>s.result === "Installing - instalacao em andamento"));
  assert(!b.read("getClosurePayload().allServersEvidencedSuccessfully"));
  assert.equal(b.read("getClosurePayload().status"), "Concluída com ressalvas");
  assert(b.element("closureEmailText").innerHTML.includes("Installing - instalacao em andamento"));
  assert(b.read("buildClosureReportHtml()").includes("Installing - instalacao em andamento"));
});

test("OCR row reconstruction does not duplicate word sources or merge adjacent short rows", () => {
  const b = browser();
  const words = [{text:"VM-APP01",bbox:{x0:10,y0:10,y1:20}}, {text:"Complete",bbox:{x0:100,y0:10,y1:20}},
    {text:"VM-APP02",bbox:{x0:10,y0:21,y1:31}}, {text:"Installing",bbox:{x0:100,y0:21,y1:31}}];
  b.context.ocrFixture = {data:{words,blocks:[{paragraphs:[{lines:[{words}]}]}]}};
  assert.equal(b.read("buildStructuredOcrText(ocrFixture)"), "VM-APP01 Complete\nVM-APP02 Installing");
});

test("one file hostname cannot borrow a status from a separate evidence file", () => {
  const b = browser();
  b.read(`closureEvidenceFiles=[{type:"image/png",ocrText:"VM-APP01"},{type:"image/png",ocrText:"Complete All Patches Applied"}];`);
  const context = b.read('getServerEvidenceContext(getClosureEvidenceText(), {name:"VM-APP01"}, [{name:"VM-APP01"}])');
  assert.equal(context,"VM-APP01");
  assert.equal(b.read(`inferClosureResultFromEvidenceContext(${JSON.stringify(context)})`), "");
});

test("Incomplete is never interpreted as Complete or successful closure", () => {
  const b = browser(true);
  b.element("input").value = "VM-APP01 WIN/2022";
  b.read('closureEvidenceFiles=[{type:"image/png",ocrAnalyzed:true,ocrText:"VM-APP01 Incomplete"}];');
  assert.equal(b.read("getClosurePayload().servers[0].result"), "Nao concluido na evidencia");
  assert.equal(b.read("getClosurePayload().allServersEvidencedSuccessfully"),false);
  assert.equal(b.read("getClosurePayload().status"), "Concluída com ressalvas");
});

test("a merged OCR row with two scope hostnames cannot validate either VM", () => {
  const b = browser(true);
  b.element("input").value = "VM-APP01 WIN/2022\nVM-APP02 WIN/2022";
  b.read('closureEvidenceFiles=[{type:"image/png",ocrAnalyzed:true,ocrText:"VM-APP01 VM-APP02 Complete All Patches Applied"}];');
  assert(b.read('getClosurePayload().servers.every(s=>s.evidenceState === "ocr_unmatched")'));
});

test("a replaced attachment set cannot receive stale OCR results and overlapping analyses are ignored", async () => {
  const b = browser();
  let release;
  b.context.delayedText = new Promise(resolve => {release=resolve;});
  b.read('closureEvidenceFiles=[{name:"first.pdf",type:"application/pdf"}];extractPdfEvidenceText=()=>delayedText;');
  const first = b.read("analyzeClosureEvidenceStatus()");
  assert.equal(await b.read("analyzeClosureEvidenceStatus()"),null);
  b.element("closureStatus").value = "UNCHANGED";
  b.read('closureEvidenceFiles=[{name:"replacement.pdf",type:"application/pdf"}];');
  release("VM-APP01 Complete All Patches Applied");
  assert.equal(await first,null);
  assert.equal(b.read("closureEvidenceFiles[0].ocrText"),undefined);
  assert.equal(b.element("closureStatus").value,"UNCHANGED");
  assert.equal(b.read("closureOcrBusy"),false);
});

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

test("any SQL hostname is automatically a database across alerts, scope, emails and PDF", () => {
  for (const name of ["SRV-SQL", "APPSQL01", "MSSQL-02", "postgresql01", "srv-sql.example.test"]) {
    const b = browser(true);
    b.element("input").value = `${name} 192.0.2.66 WIN/2022`;
    b.read("generate(); generateClosure()");
    assert.equal(b.read("getMonitoredVmAlerts(processInput()).length"), 1);
    assert(b.element("monitoredVmAlerts").innerHTML.includes("Banco de Dados"));
    assert(b.element("scopeTableBody").innerHTML.includes("Banco de dados"));
    for (const markup of [b.element("emailText").innerHTML, b.element("closureEmailText").innerHTML, b.read("buildClosureReportHtml()")]) {
      assert(markup.includes("[BANCO DE DADOS]"), `${name} must be highlighted`);
    }
    b.element("input").value = "";
    b.read("generate()");
    assert.equal(b.read("getMonitoredVmAlerts(processInput()).length"), 0);
  }
});

test("SQL rule is restricted to VM hostname, not observations or domain suffix", () => {
  const b = browser(true);
  for (const line of ["SV-WEB-01 192.0.2.66 WIN/2022 OBS: validar servico SQL", "SV-WEB-01.sql.example 192.0.2.66 WIN/2022"]) {
    b.element("input").value = line;
    b.read("generate(); generateClosure()");
    assert.equal(b.read("getMonitoredVmAlerts(processInput()).length"), 0);
    assert(!b.element("emailText").innerHTML.includes("[BANCO DE DADOS]"));
  }
  assert.equal(b.read('getMonitoredVmAlertByName("rdgw.other.example")'), null);
});

test("SQL classification preserves configured priority and never duplicates a registered database", () => {
  const b = browser(true);
  b.read('MONITORED_VM_ALERTS.push({name:"PRIORITY-SQL01",type:"VM prioritaria",message:"Acompanhamento prioritario"})');
  b.element("input").value = "PRIORITY-SQL01 192.0.2.66 WIN/2022";
  b.read("generate()");
  assert(b.element("emailText").innerHTML.includes("[VM PRIORITARIA / BANCO DE DADOS]"));
  assert(b.read('getMonitoredVmAlertByName("PRIORITY-SQL01").message').includes("Acompanhamento prioritario"));
  b.element("input").value = "SV-SQL3 192.0.2.67 WIN/2022\nsv-sql3.example.test 192.0.2.67 WIN/2022";
  assert.equal(b.read("getMonitoredVmAlerts(processInput()).length"), 1);
});

test("SQL VM from CMDB is highlighted even when powered off and outside update scope", () => {
  const b = browser(true);
  b.element("onlyPoweredOn").checked = true;
  b.element("input").value = "SRV-SQL 192.0.2.66 WIN/2022";
  b.read('isCmdbLoaded = true; cmdbDatabase = [{HostName:"SRV-SQL.example.test",IP:"192.0.2.66",SO:"Windows Server 2022",Status:"Desligada"}]; generate()');
  assert(b.element("emailText").innerHTML.includes("[BANCO DE DADOS]"));
  assert(b.element("scopeTableBody").innerHTML.includes("Banco de dados"));
});

test("duplicate CMDB records always select the powered-on VM regardless of order or input style", () => {
  const on = {ServerID:"on",HostName:"VM-DUP01.example.test",IP:"192.0.2.114",Customer:"TEST",SO:"Windows Server 2022",Status:"Ligada"};
  const duplicates = [
    {...on,ServerID:"unknown",Status:"Desconhecido"},
    {...on,ServerID:"old1",IP:"-",Status:"Desligada"},
    {...on,ServerID:"old2",IP:"-",Status:"Desligada"},
    on
  ];
  for (const records of [duplicates, [...duplicates].reverse()]) {
    for (const line of ["VM-DUP01 192.0.2.114 WIN/2022", "VM-DUP01 WIN/2022", "192.0.2.114"]) {
      const b = browser(true);
      b.element("onlyPoweredOn").checked = true;
      b.element("input").value = `${line}\n${line}`;
      b.read(`isCmdbLoaded = true; cmdbDatabase = ${JSON.stringify(records)}; generate(); generateClosure();`);
      assert.equal(b.read("processInput().activeVMs.length"), 1);
      assert.equal(b.read("processInput().offlineVMs.length"), 0);
      assert.equal(b.read("processInput().unknownVMs.length"), 0);
      assert.equal(b.read("processInput().hostnames.length"), 1);
      assert.equal(b.read("processInput().ips[0]"), "192.0.2.114");
      assert.equal(b.read('getScopeInfoValue(processInput().activeVMs[0].info, "IP")'), "192.0.2.114");
      assert(b.element("cmdbCopyResult").value.includes("Status: Ligada"));
      assert(!b.element("cmdbCopyResult").value.includes("Status: Desligada"));
      assert(b.element("windowsHostnameRegex").value.includes("VM-DUP01"));
      assert(b.element("scopeTableBody").innerHTML.includes("Ligada"));
      assert(!b.element("scopeTableBody").innerHTML.includes("Desligada"));
      assert(b.element("emailText").innerHTML.includes("VM-DUP01"));
      assert(b.element("closureEmailText").innerHTML.includes("VM-DUP01"));
      assert(b.read("buildClosureReportHtml()").includes("VM-DUP01"));
    }
  }
});

test("restored ON alias overrides retired original with same IP and customer in every output", () => {
  const original = {ServerID:"old",HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",Status:"Descontinuada",SO:"Windows Server 2019"};
  const on = {...original,ServerID:"restored",HostName:"VM-DUP01_R_24SET",Status:"Ligada"};
  const records = [original, {...original,ServerID:"off",HostName:"VM-DUP01-OLD",IP:null,Status:"Desligada"}, on];
  for (const ordered of [records, [...records].reverse()]) {
    for (const line of ["VM-DUP01", "VM-DUP01 192.0.2.114 WIN/2019", "192.0.2.114"]) {
      const b = browser(true);
      b.element("input").value = line;
      b.read(`isCmdbLoaded=true;cmdbDatabase=${JSON.stringify(ordered)};generate();generateClosure();`);
      assert.equal(b.read("processInput().activeVMs.length"), 1);
      assert.equal(b.read("processInput().unknownVMs.length"), 0);
      assert(b.element("emailText").innerHTML.includes(on.HostName));
      assert(!b.element("emailText").innerHTML.includes("Descontinuada"));
      assert(b.element("cmdbCopyResult").value.includes("Status: Ligada"));
      assert(b.element("closureEmailText").innerHTML.includes(on.HostName));
      assert(b.read("buildClosureReportHtml()").includes(on.HostName));
    }
  }
  for (const unsafe of [{...on,Customer:"OTHER"}, {...on,IP:"192.0.2.115"}, {...on,HostName:"VM-OTHER01"}]) {
    const b = browser();
    b.element("input").value = "VM-DUP01 192.0.2.114";
    b.read(`isCmdbLoaded=true;cmdbDatabase=${JSON.stringify([original,unsafe])};`);
    assert.equal(b.read("processInput().activeVMs.length"), 0);
  }
});

test("multiple powered-on snapshots with the same identity collapse to one deterministic VM", () => {
  const b = browser();
  const records = [
    {ServerID:"a",HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",Status:" Ligada "},
    {ServerID:"b",HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",Status:"LIGADA",SO:"Windows Server 2022"}
  ];
  b.element("input").value = "VM-DUP01 192.0.2.114";
  for (const ordered of [records, [...records].reverse()]) {
    b.read(`isCmdbLoaded = true; cmdbDatabase = ${JSON.stringify(ordered)};`);
    assert.equal(b.read("processInput().activeVMs.length"), 1);
    assert(b.read("processInput().activeVMs[0].info").includes("Windows Server 2022"));
  }
});

test("powered-on preference never crosses customer boundaries or replaces an explicitly different IP", () => {
  const b = browser();
  const off = {HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",Status:"Desligada"};
  const on = {...off,IP:"192.0.2.115",Status:"Ligada"};
  b.read(`isCmdbLoaded = true; cmdbDatabase = ${JSON.stringify([off,on])};`);
  b.element("input").value = "VM-DUP01 192.0.2.114";
  assert.equal(b.read("processInput().activeVMs.length"), 0);
  assert.equal(b.read("processInput().offlineVMs.length"), 1);
  b.read(`cmdbDatabase = ${JSON.stringify([off,{...on,Customer:"OTHER"}])};`);
  b.element("input").value = "VM-DUP01";
  assert.equal(b.read("processInput().activeVMs.length"), 0);
  assert.equal(b.read("processInput().unknownVMs.length"), 1);
});

test("only powered-off duplicates remain powered off, without inventing an active VM", () => {
  const b = browser();
  b.element("onlyPoweredOn").checked = true;
  b.element("input").value = "VM-DUP01 192.0.2.114";
  b.read('isCmdbLoaded = true; cmdbDatabase = [{HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",Status:"Desligada"},{HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",Status:"Desligada"}];');
  assert.equal(b.read("processInput().activeVMs.length"), 0);
  assert.equal(b.read("processInput().offlineVMs.length"), 1);
  assert.equal(b.read("processInput().hostnames.length"), 0);
});

test("ON and poweredOn override discontinued/off duplicates in the opening email", () => {
  for (const state of ["ON", " on ", "PoweredOn", "Powered On", "Ligado"]) {
    const b = browser(true);
    b.element("onlyPoweredOn").checked = true;
    b.element("input").value = "VM-DUP01 192.0.2.114 WIN/2022";
    const record = {HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",SO:"Windows Server 2022"};
    b.read(`isCmdbLoaded = true; cmdbDatabase = ${JSON.stringify([{...record,ServerID:"old",Status:"Descontinuada"},{...record,ServerID:"on",Status:state}])}; generate();`);
    assert.equal(b.read("processInput().activeVMs.length"), 1);
    assert.equal(b.read("processInput().unknownVMs.length"), 0);
    const html = b.element("emailText").innerHTML;
    assert(html.includes("Servidores LIGADOS (Patches"));
    assert(!html.includes("Servidores DESLIGADOS"));
    assert(!html.includes("Descontinuada"));
    assert(!html.includes("status não confirmado"));
    assert(b.element("cmdbCopyResult").value.includes("Status: Ligada"));
  }
});

test("missing and discontinued VMs are pending validation, never labelled powered off", () => {
  const b = browser(true);
  b.element("onlyPoweredOn").checked = true;
  b.element("input").value = "VM-MISSING01 192.0.2.1 WIN/2022\nVM-RETIRED01 192.0.2.2 WIN/2022";
  b.read('isCmdbLoaded = true; cmdbDatabase = [{HostName:"VM-RETIRED01",IP:"192.0.2.2",Status:"Descontinuada"}]; generate();');
  const html = b.element("emailText").innerHTML;
  assert(!html.includes("Servidores DESLIGADOS"));
  assert(!html.includes("Não serão atualizados"));
  const pending = html.split("Servidores com status não confirmado")[1];
  assert(pending.includes("VM-MISSING01"));
  assert(pending.includes("VM-RETIRED01"));
});

test("opening email separates confirmed powered-off VMs from unconfirmed records", () => {
  const b = browser(true);
  b.element("input").value = "VM-ON01 192.0.2.1 WIN/2022\nVM-OFF01 192.0.2.2 WIN/2022\nVM-MISSING01 192.0.2.3 WIN/2022";
  b.read('isCmdbLoaded = true; cmdbDatabase = [{HostName:"VM-ON01",IP:"192.0.2.1",Status:"ON"},{HostName:"VM-OFF01",IP:"192.0.2.2",Status:"OFF"}]; generate();');
  const html = b.element("emailText").innerHTML;
  const active = html.split("Servidores DESLIGADOS")[0];
  const off = html.split("Servidores DESLIGADOS")[1].split("Servidores com status não confirmado")[0];
  const pending = html.split("Servidores com status não confirmado")[1];
  assert(active.includes("VM-ON01"));
  assert(off.includes("VM-OFF01"));
  assert(!off.includes("VM-ON01"));
  assert(!off.includes("VM-MISSING01"));
  assert(pending.includes("VM-MISSING01"));
});

test("a resolved ON VM does not remain duplicated as unknown from an earlier hostname-only line", () => {
  const b = browser(true);
  const record = {HostName:"VM-DUP01",IP:"192.0.2.114",Customer:"TEST",Status:"ON",SO:"Windows Server 2022"};
  b.element("input").value = "VM-DUP01\nVM-DUP01 192.0.2.114 WIN/2022";
  b.read(`isCmdbLoaded = true; cmdbDatabase = ${JSON.stringify([record,{...record,IP:"192.0.2.115",Customer:"OTHER"}])}; generate();`);
  assert.equal(b.read("processInput().activeVMs.length"), 1);
  assert.equal(b.read("processInput().unknownVMs.length"), 0);
  assert(!b.element("emailText").innerHTML.includes("status não confirmado"));
  b.element("input").value += "\nVM-DUP01 192.0.2.199 WIN/2022";
  assert.equal(b.read("processInput().unknownVMs.length"), 1);
});
