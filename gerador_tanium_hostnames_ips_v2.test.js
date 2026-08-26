const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const htmlPath = path.join(__dirname, "gerador_tanium_hostnames_ips_v2.html");
const html = fs.readFileSync(htmlPath, "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

assert(scriptMatch, "HTML deve conter um bloco <script> principal.");

const elements = new Map();
const getElement = (id) => {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      value: "",
      checked: false,
      innerHTML: "",
      innerText: "",
      textContent: "",
      style: {},
      classList: { add() {}, remove() {} },
      addEventListener() {},
      select() {},
      setSelectionRange() {},
      appendChild() {},
      removeChild() {},
    });
  }
  return elements.get(id);
};

const sandbox = {
  console,
  setTimeout() {},
  fetch() { return Promise.reject(new Error("fetch disabled in test")); },
  Blob: function Blob() {},
  URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
  navigator: { clipboard: { writeText() { return Promise.resolve(); }, write() { return Promise.resolve(); } } },
  window: {
    ClipboardItem: function ClipboardItem() {},
    getSelection() { return { removeAllRanges() {}, addRange() {} }; },
  },
  document: {
    getElementById: getElement,
    querySelectorAll() { return []; },
    createElement(tag) {
      const el = getElement(`created-${tag}-${elements.size}`);
      el.click = () => {};
      return el;
    },
    createRange() { return { selectNodeContents() {} }; },
    execCommand() { return true; },
    body: { appendChild() {}, removeChild() {} },
  },
};

let script = scriptMatch[1];
script = script.replace(/generate\(\);\s*loadLatestKBsFromMicrosoft\(\);/, "");

vm.createContext(sandbox);
vm.runInContext(`${script}
this.__suggestKBs = suggestKBs;
this.__generate = generate;
this.__processInput = processInput;
this.__copyKbName = typeof copyKbName === "function" ? copyKbName : undefined;
`, sandbox);

assert.strictEqual(typeof sandbox.__suggestKBs, "function");
assert.strictEqual(typeof sandbox.__generate, "function");
assert.strictEqual(typeof sandbox.__processInput, "function");
assert.strictEqual(typeof sandbox.__copyKbName, "function");

const kbItems = sandbox.__suggestKBs(["VISA011-B Microsoft Windows Server 2022 (64-bit)"]);
assert(kbItems.some(item => item.kb), "entrada Windows Server 2022 deve sugerir KB");
const kbSuggestionHtml = getElement("kbSuggestions").innerHTML;
assert(kbSuggestionHtml.includes("class='kb-copy-btn'"), "sugestao de KB deve exibir botao para copiar KB");
assert(kbSuggestionHtml.includes("copyKbName(this.dataset.kb)"), "botao deve chamar copyKbName com data-kb");
assert(kbSuggestionHtml.includes('data-kb="'), "botao deve carregar o identificador do KB no data-kb");
assert(kbSuggestionHtml.indexOf("Copiar KB") < kbSuggestionHtml.indexOf("Backup Local"), "botao Copiar KB deve ficar antes do selo Backup Local");

const shortServer2012Items = sandbox.__suggestKBs(["LEGADO02 Microsoft Server 2012 x64"]);
assert.strictEqual(shortServer2012Items.length, 0, "Server 2012 escrito de forma curta nao deve receber sugestao automatica de KB");
assert(getElement("kbSuggestions").innerHTML.includes("Windows Server 2012/2012 R2 nao sao mais atualizados no ciclo padrao"));

getElement("input").value = "LEGADO01 Microsoft Windows Server 2012 R2 (64-bit)";
sandbox.__generate();
const server2012EmailHtml = getElement("emailText").innerHTML;
assert(server2012EmailHtml.includes("Windows Server 2012/2012 R2 (sem atualizacao padrao)"));
assert(!server2012EmailHtml.includes("Windows Server / Client (Padr"));
assert(!server2012EmailHtml.includes("Cumulative Security Updates (Tanium Patch)"));

getElement("input").value = [
  "Senhores, boa noite.",
  "Renan Serafim Pires",
  "Enviada (Evidencia: Nao cadastrado no CMDB)",
  "GMUD-Status (Evidencia: Nao cadastrado no CMDB)",
  "PPCFXPRDDB2 Microsoft Windows Server 2022 (64-bit)",
  "PPCFXPRDFTPE1 Microsoft Windows Server 2022 (64-bit)",
  "PPSPFSV1 Microsoft Windows Server 2022 (64-bit)",
  "VISA011-B Microsoft Windows Server 2022 (64-bit)",
  "SV-FORTEMS-ZTNA Ubuntu Linux (64-bit)",
  "10.203.153.46"
].join("\n");
const parsedInput = sandbox.__processInput();
assert.deepStrictEqual(Array.from(parsedInput.hostnames), ["PPCFXPRDDB2", "PPCFXPRDFTPE1", "PPSPFSV1", "VISA011-B", "SV-FORTEMS-ZTNA"]);
assert(parsedInput.ips.includes("10.203.153.46"));

sandbox.__generate();
const monitoredAlertsHtml = getElement("monitoredVmAlerts").innerHTML;
const monitoredAlertEmailHtml = getElement("emailText").innerHTML;
assert(monitoredAlertsHtml.includes("Alertas de VMs monitoradas"));
assert(monitoredAlertEmailHtml.includes("ATENCAO - VMs PRIORITARIAS"));
assert(monitoredAlertEmailHtml.includes("acompanhamento prioritario"));
assert(monitoredAlertEmailHtml.includes("PPCFXPRDDB2"));
assert(monitoredAlertEmailHtml.includes("PPCFXPRDFTPE1"));
assert(monitoredAlertEmailHtml.includes("PPSPFSV1"));
