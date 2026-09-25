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
assert(html.includes("copyText('windowsHostnameRegex')"), "acao principal deve copiar hostnames Windows");
assert(html.includes("copyText('windowsIpRegex')"), "acao principal deve copiar IPs Windows");
assert(html.includes("copyText('linuxHostnameRegex')"), "acao principal deve copiar hostnames Linux");
assert(html.includes("copyText('linuxIpRegex')"), "acao principal deve copiar IPs Linux");
assert(html.indexOf("Copiar hostnames Windows") < html.indexOf("Copiar só hostnames"), "botoes por SO devem aparecer junto dos botoes principais");
assert(html.indexOf('id="windowsHostnameRegex"') < html.indexOf('id="emailText"'), "resultados Windows/Linux devem aparecer antes do texto de e-mail");
assert(!html.includes('id="combinedRegex"'), "nao deve existir campo misturando hostnames e IPs");
assert(!html.includes("function makeCombined"), "nao deve existir geracao combinada de hostnames e IPs");
assert(html.includes(".container { width:100%; max-width:none;"), "layout deve ocupar toda a largura disponivel");
assert(html.includes('class="regex-grid"'), "resultados finais devem usar grade compacta");
assert(html.includes("grid-template-columns:repeat(2,minmax(0,1fr))"), "resultados gerais separados devem ter duas colunas em telas largas");

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
assert(monitoredAlertEmailHtml.includes("ATENCAO: VMs PRIORITARIAS"));
assert(monitoredAlertEmailHtml.includes("background-color:#fffbeb"));
assert(monitoredAlertEmailHtml.includes("[VM PRIORITARIA / BANCO DE DADOS]"));
assert(monitoredAlertEmailHtml.includes("[VM PRIORITARIA]"));
assert(monitoredAlertEmailHtml.includes("acompanhamento prioritario"));
assert(monitoredAlertEmailHtml.includes("PPCFXPRDDB2"));
assert(monitoredAlertEmailHtml.includes("PPCFXPRDFTPE1"));
assert(monitoredAlertEmailHtml.includes("PPSPFSV1"));

getElement("input").value = [
  "SV-DBS-BARUEL02 Microsoft Windows Server 2022 (64-bit)",
  "rdgw\\.mandic.net.br Microsoft Windows Server 2019 (64-bit)",
  "GER7-PROD01 Microsoft Windows Server 2019 (64-bit)",
  "SV-SQL3 Microsoft Windows Server 2022 (64-bit)",
  "SV-SAP3 Microsoft Windows Server 2022 (64-bit)",
  "ATB-SV-DBP-05 Microsoft Windows Server 2022 (64-bit)"
].join("\n");
sandbox.__generate();
const databaseAlertsHtml = getElement("monitoredVmAlerts").innerHTML;
const databaseAlertEmailHtml = getElement("emailText").innerHTML;
assert(databaseAlertsHtml.includes("Banco de Dados"));
assert(databaseAlertsHtml.includes("SV-DBS-BARUEL02"));
assert(databaseAlertsHtml.includes("rdgw.mandic.net.br"));
assert(databaseAlertsHtml.includes("GER7-PROD01"));
assert(databaseAlertsHtml.includes("SV-SQL3"));
assert(databaseAlertsHtml.includes("SV-SAP3"));
assert(databaseAlertsHtml.includes("ATB-SV-DBP-05"));
assert(!databaseAlertsHtml.includes("<strong>GER7-PROD</strong>"));
assert(databaseAlertEmailHtml.includes("ATENCAO: SERVIDORES DE BANCO DE DADOS"));
assert(databaseAlertEmailHtml.includes("[BANCO DE DADOS]"));
assert(databaseAlertEmailHtml.includes("SV-SQL3"));
assert(databaseAlertEmailHtml.includes("SV-SAP3"));
assert(databaseAlertEmailHtml.includes("ATB-SV-DBP-05"));
assert(databaseAlertEmailHtml.includes('<strong>ATB-SV-DBP-05</strong> <strong style="color:#b91c1c;">[BANCO DE DADOS]</strong>'));
assert(databaseAlertEmailHtml.includes("background-color:#b91c1c"));
assert(databaseAlertEmailHtml.includes("background-color:#fff1f2"));
assert(databaseAlertEmailHtml.includes("acompanhamento prioritario durante toda a GMUD"));

getElement("input").value = [
  "VISA035 Microsoft Windows Server 2016 (64-bit)",
  "VISA034-W Microsoft Windows Server 2022 (64-bit)"
].join("\n");
sandbox.__generate();
const visaThirdWaveAlertsHtml = getElement("monitoredVmAlerts").innerHTML;
const visaThirdWaveEmailHtml = getElement("emailText").innerHTML;
assert(visaThirdWaveAlertsHtml.includes("VISA035"));
assert(visaThirdWaveAlertsHtml.includes("VISA034-W"));
assert(!visaThirdWaveAlertsHtml.includes("<strong>VISA034</strong>"));
assert(visaThirdWaveEmailHtml.includes("[VM PRIORITARIA - 3a ONDA VISA]"));
assert(visaThirdWaveEmailHtml.includes("3a onda VISA: VM prioritaria"));
assert(visaThirdWaveEmailHtml.includes("3a ONDA VISA (2 VMs)"));
assert.strictEqual((visaThirdWaveEmailHtml.match(/3a onda VISA: VM prioritaria/g) || []).length, 1);

getElement("input").value = [
  "WINAPP01 Microsoft Windows Server 2019 (64-bit) 10.10.10.1",
  "SUSEAPP01 SUSE Linux Enterprise 15 10.10.20.1"
].join("\n");
sandbox.__generate();
const windowsHostnameRegex = getElement("windowsHostnameRegex").value;
const windowsIpRegex = getElement("windowsIpRegex").value;
const linuxHostnameRegex = getElement("linuxHostnameRegex").value;
const linuxIpRegex = getElement("linuxIpRegex").value;
const mixedOsEmailHtml = getElement("emailText").innerHTML;
assert(windowsHostnameRegex.includes("WINAPP01"));
assert(!windowsHostnameRegex.includes("10.10.10.1"));
assert(!windowsHostnameRegex.includes("SUSEAPP01"));
assert(windowsIpRegex.includes("10.10.10.1"));
assert(!windowsIpRegex.includes("WINAPP01"));
assert(linuxHostnameRegex.includes("SUSEAPP01"));
assert(!linuxHostnameRegex.includes("10.10.20.1"));
assert(!linuxHostnameRegex.includes("WINAPP01"));
assert(linuxIpRegex.includes("10.10.20.1"));
assert(!linuxIpRegex.includes("SUSEAPP01"));
assert(mixedOsEmailHtml.includes("Windows Server 2019"));
assert(mixedOsEmailHtml.includes("SUSE Linux Enterprise"));
const visaEmailInfo = vm.runInContext('getCustomerEmailVmInfo({ name: "VISA011-B", info: "Cliente: VISA-HYPERATIVA | IP: 10.0.0.1 | OS: Windows Server 2022" })', sandbox);
const regularEmailInfo = vm.runInContext('getCustomerEmailVmInfo({ name: "CLIENTE01", info: "Cliente: OUTRO | IP: 10.0.0.2 | OS: Windows Server 2022" })', sandbox);
assert.strictEqual(visaEmailInfo, "Cliente: VISA-HYPERATIVA | OS: Windows Server 2022");
assert.strictEqual(regularEmailInfo, "Cliente: OUTRO | IP: 10.0.0.2 | OS: Windows Server 2022");
assert.strictEqual(getElement("windowsMachineCount").innerText, 1);
assert.strictEqual(getElement("linuxMachineCount").innerText, 1);
assert(html.includes("tanium_kb_catalog.json"), "deve consultar o catalogo automatico publicado no GitHub");
assert(html.includes('cache: "no-store"'), "deve ignorar cache antigo do catalogo mensal");
assert(html.includes("KB5122882"), "backup local deve conter o KB de setembro do Server 2022");
