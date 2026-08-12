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
  window: { ClipboardItem: function ClipboardItem() {}, getSelection() { return { removeAllRanges() {}, addRange() {} }; } },
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
script = script.replace(/generate\(\);\s*updateScriptPreview\(\);\s*loadLatestKBsFromMicrosoft\(\);/, "");

vm.createContext(sandbox);
vm.runInContext(`${script}\nthis.__buildKbCatalogFromMsrc = buildKbCatalogFromMsrc;`, sandbox);

assert.strictEqual(typeof sandbox.__buildKbCatalogFromMsrc, "function");

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
              { ProductID: "11571", Value: "Windows Server 2019" },
              { ProductID: "10816", Value: "Windows Server 2016" },
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
        { Description: { Value: "5120242" }, ProductID: ["11923", "11924"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120229" }, ProductID: ["11923", "11924"], Type: 2, SubType: "Security Hotpatch Update" },
        { Description: { Value: "5120238" }, ProductID: ["11571"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120418" }, ProductID: ["10816"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120249" }, ProductID: ["12097"], Type: 2, SubType: "Security Update" },
        { Description: { Value: "5120240" }, ProductID: ["12243"], Type: 2, SubType: "Security Update" },
        { URL: "https://support.microsoft.com/help/5120242", ProductID: ["11923"], Type: 3, SubType: "5120242" },
      ],
    },
  ],
};

const catalog = sandbox.__buildKbCatalogFromMsrc(sampleMsrc, baseCatalog, "2026-Aug");

assert.strictEqual(catalog["2022"].kb, "KB5120242");
assert.strictEqual(catalog["2019"].kb, "KB5120238");
assert.strictEqual(catalog["2016"].kb, "KB5120418");
assert.strictEqual(catalog["10"].kb, "KB5120249");
assert.strictEqual(catalog["11"].kb, "KB5120240");
assert.match(catalog["2022"].name, /August 2026|2026-Aug/);
