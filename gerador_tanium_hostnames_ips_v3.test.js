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
vm.runInContext(`${script}\nthis.__buildKbCatalogFromMsrc = buildKbCatalogFromMsrc;\nthis.__suggestKBs = suggestKBs;\nthis.__generate = generate;\nthis.__setKbCatalog = (catalog) => { KB_CATALOG = catalog; };\nthis.__generateClosure = typeof generateClosure === "function" ? generateClosure : undefined;\nthis.__buildClosureReportHtml = typeof buildClosureReportHtml === "function" ? buildClosureReportHtml : undefined;\nthis.__inferClosureStatusFromEvidenceText = typeof inferClosureStatusFromEvidenceText === "function" ? inferClosureStatusFromEvidenceText : undefined;\nthis.__analyzeClosureEvidenceStatus = typeof analyzeClosureEvidenceStatus === "function" ? analyzeClosureEvidenceStatus : undefined;\nthis.__setClosureEvidenceFiles = (files) => { closureEvidenceFiles = files; };`, sandbox);

assert.strictEqual(typeof sandbox.__buildKbCatalogFromMsrc, "function");
assert.strictEqual(typeof sandbox.__suggestKBs, "function");
assert.strictEqual(typeof sandbox.__generate, "function");
assert.strictEqual(typeof sandbox.__generateClosure, "function");
assert.strictEqual(typeof sandbox.__buildClosureReportHtml, "function");
assert.strictEqual(typeof sandbox.__inferClosureStatusFromEvidenceText, "function");
assert.strictEqual(typeof sandbox.__analyzeClosureEvidenceStatus, "function");

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

const catalogNameItems = sandbox.__suggestKBs(["Microsoft server operating system version 24H2 for x64-based Systems"]);
assert(catalogNameItems.some(item => item.kb === "KB5120233"), "nome do Microsoft Update Catalog 24H2 deve mapear para Server 2025");

const server2012Items = sandbox.__suggestKBs(["LEGADO01 Microsoft Windows Server 2012 R2 (64-bit)"]);
assert.strictEqual(server2012Items.length, 0, "Windows Server 2012/R2 nao deve receber sugestao automatica de KB");
assert(getElement("kbSuggestions").innerHTML.includes("Windows Server 2012/2012 R2 sem suporte padrao"));
assert(getElement("kbSuggestions").innerHTML.includes("10/10/2023"));
assert(getElement("kbSuggestions").innerHTML.includes("13/10/2026"));

getElement("input").value = "LEGADO01 Microsoft Windows Server 2012 R2 (64-bit)";
sandbox.__generate();
const server2012EmailHtml = getElement("emailText").innerHTML;
assert(server2012EmailHtml.includes("Sistemas operacionais sem suporte padrao"));
assert(server2012EmailHtml.includes("Windows Server 2012/2012 R2 sem suporte padrao"));
assert(!server2012EmailHtml.includes("Cumulative Security Updates (Tanium Patch)"));

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
assert(perServerReportHtml.includes("<td>VISA029-1</td><td>Windows Server 2016</td><td>Validado com ressalvas</td>"));

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
