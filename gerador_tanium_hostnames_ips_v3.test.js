const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const htmlPath = path.join(__dirname, "gerador_tanium_hostnames_ips_v3.html");
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
  Blob: function Blob() {},
  URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
  navigator: { clipboard: { writeText() { return Promise.resolve(); }, write() { return Promise.resolve(); } } },
  window: {
    ClipboardItem: function ClipboardItem() {},
    getSelection() { return { removeAllRanges() {}, addRange() {} }; },
    open() {
      return {
        document: { open() {}, write() {}, close() {} },
        focus() {},
        print() {},
      };
    },
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
script = script.replace(/generate\(\);\s*(?:generateClosure\(\);\s*)?updateScriptPreview\(\);\s*loadLatestKBsFromMicrosoft\(\);/, "");

vm.createContext(sandbox);
vm.runInContext(`${script}\nthis.__buildKbCatalogFromMsrc = buildKbCatalogFromMsrc;\nthis.__suggestKBs = suggestKBs;\nthis.__generate = generate;\nthis.__processInput = processInput;\nthis.__findHostname = findHostname;\nthis.__copyKbName = typeof copyKbName === "function" ? copyKbName : undefined;\nthis.__setKbCatalog = (catalog) => { KB_CATALOG = catalog; };\nthis.__generateClosure = typeof generateClosure === "function" ? generateClosure : undefined;\nthis.__buildClosureReportHtml = typeof buildClosureReportHtml === "function" ? buildClosureReportHtml : undefined;\nthis.__inferClosureStatusFromEvidenceText = typeof inferClosureStatusFromEvidenceText === "function" ? inferClosureStatusFromEvidenceText : undefined;\nthis.__analyzeClosureEvidenceStatus = typeof analyzeClosureEvidenceStatus === "function" ? analyzeClosureEvidenceStatus : undefined;\nthis.__enrichEvidenceTextWithFuzzyServerAliases = typeof enrichEvidenceTextWithFuzzyServerAliases === "function" ? enrichEvidenceTextWithFuzzyServerAliases : undefined;\nthis.__reconcileClosureInferenceWithScope = typeof reconcileClosureInferenceWithScope === "function" ? reconcileClosureInferenceWithScope : undefined;\nthis.__setClosureEvidenceFiles = (files) => { closureEvidenceFiles = files; };`, sandbox);

assert.strictEqual(typeof sandbox.__buildKbCatalogFromMsrc, "function");
assert.strictEqual(typeof sandbox.__suggestKBs, "function");
assert.strictEqual(typeof sandbox.__generate, "function");
assert.strictEqual(typeof sandbox.__processInput, "function");
assert.strictEqual(typeof sandbox.__findHostname, "function");
assert.strictEqual(typeof sandbox.__copyKbName, "function");
assert.strictEqual(typeof sandbox.__generateClosure, "function");
assert.strictEqual(typeof sandbox.__buildClosureReportHtml, "function");
assert.strictEqual(typeof sandbox.__inferClosureStatusFromEvidenceText, "function");
assert.strictEqual(typeof sandbox.__analyzeClosureEvidenceStatus, "function");
assert.strictEqual(typeof sandbox.__enrichEvidenceTextWithFuzzyServerAliases, "function");
assert.strictEqual(typeof sandbox.__reconcileClosureInferenceWithScope, "function");
assert(html.includes("copyText('windowsHostnameRegex')"), "acao principal deve copiar hostnames Windows");
assert(html.includes("copyText('windowsIpRegex')"), "acao principal deve copiar IPs Windows");
assert(html.includes("copyText('linuxHostnameRegex')"), "acao principal deve copiar hostnames Linux");
assert(html.includes("copyText('linuxIpRegex')"), "acao principal deve copiar IPs Linux");
assert(html.indexOf("Copiar hostnames Windows") < html.indexOf("Copiar só hostnames"), "botoes por SO devem aparecer junto dos botoes principais");
assert(html.indexOf('id="windowsHostnameRegex"') < html.indexOf('id="emailText"'), "resultados Windows/Linux devem aparecer antes do texto de e-mail");
assert(!html.includes('id="combinedRegex"'), "nao deve existir campo misturando hostnames e IPs");
assert(!html.includes("function makeCombined"), "nao deve existir geracao combinada de hostnames e IPs");
assert(html.includes(".container { width:100%; max-width:none;"), "layout deve ocupar toda a largura disponivel");
assert(html.includes('class="workflow-grid"'), "parser e agendador devem usar grade compacta");
assert(html.includes('class="communication-grid"'), "e-mails de inicio e encerramento devem usar grade compacta");
assert(html.includes('class="communication-left"'), "resultados finais devem ocupar o espaco abaixo do e-mail inicial");
assert(html.includes(".communication-left .regex-grid { flex:1; grid-template-columns:1fr;"), "resultados finais devem ficar empilhados na coluna esquerda");
assert(html.includes('class="regex-grid"'), "resultados finais devem usar grade compacta");
assert(html.includes("grid-template-columns:repeat(2,minmax(0,1fr))"), "resultados gerais separados devem ter duas colunas em telas largas");
assert(html.includes("align-items:stretch"), "paineis paralelos devem preencher toda a altura disponivel");
assert(html.includes("grid-template-rows:repeat(2,minmax(0,1fr))"), "resultados da coluna esquerda devem preencher o espaco vertical");

const baseCatalog = {
  "2016": { kb: "KB0000001", name: "old 2016" },
  "2019": { kb: "KB0000002", name: "old 2019" },
  "2022": { kb: "KB0000003", name: "old 2022" },
};

const sampleMsrc = {
  DocumentTracking: { Identification: { ID: { Value: "2026-Aug" } } },
  ProductTree: {
    Branch: [
      {
        Type: 0,
        Name: "Microsoft",
        Items: [
          {
            Type: 1,
            Name: "Windows",
            Items: [
              { ProductID: "11923", Value: "Windows Server 2022" },
              { ProductID: "11924", Value: "Windows Server 2022 (Server Core installation)" },
              { ProductID: "12436", Value: "Windows Server 2025" },
              { ProductID: "12437", Value: "Windows Server 2025 (Server Core installation)" },
              { ProductID: "11571", Value: "Windows Server 2019" },
              { ProductID: "10816", Value: "Windows Server 2016" },
              { ProductID: "12079-11923", Value: "Microsoft .NET Framework 3.5 AND 4.8.1 on Windows Server 2022" },
              { ProductID: "12079-12436", Value: "Microsoft .NET Framework 3.5 AND 4.8.1 on Windows Server 2025" },
              { ProductID: "12097", Value: "Windows 10 Version 22H2 for x64-based Systems" },
              { ProductID: "12243", Value: "Windows 11 Version 23H2 for x64-based Systems" },
            ],
          },
        ],
      },
    ],
  },
  Vulnerability: [
    {
      Remediations: [
        { Description: { Value: "5120242" }, ProductID: ["11923", "11924"], Type: 2, SubType: "Security Update", FixedBuild: "10.0.20348.5499" },
        { Description: { Value: "5123303" }, ProductID: ["11923", "11924"], Type: 2, SubType: "Security Update", FixedBuild: "10.0.20348.5499" },
        { Description: { Value: "5120229" }, ProductID: ["11923", "11924"], Type: 2, SubType: "Security Hotpatch Update" },
        { Description: { Value: "5120714" }, ProductID: ["12079-11923"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120233" }, ProductID: ["12436", "12437"], Type: 2, SubType: "Security Update", FixedBuild: "10.0.26100.33296" },
        { Description: { Value: "5094125" }, ProductID: ["12436", "12437"], Type: 2, SubType: "Security Update", FixedBuild: "10.0.26100.32995" },
        { Description: { Value: "5120708" }, ProductID: ["12079-12436"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120238" }, ProductID: ["11571"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120418" }, ProductID: ["10816"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120249" }, ProductID: ["12097"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120240" }, ProductID: ["12243"], Type: 2, SubType: "Security Update" },
        { URL: "https://support.microsoft.com/help/5120242", ProductID: ["11923"], Type: 3, SubType: "5120242" },
        { Description: { Value: "5120233" }, URL: "https://support.microsoft.com/help/5120233", ProductID: ["12436"], Type: 3, SubType: "5120233" },
        { Description: { Value: "5120238" }, URL: "https://support.microsoft.com/help/5120238", ProductID: ["11571"], Type: 3, SubType: "5120238" },
        { Description: { Value: "5120418" }, URL: "https://support.microsoft.com/help/5120418", ProductID: ["10816"], Type: 3, SubType: "5120418" },
        { Description: { Value: "5120249" }, URL: "https://support.microsoft.com/help/5120249", ProductID: ["12097"], Type: 3, SubType: "5120249" },
        { Description: { Value: "5120240" }, URL: "https://support.microsoft.com/help/5120240", ProductID: ["12243"], Type: 3, SubType: "5120240" },
      ],
    },
  ],
};

const catalog = sandbox.__buildKbCatalogFromMsrc(sampleMsrc, baseCatalog, "2026-Aug");
const catalog2022 = Array.isArray(catalog["2022"]) ? catalog["2022"] : [catalog["2022"]];
const catalog2025 = Array.isArray(catalog["2025"]) ? catalog["2025"] : [catalog["2025"]];

assert(catalog2022.some(item => item.kb === "KB5120242"));
assert(!catalog2022.some(item => item.kb === "KB5123303"));
assert(!catalog2022.some(item => item.kb === "KB5120714"));
assert(!catalog2022.some(item => item.kb === "KB5120705"));
assert(catalog2025.some(item => item.kb === "KB5120233"));
assert(!catalog2025.some(item => item.kb === "KB5120708"));
assert(!catalog2025.some(item => item.kb === "KB5094125"));
assert.strictEqual(catalog["2019"].kb, "KB5120238");
assert.strictEqual(catalog["2016"].kb, "KB5120418");
assert.strictEqual(catalog["10"].kb, "KB5120249");
assert.strictEqual(catalog["11"].kb, "KB5120240");
assert.match(catalog2022[0].name, /August 2026|2026-Aug/);

sandbox.__setKbCatalog(catalog);
const genericServerItems = sandbox.__suggestKBs(["Aplicar patch em servidores Windows Server x64"]);
assert(genericServerItems.some(item => item.kb === "KB5120233"), "fallback Windows Server deve incluir Server 2025");
assert(!genericServerItems.some(item => item.kb === "KB5123303"), "fallback Windows Server nao deve incluir security update avulso");
assert(!genericServerItems.some(item => item.name.includes(".NET Framework")), "fallback Windows Server nao deve incluir .NET Framework");
const kbSuggestionHtml = getElement("kbSuggestions").innerHTML;
assert(kbSuggestionHtml.includes("class='kb-copy-btn'"), "sugestao de KB deve exibir botao para copiar KB");
assert(kbSuggestionHtml.includes("copyKbName(this.dataset.kb)"), "botao deve chamar copyKbName com data-kb");
assert(kbSuggestionHtml.includes('data-kb="KB5120233"'), "botao deve carregar o identificador do KB no data-kb");
assert(kbSuggestionHtml.indexOf("Copiar KB") < kbSuggestionHtml.indexOf("Backup Local"), "botao Copiar KB deve ficar antes do selo Backup Local");

const catalogNameItems = sandbox.__suggestKBs(["Microsoft server operating system version 24H2 for x64-based Systems"]);
assert(catalogNameItems.some(item => item.kb === "KB5120233"), "nome do Microsoft Update Catalog 24H2 deve mapear para Server 2025");

const server2012Items = sandbox.__suggestKBs(["LEGADO01 Microsoft Windows Server 2012 R2 (64-bit)"]);
assert.strictEqual(server2012Items.length, 0, "Windows Server 2012/R2 nao deve receber sugestao automatica de KB");
assert(getElement("kbSuggestions").innerHTML.includes("Windows Server 2012/2012 R2 nao sao mais atualizados no ciclo padrao"));
assert(getElement("kbSuggestions").innerHTML.includes("10/10/2023"));
assert(getElement("kbSuggestions").innerHTML.includes("13/10/2026"));

const shortServer2012Items = sandbox.__suggestKBs(["LEGADO02 Microsoft Server 2012 x64"]);
assert.strictEqual(shortServer2012Items.length, 0, "Server 2012 escrito de forma curta nao deve receber sugestao automatica de KB");
assert(getElement("kbSuggestions").innerHTML.includes("Windows Server 2012/2012 R2 nao sao mais atualizados no ciclo padrao"));

getElement("input").value = "LEGADO01 Microsoft Windows Server 2012 R2 (64-bit)";
sandbox.__generate();
const server2012EmailHtml = getElement("emailText").innerHTML;
assert(server2012EmailHtml.includes("Sistemas operacionais sem suporte padrao"));
assert(server2012EmailHtml.includes("Windows Server 2012/2012 R2 nao sao mais atualizados no ciclo padrao"));
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

getElement("input").value = [
  "PPCFXPRDDB2 Microsoft Windows Server 2022 (64-bit)",
  "PPCFXPRDFTPE1 Microsoft Windows Server 2022 (64-bit)",
  "PPSPFSV1 Microsoft Windows Server 2022 (64-bit)"
].join("\n");
sandbox.__generate();
const monitoredAlertsHtml = getElement("monitoredVmAlerts").innerHTML;
const monitoredAlertEmailHtml = getElement("emailText").innerHTML;
assert(monitoredAlertsHtml.includes("Alertas de VMs monitoradas"));
assert(monitoredAlertsHtml.includes("PPCFXPRDDB2"));
assert(monitoredAlertsHtml.includes("PPCFXPRDFTPE1"));
assert(monitoredAlertsHtml.includes("PPSPFSV1"));
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
assert.strictEqual(getElement("windowsMachineCount").innerText, 1);
assert.strictEqual(getElement("linuxMachineCount").innerText, 1);

getElement("schedGmud").value = "GMUD-TESTE";
getElement("input").value = [
  "VISA011-B Microsoft Windows Server 2022 (64-bit)",
  "VISA029-1 Microsoft Windows Server 2016 (64-bit)",
  "VISA050-X Microsoft Windows Server 2022 (64-bit)"
].join("\n");
sandbox.__generate();
const emailHtml = getElement("emailText").innerHTML;

assert(emailHtml.includes("KB5120242"), "email deve citar cumulativo do Windows Server 2022");
assert(emailHtml.includes("KB5120418"), "email deve citar cumulativo do Windows Server 2016");
assert(!emailHtml.includes("KB5123303"), "email nao deve citar security update avulso");
assert(!emailHtml.includes("KB5120714"), "email nao deve citar .NET Framework 4.8.1");
assert(!emailHtml.includes("KB5120705"), "email nao deve citar .NET Framework 4.8");

getElement("closureStatus").value = "Concluída com sucesso";
getElement("closureClient").value = "GER7";
getElement("closureExecutor").value = "Renan Serafim Pires";
getElement("closureDate").value = "2026-08-15";
getElement("closureTime").value = "23:40";
getElement("closureObservations").value = "Atualizacao finalizada sem incidentes. Evidencias anexadas no encerramento.";
sandbox.__setClosureEvidenceFiles([
  { name: "print-finalizacao.png", type: "image/png", size: 2048, dataUrl: "data:image/png;base64,AA==" },
  { name: "Relatorio_Tecnico_Evidencia_GMUD481_GER7.pdf", type: "application/pdf", size: 379849, dataUrl: "" },
]);
sandbox.__generateClosure();

const closureEmailHtml = getElement("closureEmailText").innerHTML;
assert(closureEmailHtml.includes("Encerramento da GMUD GMUD-TESTE"));
assert(closureEmailHtml.includes("Concluída com sucesso"));
assert(closureEmailHtml.includes("Atualizacao finalizada sem incidentes"));
assert(closureEmailHtml.includes("KB5120242"));
assert(closureEmailHtml.includes("VISA011-B"));
assert(closureEmailHtml.includes("print-finalizacao.png"));
assert(closureEmailHtml.includes("Relatorio_Tecnico_Evidencia_GMUD481_GER7.pdf"));

const closureReportHtml = sandbox.__buildClosureReportHtml();
assert(closureReportHtml.includes("RELATÓRIO TÉCNICO DE EVIDÊNCIA"));
assert(closureReportHtml.includes("GMUD GMUD-TESTE - GER7 | Atualizações de Segurança"));
assert(closureReportHtml.includes("<td class=\"meta-label\">Cliente</td><td>GER7</td>"));
assert(closureReportHtml.includes("<td class=\"meta-label\">Executor</td><td>Renan Serafim Pires</td>"));
assert(closureReportHtml.includes("<td class=\"meta-label\">Status</td><td>Concluída com sucesso</td>"));
assert(closureReportHtml.includes("Resumo Executivo"));
assert(closureReportHtml.includes("<th>Servidor</th><th>SO</th><th>Resultado</th>"));
assert(closureReportHtml.includes("Evidência - Console de Gerenciamento"));
assert(closureReportHtml.includes("Conclusão Técnica"));
assert(closureReportHtml.includes("GMUD-TESTE"));
assert(closureReportHtml.includes("Atualizacao finalizada sem incidentes"));
assert(closureReportHtml.includes("<img"));
assert(closureReportHtml.includes("data:image/png;base64,AA=="));
assert(closureReportHtml.includes("Relatorio_Tecnico_Evidencia_GMUD481_GER7.pdf"));
assert(closureReportHtml.includes("Salvar como PDF"));

getElement("closureStatus").value = "Concluída com ressalvas";
sandbox.__setClosureEvidenceFiles([
  {
    name: "tanium-final.png",
    type: "image/png",
    size: 4096,
    dataUrl: "data:image/png;base64,BB==",
    ocrText: [
      "VISA011-B Parent Status Complete Status Complete, All Patches Applied Currently Targeted Yes",
      "VISA029-1 Status Pending Error Reboot Required"
    ].join("\n")
  }
]);
const perServerReportHtml = sandbox.__buildClosureReportHtml();
assert(perServerReportHtml.includes("<td>VISA011-B</td><td>Windows Server 2022</td><td>Complete, All Patches Applied</td>"));
assert(perServerReportHtml.includes("<td>VISA029-1</td><td>Windows Server 2016</td><td>Falha identificada na evidencia</td>"));

getElement("closureStatus").value = "Concluída com sucesso";
getElement("closureObservations").value = "";
sandbox.__setClosureEvidenceFiles([
  { name: "tanium-pendente.png", type: "image/png", size: 4096, dataUrl: "data:image/png;base64,DD==" }
]);
const pendingOcrReportHtml = sandbox.__buildClosureReportHtml();
assert(pendingOcrReportHtml.includes("Aguardando analise OCR da evidencia"));
assert(!pendingOcrReportHtml.includes("Servidores sem evidencia ou observacao no encerramento"));

sandbox.__setClosureEvidenceFiles([
  {
    name: "tanium-sem-hostname.png",
    type: "image/png",
    size: 4096,
    dataUrl: "data:image/png;base64,EE==",
    ocrAnalyzed: true,
    ocrText: "Parent Status Complete Status Complete All Patches Applied Currently Targeted Yes"
  }
]);
const unmatchedOcrReportHtml = sandbox.__buildClosureReportHtml();
assert(unmatchedOcrReportHtml.includes("OCR sem correspondencia com o servidor; validar manualmente"));
assert(!unmatchedOcrReportHtml.includes("Servidores sem evidencia ou observacao no encerramento"));

getElement("closureStatus").value = "Concluída com sucesso";
getElement("closureObservations").value = "VISA050-X: patch nao aplicado, com acompanhamento registrado nas observacoes da GMUD.";
sandbox.__setClosureEvidenceFiles([
  {
    name: "tanium-final-parcial.png",
    type: "image/png",
    size: 4096,
    dataUrl: "data:image/png;base64,CC==",
    ocrText: "VISA011-B Parent Status Complete Status Complete, All Patches Applied Currently Targeted Yes"
  }
]);
sandbox.__generateClosure();
const missingEvidenceEmailHtml = getElement("closureEmailText").innerHTML;
const missingEvidenceReportHtml = sandbox.__buildClosureReportHtml();
assert(missingEvidenceEmailHtml.includes("Servidores sem evidencia ou observacao no encerramento"));
assert(missingEvidenceEmailHtml.includes("VISA029-1"));
assert(missingEvidenceReportHtml.includes("<td>VISA029-1</td><td>Windows Server 2016</td><td>Nao evidenciado no encerramento</td>"));
assert(missingEvidenceReportHtml.includes("<td>VISA050-X</td><td>Windows Server 2022</td><td>Registrado nas observacoes da GMUD</td>"));
assert(missingEvidenceReportHtml.includes("Servidores sem evidencia ou observacao no encerramento"));

const successStatus = sandbox.__inferClosureStatusFromEvidenceText("Parent Status Complete Status Complete, All Patches Applied Currently Targeted Yes");
assert.strictEqual(successStatus.status, "Concluída com sucesso");
assert(successStatus.reason.includes("Complete"));

const warningStatus = sandbox.__inferClosureStatusFromEvidenceText("Status Pending Error Failed Reboot Required");
assert.strictEqual(warningStatus.status, "Concluída com ressalvas");
assert(warningStatus.reason.includes("pendencia"));

getElement("input").value = [
  "VWCSC001 Microsoft Windows Server 2022 (64-bit)",
  "VWCSC014 Microsoft Windows Server 2022 (64-bit)",
  "VWCSC016 Microsoft Windows Server 2022 (64-bit)",
  "VWCSC017 Microsoft Windows Server 2022 (64-bit)",
  "VWCSC018 Microsoft Windows Server 2022 (64-bit)",
  "VWCSC019 Microsoft Windows Server 2022 (64-bit)"
].join("\n");
getElement("closureObservations").value = "";
sandbox.__setClosureEvidenceFiles([{
  name: "gmud-701.png",
  type: "image/png",
  size: 731136,
  dataUrl: "data:image/png;base64,FF==",
  ocrAnalyzed: true,
  ocrText: [
    "VWCSC001.grupo.jm Complete All Patches Applied Yes",
    "VWCSC014.grupo.jm Complete All Patches Applied Yes",
    "VWCSC0G16.grupo.jm Complete All Patches Applied Yes",
    "VWCSC0T7.grupo.jm Complete All Patches Applied Yes",
    "VWCSC018.grupo.jm Complete All Patches Applied Yes",
    "VWCSC019.grupo.jm Complete All Patches Applied Yes"
  ].join("\n")
}]);
const fuzzyOcrReportHtml = sandbox.__buildClosureReportHtml();
["VWCSC001", "VWCSC014", "VWCSC016", "VWCSC017", "VWCSC018", "VWCSC019"].forEach(host => {
  assert(fuzzyOcrReportHtml.includes(`<td>${host}</td><td>Windows Server 2022</td><td>Complete, All Patches Applied</td>`), `${host} deve ser correlacionado mesmo com erro simples de OCR`);
});
assert(!fuzzyOcrReportHtml.includes("Nao evidenciado no encerramento"));
const completeScopeInference = sandbox.__reconcileClosureInferenceWithScope(successStatus);
assert.strictEqual(completeScopeInference.status, "Concluída com sucesso", "todos os hosts evidenciados devem permitir sucesso");

sandbox.__setClosureEvidenceFiles([{
  name: "gmud-701-incompleta.png",
  type: "image/png",
  size: 731136,
  dataUrl: "data:image/png;base64,GG==",
  ocrAnalyzed: true,
  ocrText: [
    "VWCSC001.grupo.jm Complete All Patches Applied Yes",
    "VWCSC014.grupo.jm Complete All Patches Applied Yes",
    "VWCSC018.grupo.jm Complete All Patches Applied Yes",
    "VWCSC019.grupo.jm Complete All Patches Applied Yes"
  ].join("\n")
}]);
const incompleteScopeInference = sandbox.__reconcileClosureInferenceWithScope(successStatus);
assert.strictEqual(incompleteScopeInference.status, "Concluída com ressalvas", "status geral nao pode ser sucesso com hosts ausentes");
assert(incompleteScopeInference.reason.includes("2 de 6 servidor(es)"));

const ambiguousOcrText = sandbox.__enrichEvidenceTextWithFuzzyServerAliases(
  "VWCSC01G Complete All Patches Applied",
  [{ name: "VWCSC016", info: "" }, { name: "VWCSC018", info: "" }]
);
assert(!ambiguousOcrText.includes("VWCSC016"), "OCR ambiguo nao deve validar VWCSC016 automaticamente");
assert(!ambiguousOcrText.includes("VWCSC018"), "OCR ambiguo nao deve validar VWCSC018 automaticamente");
const structuredOcrText = vm.runInContext(`buildStructuredOcrText({ data: { words: [
  { text: "VISA012.VISABRASIL.local", bbox: { x0: 20, y0: 100, x1: 180, y1: 120 } },
  { text: "Pending", bbox: { x0: 900, y0: 100, x1: 960, y1: 120 } },
  { text: "Restart", bbox: { x0: 965, y0: 100, x1: 1030, y1: 120 } },
  { text: "VISA035.VISABRASIL.local", bbox: { x0: 20, y0: 140, x1: 180, y1: 160 } },
  { text: "Waiting", bbox: { x0: 900, y0: 140, x1: 960, y1: 160 } },
  { text: "for", bbox: { x0: 965, y0: 140, x1: 990, y1: 160 } },
  { text: "Deployment", bbox: { x0: 995, y0: 140, x1: 1080, y1: 160 } }
] } })`, sandbox);
assert(structuredOcrText.includes("VISA012.VISABRASIL.local Pending Restart"));
assert(structuredOcrText.includes("VISA035.VISABRASIL.local Waiting for Deployment"));
const blockStructuredOcrText = vm.runInContext(`buildStructuredOcrText({ data: { blocks: [{ paragraphs: [{ lines: [{ words: [
  { text: "VISA027-1.VISABRASIL.local", bbox: { x0: 20, y0: 100, x1: 190, y1: 120 } },
  { text: "Complete", bbox: { x0: 900, y0: 100, x1: 970, y1: 120 } },
  { text: "All", bbox: { x0: 980, y0: 100, x1: 1005, y1: 120 } },
  { text: "Patches", bbox: { x0: 1010, y0: 100, x1: 1070, y1: 120 } },
  { text: "Applied", bbox: { x0: 1075, y0: 100, x1: 1135, y1: 120 } }
] }] }] }] } })`, sandbox);
assert(blockStructuredOcrText.includes("VISA027-1.VISABRASIL.local Complete All Patches Applied"));
assert.strictEqual(vm.runInContext('inferClosureResultFromEvidenceContext("VISA012 Pending Restart, Restart Required to Complete")', sandbox), "Pending Restart - reinicio necessario");
assert.strictEqual(vm.runInContext('inferClosureResultFromEvidenceContext("VISA035 Waiting for Deployment Start Time")', sandbox), "Waiting for Deployment Start Time");
const isolatedCompleteContext = vm.runInContext(`getServerEvidenceContext(
  "VISA027-1.VISABRASIL.local Complete, All Patches Applied\\nVISA012.VISABRASIL.local Pending Restart",
  { name: "VISA027-1", info: "" },
  [{ name: "VISA027-1", info: "" }, { name: "VISA012", info: "" }]
)`, sandbox);
assert(!isolatedCompleteContext.includes("Pending Restart"), "status da linha seguinte nao pode contaminar a VM anterior");
const visaEmailInfo = vm.runInContext('getCustomerEmailVmInfo({ name: "VISA011-B", info: "Cliente: VISA-HYPERATIVA | IP: 10.0.0.1 | OS: Windows Server 2022" })', sandbox);
const regularEmailInfo = vm.runInContext('getCustomerEmailVmInfo({ name: "CLIENTE01", info: "Cliente: OUTRO | IP: 10.0.0.2 | OS: Windows Server 2022" })', sandbox);
assert.strictEqual(visaEmailInfo, "Cliente: VISA-HYPERATIVA | OS: Windows Server 2022");
assert.strictEqual(regularEmailInfo, "Cliente: OUTRO | IP: 10.0.0.2 | OS: Windows Server 2022");
getElement("input").value = "VISA004 10.203.159.14 Microsoft Windows Server 2022 (64-bit)";
getElement("onlyPoweredOn").checked = true;
vm.runInContext(`isCmdbLoaded = true; cmdbDatabase = [{
  HostName: "VISA004",
  IP: "10.203.159.14",
  Customer: "VISA-HYPERATIVA",
  SO: "Microsoft Windows Server 2022 (64-bit)",
  Status: "Ligada",
  ServerID: "visa004-test"
}];`, sandbox);
sandbox.__generateClosure();
const visaClosureEmailHtml = getElement("closureEmailText").innerHTML;
assert(visaClosureEmailHtml.includes("VISA004"));
assert(visaClosureEmailHtml.includes("Cliente: VISA-HYPERATIVA"));
assert(visaClosureEmailHtml.includes("Microsoft Windows Server 2022"));
assert(!visaClosureEmailHtml.includes("10.203.159.14"), "e-mail de encerramento da VISA nao deve exibir IP");
vm.runInContext("isCmdbLoaded = false; cmdbDatabase = [];", sandbox);
assert(html.includes("tanium_kb_catalog.json"), "deve consultar o catalogo automatico publicado no GitHub");
assert(html.includes('cache: "no-store"'), "deve ignorar cache antigo do catalogo mensal");
assert(html.includes("KB5122882"), "backup local deve conter o KB de setembro do Server 2022");
assert(html.includes('onclick="copyEmailAddress(this)"'), "cada e-mail encontrado deve ter botao individual para copiar");
assert(html.includes('data-email="${email}"'), "o botao deve usar o endereco da propria linha");
