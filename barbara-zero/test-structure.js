const fs = require("fs");
const path = require("path");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
const js = fs.readFileSync(path.join(root, "script.js"), "utf8");
const manifestPath = path.join(root, "manifest.webmanifest");
const manifest = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "";
const swPath = path.join(root, "service-worker.js");
const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, "utf8") : "";
const packagePath = path.join(root, "package.json");
const pkg = fs.existsSync(packagePath) ? fs.readFileSync(packagePath, "utf8") : "";

const checks = [
  {
    name: "has a rebuilt shell with stage, capsule top bar, drawer and quiz",
    pass:
      html.includes('id="scene-stage"') &&
      html.includes('id="top-capsule"') &&
      html.includes('id="drawer"') &&
      html.includes('id="quiz-modal"') &&
      html.includes('id="open-quiz"'),
  },
  {
    name: "contains all requested places in navigation data",
    pass:
      js.includes("Casa") &&
      js.includes("Escola") &&
      js.includes("Hospital") &&
      js.includes("Loja") &&
      js.includes("Parque") &&
      js.includes("Piscina"),
  },
  {
    name: "uses doll-like avatars and stage art pieces",
    pass:
      css.includes(".avatar-card") &&
      css.includes(".doll-head") &&
      css.includes(".stage-illustration") &&
      js.includes("renderAvatarCard") &&
      css.includes("house-scene.svg") &&
      css.includes("school-scene.svg"),
  },
  {
    name: "supports visible reading quiz trigger and speech",
    pass:
      html.includes('id="quiz-options"') &&
      html.includes('id="quiz-repeat"') &&
      js.includes("speechSynthesis") &&
      js.includes("choiceQuizBank") &&
      js.includes("openQuiz"),
  },
  {
    name: "supports random quiz gates before play actions",
    pass:
      js.includes("runWithRandomQuiz") &&
      js.includes("pendingQuizAction") &&
      js.includes("RANDOM_QUIZ_CHANCE") &&
      js.includes("TOUCH_QUIZ_CHANCE"),
  },
  {
    name: "supports written quiz answers",
    pass:
      html.includes('id="quiz-answer"') &&
      html.includes('id="quiz-submit"') &&
      js.includes("writeQuizBank") &&
      js.includes("showQuizMode") &&
      js.includes("normalizeAnswer") &&
      css.includes("#quiz-write"),
  },
  {
    name: "has installable app icons and manifest",
    pass:
      html.includes('rel="manifest"') &&
      html.includes('rel="apple-touch-icon"') &&
      manifest.includes('"display": "standalone"') &&
      fs.existsSync(path.join(root, "assets", "icons", "icon-192.png")) &&
      fs.existsSync(path.join(root, "assets", "icons", "icon-512.png")) &&
      fs.existsSync(path.join(root, "assets", "icons", "apple-touch-icon.png")),
  },
  {
    name: "drawer can collapse from the handle",
    pass:
      html.includes('id="drawer-toggle"') &&
      js.includes("toggleDrawer") &&
      js.includes("setDrawerCollapsed") &&
      css.includes("#drawer.collapsed") &&
      css.includes("drawer-collapsed"),
  },
  {
    name: "supports offline PWA shell",
    pass:
      html.includes('id="loading-screen"') &&
      js.includes("registerServiceWorker") &&
      sw.includes("CACHE_NAME") &&
      sw.includes("CORE_ASSETS") &&
      manifest.includes('"display_override"'),
  },
  {
    name: "tracks local progress and legal screens",
    pass:
      html.includes('id="progress-modal"') &&
      html.includes('id="about-modal"') &&
      html.includes("privacy.html") &&
      js.includes("localStorage") &&
      js.includes("unlockAchievement"),
  },
  {
    name: "has capacitor app configuration",
    pass:
      fs.existsSync(path.join(root, "capacitor.config.json")) &&
      fs.existsSync(path.join(root, "android")) &&
      pkg.includes("@capacitor/core") &&
      pkg.includes("cap:sync"),
  },
];

const failed = checks.filter((check) => !check.pass);

if (failed.length) {
  console.error("Structure test failed:");
  failed.forEach((check) => console.error(`- ${check.name}`));
  process.exit(1);
}

console.log(`Structure test passed (${checks.length} checks).`);
