// --- UNIFIED GA4 METRICS TRACKING HELPER ---
function trackEvent(eventName, params = {}) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', eventName, {
        ...params,
        app_name: 'Barbara Zero',
        platform: window.Capacitor ? 'Capacitor Native' : 'PWA Web'
      });
      console.log(`[Analytics] Evento '${eventName}' enviado com sucesso:`, params);
    } else {
      console.warn(`[Analytics] gtag não está disponível para o evento '${eventName}'`);
    }
  } catch (e) {
    console.error(`[Analytics] Erro ao enviar evento '${eventName}':`, e);
  }
}

const roomTabs = document.getElementById("room-tabs");
const sceneStage = document.getElementById("scene-stage");
const sceneLayer = document.getElementById("scene-layer");
const actorLayer = document.getElementById("actor-layer");
const app = document.getElementById("app");
const drawer = document.getElementById("drawer");
const drawerToggle = document.getElementById("drawer-toggle");
const drawerCards = document.getElementById("drawer-cards");
const drawerCats = document.querySelectorAll(".drawer-cat");
const drawerPrev = document.getElementById("drawer-prev");
const drawerNext = document.getElementById("drawer-next");
const mapModal = document.getElementById("map-modal");
const mapGrid = document.getElementById("map-grid");
const quizModal = document.getElementById("quiz-modal");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizWrite = document.getElementById("quiz-write");
const quizAnswer = document.getElementById("quiz-answer");
const quizSubmit = document.getElementById("quiz-submit");
const quizRepeat = document.getElementById("quiz-repeat");
const quizClose = document.getElementById("quiz-close");
const openQuizBtn = document.getElementById("open-quiz");
const toast = document.getElementById("toast");
const starCount = document.getElementById("star-count");
const soundBtn = document.getElementById("sound-btn");
const progressBtn = document.getElementById("progress-btn");
const progressModal = document.getElementById("progress-modal");
const progressSummary = document.getElementById("progress-summary");
const achievementList = document.getElementById("achievement-list");
const progressClose = document.getElementById("progress-close");
const aboutBtn = document.getElementById("about-btn");
const aboutModal = document.getElementById("about-modal");
const aboutClose = document.getElementById("about-close");
const loadingScreen = document.getElementById("loading-screen");
const errorBanner = document.getElementById("error-banner");

let soundEnabled = true;
let audioContext = null;
let currentPlace = "Casa";
let currentRoom = "Quarto";
let currentCategory = "pessoas";
let lastQuizText = "";
let pendingRoom = null;
let pendingQuizAction = null;
let toastTimer = null;
let selectionClearTimer = null;
let nextPlacedId = 1;
let dragState = null;
let selectedItemId = null;
let lastRandomQuizAt = 0;
let lastDragEndedAt = 0;
let errorTimer = null;
let panState = null;

const APP_VERSION = "1.1.0";
const STORAGE_KEY = "barbara-zero-progress-v2";
const stats = { stars: 1, level: 1 };
const progress = {
  actions: 0,
  quizzes: 0,
  correct: 0,
  completedScenes: {},
  categories: { moveis: 0, pessoas: 0, pets: 0, comidas: 0 },
  achievements: [],
  unlockedPlaces: ["Casa"],
  totalPlayTimeMs: 0,
};
const placedItemsByScene = {};
const RANDOM_QUIZ_CHANCE = 0.48;
const TOUCH_QUIZ_CHANCE = 0.32;
const RANDOM_QUIZ_COOLDOWN_MS = 5200;

const places = {
  Casa: { icon: "🏠", rooms: ["Quarto", "Sala", "Cozinha"], unlockCost: 0 },
  Escola: { icon: "🏫", rooms: ["Sala", "Refeitório", "Pátio"], unlockCost: 5 },
  Hospital: { icon: "🏥", rooms: ["Recepção", "Consulta"], unlockCost: 10 },
  Loja: { icon: "🛍️", rooms: ["Moda", "Brinquedos"], unlockCost: 15 },
  Shopping: { icon: "🛒", rooms: ["Vitrines", "Praça"], unlockCost: 20 },
  Parque: { icon: "🌳", rooms: ["Piquenique", "Brincar"], unlockCost: 25 },
  Piscina: { icon: "🏊", rooms: ["Deck", "Boias"], unlockCost: 30 },
};

const actors = {
  Casa: [
    { look: "girl", left: "28px", top: "256px" },
    { look: "boy", left: "144px", top: "260px" },
    { look: "mom", left: "254px", top: "258px" },
  ],
  Escola: [
    { look: "student", left: "34px", top: "266px" },
    { look: "boy", left: "144px", top: "266px" },
    { look: "student", left: "252px", top: "266px" },
  ],
  Hospital: [
    { look: "doctor", left: "34px", top: "262px" },
    { look: "mom", left: "148px", top: "266px" },
    { look: "doctor", left: "254px", top: "262px" },
  ],
  Loja: [
    { look: "seller", left: "26px", top: "258px" },
    { look: "girl", left: "144px", top: "260px" },
    { look: "boy", left: "252px", top: "260px" },
  ],
  Shopping: [
    { look: "mom", left: "28px", top: "258px" },
    { look: "boy", left: "142px", top: "258px" },
    { look: "girl", left: "252px", top: "258px" },
  ],
  Parque: [
    { look: "girl", left: "78px", top: "286px" },
    { look: "mom", left: "178px", top: "286px" },
  ],
  Piscina: [
    { look: "swimmer", left: "58px", top: "286px" },
    { look: "boy", left: "246px", top: "286px" },
  ],
};

const legacyDrawerCatalog = {
  moveis: ["🛏️", "🛋️", "🪴", "📺"],
  pessoas: ["girl", "mom", "boy", "swimmer"],
  pets: ["🐶", "🐱", "🐰"],
  comidas: ["🍰", "🍓", "🧃", "🍕"],
};

const drawerCatalog = {
  moveis: ["bed", "sofa", "rug", "plant", "shelf", "tub", "desk", "rack", "fridge", "lounge", "palm", "backpack"],
  pessoas: ["girl", "mom", "boy", "swimmer"],
  pets: ["corgi", "cat", "bunny"],
  comidas: ["basket", "juice", "cake", "pizza", "sandwich"],
};

const itemSprites = {
  bed: { file: "bed.png", dir: "furniture", cardW: 88, cardH: 70, sceneW: 136, sceneH: 108 },
  sofa: { file: "sofa.png", dir: "furniture", cardW: 90, cardH: 62, sceneW: 146, sceneH: 100 },
  rug: { file: "rug.png", dir: "furniture", cardW: 88, cardH: 42, sceneW: 132, sceneH: 64 },
  plant: { file: "plant.png", dir: "furniture", cardW: 62, cardH: 82, sceneW: 86, sceneH: 114 },
  shelf: { file: "shelf.png", dir: "furniture", cardW: 90, cardH: 70, sceneW: 132, sceneH: 102 },
  tub: { file: "tub.png", dir: "furniture", cardW: 90, cardH: 66, sceneW: 140, sceneH: 104 },
  desk: { file: "desk.png", dir: "furniture", cardW: 90, cardH: 70, sceneW: 136, sceneH: 106 },
  backpack: { file: "backpack.png", dir: "furniture", cardW: 64, cardH: 76, sceneW: 78, sceneH: 94 },
  rack: { file: "rack.png", dir: "furniture", cardW: 88, cardH: 70, sceneW: 136, sceneH: 108 },
  basket: { file: "basket.png", dir: "foods", cardW: 86, cardH: 58, sceneW: 118, sceneH: 78 },
  juice: { file: "juice.png", dir: "foods", cardW: 42, cardH: 74, sceneW: 54, sceneH: 94 },
  cake: { file: "cake.png", dir: "foods", cardW: 70, cardH: 60, sceneW: 90, sceneH: 78 },
  pizza: { file: "pizza.png", dir: "foods", cardW: 76, cardH: 58, sceneW: 98, sceneH: 76 },
  sandwich: { file: "sandwich.png", dir: "foods", cardW: 72, cardH: 58, sceneW: 92, sceneH: 76 },
  corgi: { x: 196, y: 746, cardW: 68, cardH: 74, sceneW: 86, sceneH: 94 },
  cat: { x: 430, y: 746, cardW: 64, cardH: 74, sceneW: 80, sceneH: 92 },
  bunny: { x: 646, y: 748, cardW: 58, cardH: 74, sceneW: 72, sceneH: 92 },
  lounge: { file: "lounge.png", dir: "furniture", cardW: 82, cardH: 64, sceneW: 118, sceneH: 92 },
  palm: { file: "palm.png", dir: "furniture", cardW: 62, cardH: 86, sceneW: 84, sceneH: 118 },
  fridge: { file: "fridge.png", dir: "furniture", cardW: 54, cardH: 84, sceneW: 78, sceneH: 120 },
};

const characterSprites = {
  girl: { file: "girl.png", cardW: 82, cardH: 118, sceneW: 118, sceneH: 170 },
  boy: { file: "boy.png", cardW: 64, cardH: 120, sceneW: 92, sceneH: 172 },
  mom: { file: "mom.png", cardW: 52, cardH: 134, sceneW: 74, sceneH: 190 },
  swimmer: { file: "swimmer.png", cardW: 62, cardH: 122, sceneW: 88, sceneH: 172 },
  corgi: { file: "corgi.png", cardW: 68, cardH: 114, sceneW: 78, sceneH: 130 },
  cat: { file: "cat.png", cardW: 78, cardH: 112, sceneW: 90, sceneH: 130 },
  bunny: { file: "bunny.png", cardW: 76, cardH: 112, sceneW: 88, sceneH: 130 },
};

const writeQuizBank = [
  { type: "write", q: "Escreva a palavra CASA.", answer: "CASA", accepted: ["CASA"] },
  { type: "write", q: "Escreva a palavra BOLA.", answer: "BOLA", accepted: ["BOLA"] },
  { type: "write", q: "Escreva a palavra GATO.", answer: "GATO", accepted: ["GATO"] },
  { type: "write", q: "Escreva a palavra SOL.", answer: "SOL", accepted: ["SOL"] },
  { type: "write", q: "Escreva a palavra LUA.", answer: "LUA", accepted: ["LUA"] },
  { type: "write", q: "Escreva a palavra LIVRO.", answer: "LIVRO", accepted: ["LIVRO"] },
];

const choiceQuizBank = [
  { q: "Qual palavra comeca com a letra C?", options: ["CASA", "BOLA", "SAPO"], answer: "CASA" },
  { q: "Qual dessas palavras tem duas silabas?", options: ["GATO", "TELEFONE", "P"], answer: "GATO" },
  { q: "Qual palavra combina com escola?", options: ["LIVRO", "PANELA", "SOFA"], answer: "LIVRO" },
  { q: "Qual palavra comeca igual a boneca?", options: ["BOLA", "MESA", "RUA"], answer: "BOLA" },
  { q: "Qual dessas palavras e um animal?", options: ["GATO", "BOLO", "CAMA"], answer: "GATO" },
  { q: "Qual palavra termina com A?", options: ["CASA", "SOL", "PATO"], answer: "CASA" },
  { q: "Qual palavra começa com B?", options: ["BOLA", "GATO", "UVA"], answer: "BOLA" },
  { q: "Qual dessas é uma fruta?", options: ["MORANGO", "PORTA", "SOFÁ"], answer: "MORANGO" },
  { q: "Qual dessas é uma comida?", options: ["PIZZA", "JANELA", "CAMA"], answer: "PIZZA" },
  { q: "Qual palavra rima com MÃO?", options: ["PÃO", "GATO", "CASA"], answer: "PÃO" },
];

function getAudioContext() {
  if (!soundEnabled) return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) audioContext = new AudioCtx();
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function playTone(frequency = 720, duration = 0.1, type = "triangle", gain = 0.09) {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const now = context.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(gain, now + 0.018);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function haptic(style = "light") {
  const nativeHaptics = window.Capacitor?.Plugins?.Haptics;
  if (nativeHaptics?.impact) {
    const impactStyle = style === "success" ? "MEDIUM" : style === "error" ? "HEAVY" : "LIGHT";
    nativeHaptics.impact({ style: impactStyle }).catch(() => {});
    return;
  }
  if ("vibrate" in navigator) {
    const pattern = style === "success" ? [18, 24, 18] : style === "error" ? 70 : 12;
    navigator.vibrate(pattern);
  }
}

function playPop() {
  haptic("light");
  playTone(760, 0.08, "triangle", 0.08);
}

function playHappy() {
  haptic("success");
  playTone(680, 0.08, "triangle", 0.08);
  setTimeout(() => playTone(920, 0.1, "triangle", 0.08), 85);
}

function playSoftError() {
  haptic("error");
  playTone(260, 0.12, "sine", 0.075);
}

function playVictory() {
  haptic("success");
  [620, 780, 930, 1160].forEach((frequency, index) => {
    setTimeout(() => playTone(frequency, 0.12, "triangle", 0.08), index * 95);
  });
}

async function speak(text) {
  if (!soundEnabled) return false;

  playTone(620, 0.035, "triangle", 0.045);

  if (window.Capacitor?.isNativePlatform()) {
    try {
      const TTS = window.Capacitor.Plugins?.TextToSpeech || (window.Capacitor.registerPlugin && window.Capacitor.registerPlugin("TextToSpeech"));
      if (TTS) {
        await TTS.speak({
          text: text,
          lang: 'pt-BR',
          rate: 0.9,
          pitch: 1.12,
          volume: 1.0
        });
        return true;
      }
    } catch (e) {
      console.error("Native TTS fail", e);
    }
  }

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    showToast("Som ativo, voz indisponivel neste navegador.");
    return false;
  }

  const say = () => {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((entry) => entry.lang?.toLowerCase().startsWith("pt-br"))
      || voices.find((entry) => entry.lang?.toLowerCase().startsWith("pt"))
      || voices[0];

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    utter.rate = 0.9;
    utter.pitch = 1.12;
    utter.volume = 1;
    if (voice) utter.voice = voice;
    utter.onerror = () => {
      playSoftError();
      showToast("Toque em ouvir de novo.");
    };
    window.speechSynthesis.speak(utter);
  };

  if (!window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.onvoiceschanged = say;
  } else {
    say();
  }
  return true;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.add("show");
  clearTimeout(errorTimer);
  errorTimer = setTimeout(() => errorBanner.classList.remove("show"), 3600);
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.stats?.stars) stats.stars = saved.stats.stars;
    if (saved.stats?.level) stats.level = saved.stats.level;
    if (saved.progress) {
      progress.actions = saved.progress.actions || 0;
      progress.quizzes = saved.progress.quizzes || 0;
      progress.correct = saved.progress.correct || 0;
      progress.completedScenes = saved.progress.completedScenes || {};
      progress.categories = { ...progress.categories, ...(saved.progress.categories || {}) };
      progress.achievements = Array.isArray(saved.progress.achievements) ? saved.progress.achievements : [];
      progress.unlockedPlaces = Array.isArray(saved.progress.unlockedPlaces) ? saved.progress.unlockedPlaces : ["Casa"];
      progress.totalPlayTimeMs = saved.progress.totalPlayTimeMs || 0;
    }
  } catch (error) {
    showError("Nao foi possivel carregar o progresso salvo.");
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, progress, version: APP_VERSION }));
  } catch (error) {
    showError("Nao foi possivel salvar o progresso neste aparelho.");
  }
}

function unlockAchievement(id, label) {
  if (progress.achievements.some((entry) => entry.id === id)) return;
  trackEvent('game_over', { achievement_id: id, achievement_label: label });
  progress.achievements.push({ id, label, at: new Date().toISOString() });
  stats.stars += 3;
  starCount.textContent = String(stats.stars);
  playVictory();
  showToast(`Conquista: ${label}`);
}

function markSceneProgress() {
  progress.completedScenes[currentSceneKey()] = true;
  if (Object.keys(progress.completedScenes).length >= 5) {
    unlockAchievement("explorer", "Exploradora");
  }
  saveProgress();
}

function recordCategoryProgress(category) {
  progress.actions += 1;
  progress.categories[category] = (progress.categories[category] || 0) + 1;
  if (progress.actions >= 10) unlockAchievement("decorator", "Decoradora");
  if (progress.actions >= 30) unlockAchievement("designer", "Designer");
  if (progress.categories.pets >= 5) unlockAchievement("pet_lover", "Amiga dos Pets");
  if (progress.categories.comidas >= 5) unlockAchievement("chef", "Mini Chef");
  stats.level = Math.floor(progress.correct / 5) + 1;
  saveProgress();
}

function updateProgressPanel() {
  const scenes = Object.keys(progress.completedScenes).length;
  const achievements = progress.achievements.length;
  const unlocked = progress.unlockedPlaces.length;
  const total = Object.keys(places).length;
  progressSummary.innerHTML = `
    <div class="progress-grid">
      <div class="progress-card"><span class="progress-value">${stats.stars}</span> estrelas</div>
      <div class="progress-card"><span class="progress-value">${progress.correct}</span> acertos</div>
      <div class="progress-card"><span class="progress-value">${unlocked}/${total}</span> lugares</div>
      <div class="progress-card"><span class="progress-value">${achievements}</span> conquistas</div>
      <div class="progress-card"><span class="progress-value">Nv ${stats.level}</span> nível</div>
      <div class="progress-card"><span class="progress-value">${scenes}</span> cenas</div>
    </div>
  `;
  achievementList.innerHTML = progress.achievements.length
    ? progress.achievements.map((entry) => `<span class="achievement-pill">${entry.label}</span>`).join("")
    : `<span class="achievement-pill">Primeira conquista em breve</span>`;
}

/* hideLoadingScreen moved to end of file with Capacitor init */

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").then((reg) => {
      console.log("[PWA SW] Barbara Zero registrado com sucesso!");
      
      // Monitora atualizações
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showPwaUpdateToast();
          }
        });
      });
    }).catch(() => {
      showError("Modo offline indisponivel neste navegador.");
    });
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

function showPwaUpdateToast() {
  const toastEl = document.createElement('div');
  toastEl.id = 'pwa-update-banner';
  toastEl.innerHTML = `
    <div style="position: fixed; bottom: 85px; left: 50%; transform: translateX(-50%); 
                background: #ff6d83; color: white; padding: 12px 20px; border-radius: 12px; 
                box-shadow: 0 10px 30px rgba(255, 109, 131, 0.35); font-family: 'Fredoka', sans-serif; 
                font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 12px; 
                z-index: 9999; animation: pwaSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
      <span>🦉 Nova versão disponível!</span>
      <button onclick="window.location.reload()" style="background: white; color: #ff6d83; border: none; 
                       padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer;
                       font-family: 'Fredoka', sans-serif;">
        Atualizar
      </button>
    </div>
  `;
  if (!document.getElementById('pwa-update-style')) {
    const style = document.createElement('style');
    style.id = 'pwa-update-style';
    style.textContent = `
      @keyframes pwaSlideUp {
        from { transform: translate(-50%, 50px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  document.body.appendChild(toastEl);
}

function watchCriticalAssets() {
  [
    "assets/illustrated/house-scene.png",
    "assets/illustrated/characters/girl.png",
    "assets/icons/icon-192.png",
  ].forEach((src) => {
    const img = new Image();
    img.onerror = () => showError("Alguns desenhos nao carregaram. Recarregue o app.");
    img.src = src;
  });
}

function clearSelection() {
  clearTimeout(selectionClearTimer);
  if (!selectedItemId) return;
  selectedItemId = null;
  document.querySelectorAll(".placed-item.selected").forEach((entry) => {
    entry.classList.remove("selected");
  });
}

function scheduleSelectionClear(delay = 2200) {
  clearTimeout(selectionClearTimer);
  selectionClearTimer = setTimeout(clearSelection, delay);
}

function shouldShowRandomQuiz(chance = RANDOM_QUIZ_CHANCE) {
  if (quizModal.classList.contains("open")) return false;
  const now = Date.now();
  if (now - lastRandomQuizAt < RANDOM_QUIZ_COOLDOWN_MS) return false;
  return Math.random() < chance;
}

function runWithRandomQuiz(action, chance = RANDOM_QUIZ_CHANCE) {
  if (shouldShowRandomQuiz(chance)) {
    lastRandomQuizAt = Date.now();
    openQuiz(null, action);
    return;
  }
  action();
}

function setDrawerCollapsed(collapsed) {
  drawer.classList.toggle("collapsed", collapsed);
  app.classList.toggle("drawer-collapsed", collapsed);
  drawerToggle.setAttribute("aria-label", collapsed ? "Abrir bandeja de itens" : "Recolher bandeja de itens");
  drawerToggle.setAttribute("aria-expanded", String(!collapsed));
}

function toggleDrawer() {
  setDrawerCollapsed(!drawer.classList.contains("collapsed"));
  clearSelection();
  playPop();
}

setDrawerCollapsed(false);

function currentSceneKey() {
  return `${currentPlace}:${currentRoom}`;
}

function sceneItems() {
  const key = currentSceneKey();
  if (!placedItemsByScene[key]) {
    placedItemsByScene[key] = [];
  }
  return placedItemsByScene[key];
}

function spriteStyle(itemId, scene = false, fill = false) {
  const sprite = itemSprites[itemId];
  const width = fill ? "100%" : `${scene ? sprite.sceneW : sprite.cardW}px`;
  const height = fill ? "100%" : `${scene ? sprite.sceneH : sprite.cardH}px`;
  if (sprite.file) {
    return [
      `width:${width}`,
      `height:${height}`,
      `background-image:url('assets/illustrated/${sprite.dir}/${sprite.file}?v=3')`,
      "background-repeat:no-repeat",
      "background-size:contain",
      "background-position:center bottom",
    ].join(";");
  }
  return [
    `width:${width}`,
    `height:${height}`,
    "background-image:url('assets/illustrated/items-sheet.png?v=1')",
    "background-repeat:no-repeat",
    "background-size:1536px 1024px",
    `background-position:-${sprite.x}px -${sprite.y}px`,
  ].join(";");
}

function characterSpriteStyle(look, scene = false, fill = false) {
  const sprite = characterSprites[look];
  const width = fill ? "100%" : `${scene ? sprite.sceneW : sprite.cardW}px`;
  const height = fill ? "100%" : `${scene ? sprite.sceneH : sprite.cardH}px`;
  return [
    `width:${width}`,
    `height:${height}`,
    `background-image:url('assets/illustrated/characters/${sprite.file}?v=2')`,
    "background-repeat:no-repeat",
    "background-size:contain",
    "background-position:center bottom",
  ].join(";");
}

function addPlacedSprite(itemId) {
  const sprite = itemSprites[itemId];
  const items = sceneItems();
  const id = nextPlacedId++;
  
  const scrollX = sceneStage.scrollLeft || 0;
  const viewW = sceneStage.clientWidth;

  items.push({
    id,
    kind: "sprite",
    itemId,
    left: scrollX + viewW / 2 - sprite.sceneW / 2,
    top: 150,
    width: sprite.sceneW,
    height: sprite.sceneH,
  });
  selectedItemId = id;
  scheduleSelectionClear(4200);
  renderScene();
  playPop();
  recordCategoryProgress(currentCategory);
  showToast("Item colocado!");
}

function addPlacedAvatar(look) {
  const sprite = characterSprites[look];
  const items = sceneItems();
  const id = nextPlacedId++;
  
  const scrollX = sceneStage.scrollLeft || 0;
  const viewW = sceneStage.clientWidth;

  items.push({
    id,
    kind: "avatar",
    look,
    left: scrollX + viewW / 2 - sprite.sceneW / 2,
    top: 170,
    width: sprite.sceneW,
    height: sprite.sceneH,
  });
  selectedItemId = id;
  scheduleSelectionClear(4200);
  renderScene();
  playPop();
  recordCategoryProgress(currentCategory);
  showToast("Personagem entrou!");
}

function removePlacedItem(itemId) {
  const items = sceneItems();
  const index = items.findIndex((entry) => entry.id === itemId);
  if (index >= 0) {
    items.splice(index, 1);
    if (selectedItemId === itemId) selectedItemId = null;
    clearTimeout(selectionClearTimer);
    renderScene();
    playSoftError();
    showToast("Removido.");
  }
}

function clampPlacedItem(item) {
  const contentWidth = actorLayer.offsetWidth;
  const contentHeight = actorLayer.offsetHeight;
  item.left = Math.max(0, Math.min(contentWidth - item.width, item.left));
  item.top = Math.max(12, Math.min(contentHeight - item.height, item.top));
}

function resizePlacedItem(itemId, factor) {
  const item = sceneItems().find((entry) => entry.id === itemId);
  if (!item) return;

  const ratio = item.height / item.width;
  const rect = sceneStage.getBoundingClientRect();
  const maxWidthByHeight = (rect.height - 24) / ratio;
  const maxWidth = Math.max(34, Math.min(230, maxWidthByHeight));
  const nextWidth = Math.max(34, Math.min(maxWidth, item.width * factor));
  item.width = nextWidth;
  item.height = Math.round(nextWidth * ratio);
  selectedItemId = itemId;
  clampPlacedItem(item);
  renderScene();
  markSceneProgress();
  scheduleSelectionClear();
  playPop();
  showToast(factor > 1 ? "Maior." : "Menor.");
}

function selectPlacedNode(node, itemId) {
  clearTimeout(selectionClearTimer);
  selectedItemId = itemId;
  document.querySelectorAll(".placed-item.selected").forEach((entry) => {
    entry.classList.remove("selected");
  });
  node.classList.add("selected");
}

function beginDrag(event, itemId, node) {
  const items = sceneItems();
  const item = items.find((entry) => entry.id === itemId);
  if (!item) return;

  selectPlacedNode(node, itemId);
  
  const startX = event.clientX;
  const startY = event.clientY;
  const initialLeft = parseFloat(item.left) || 0;
  const initialTop = parseFloat(item.top) || 0;

  dragState = {
    item,
    node,
    moved: false,
    onMove: (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.moved = true;
      
      // Calculate new position
      const newLeft = initialLeft + dx;
      const newTop = initialTop + dy;
      
      // Update the state object immediately
      item.left = newLeft;
      item.top = newTop;
      
      // Apply limits to the style (clamping visually)
      const maxX = actorLayer.offsetWidth - item.width;
      const maxY = actorLayer.offsetHeight - item.height;
      const clampedLeft = Math.max(0, Math.min(maxX, newLeft));
      const clampedTop = Math.max(0, Math.min(maxY, newTop));
      
      node.style.left = `${clampedLeft}px`;
      node.style.top = `${clampedTop}px`;
      
      // Also update the state with clamped values for the final save
      item.left = clampedLeft;
      item.top = clampedTop;
    },
    onEnd: () => {
      if (dragState.moved) {
        lastDragEndedAt = Date.now();
        markSceneProgress();
      }
      dragState = null;
    }
  };
  node.setPointerCapture(event.pointerId);
}

function beginPan(event) {
  const startX = event.clientX;
  const initialScroll = sceneStage.scrollLeft;

  panState = {
    onMove: (e) => {
      const dx = e.clientX - startX;
      sceneStage.scrollLeft = initialScroll - dx;
    },
    onEnd: () => {
      panState = null;
    }
  };
  sceneStage.setPointerCapture(event.pointerId);
}

function renderAvatarCard(look) {
  return `<div class="avatar-card sprite-avatar" style="${characterSpriteStyle(look)}"></div>`;
}

function renderRoomTabs() {
  roomTabs.innerHTML = "";
  const roomIconMap = {
    Quarto: "🛏️",
    Sala: "🛋️",
    Cozinha: "🍳",
    "Refeitório": "🍱",
    "Pátio": "⚽",
    "Recepção": "💗",
    Consulta: "🩺",
    Moda: "👗",
    Brinquedos: "🧸",
    Vitrines: "🛍️",
    Praça: "🍭",
    Piquenique: "🧺",
    Brincar: "🎠",
    Deck: "🌴",
    Boias: "🦩",
  };
  places[currentPlace].rooms.forEach((room) => {
    const button = document.createElement("button");
    button.className = `room-tab${room === currentRoom ? " active" : ""}`;
    button.textContent = roomIconMap[room] || room[0];
    button.title = room;
    button.addEventListener("click", () => requestRoom(room));
    roomTabs.appendChild(button);
  });
}

function renderScene() {
  const sceneClassMap = {
    Casa: "scene-casa",
    Escola: "scene-escola",
    Hospital: "scene-hospital",
    Loja: "scene-loja",
    Shopping: "scene-shopping",
    Parque: "scene-parque",
    Piscina: "scene-piscina",
  };

  const sceneFileMap = {
    Casa: "house-scene.png",
    Escola: "school-scene.png",
    Hospital: "hospital-scene.png",
    Loja: "shop-scene.png",
    Shopping: "shopping-scene.png",
    Parque: "park-scene.png",
    Piscina: "pool-scene.png",
  };

  const stageThemeMap = {
    Casa: "theme-casa",
    Escola: "theme-escola",
    Hospital: "theme-hospital",
    Loja: "theme-loja",
    Shopping: "theme-shopping",
    Parque: "theme-parque",
    Piscina: "theme-piscina",
  };

  const illustratedPlaces = new Set(["Casa", "Escola", "Hospital", "Loja", "Shopping", "Parque", "Piscina"]);
  const stageClasses = [stageThemeMap[currentPlace]];
  if (illustratedPlaces.has(currentPlace)) {
    stageClasses.push("illustrated-stage");
  }
  sceneStage.className = stageClasses.join(" ");

  const contentWidth = "200%"; 
  sceneLayer.style.width = contentWidth;
  actorLayer.style.width = contentWidth;

  const roomSlug = currentRoom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const roomClass = `room-${roomSlug}`;
  const roomImgUrl = `assets/illustrated/rooms/${currentPlace.toLowerCase()}-${roomSlug}.png`;
  const fallbackFile = sceneFileMap[currentPlace] || `${currentPlace.toLowerCase()}-scene.png`;
  
  sceneLayer.innerHTML = `<div class="stage-illustration ${sceneClassMap[currentPlace]} ${roomClass}" style="background-image: url('${roomImgUrl}'), url('assets/illustrated/${fallbackFile}'); background-size: 200% 100%, cover;"></div>`;
  
  actorLayer.innerHTML = "";
  sceneItems().forEach((item) => {
    const node = document.createElement("div");
    node.className = `placed-item${item.kind === "avatar" ? " placed-avatar" : ""}${item.id === selectedItemId ? " selected" : ""}`;
    node.dataset.id = item.id;
    node.style.left = `${item.left}px`;
    node.style.top = `${item.top}px`;
    node.style.width = `${item.width}px`;
    node.style.height = `${item.height}px`;
    node.innerHTML = item.kind === "avatar"
      ? `<div class="avatar-card sprite-avatar scene-avatar" style="${characterSpriteStyle(item.look, true, true)}"></div>`
      : `<span class="item-sprite scene-sprite" style="${spriteStyle(item.itemId, true, true)}"></span>`;
    const controls = document.createElement("div");
    controls.className = "item-controls";
    [
      { className: "resize-small", label: "-", title: "Diminuir", action: () => resizePlacedItem(item.id, 0.85) },
      { className: "remove-item", label: "x", title: "Apagar", action: () => removePlacedItem(item.id) },
      { className: "resize-large", label: "+", title: "Aumentar", action: () => resizePlacedItem(item.id, 1.18) },
    ].forEach((control) => {
      const button = document.createElement("button");
      button.className = control.className;
      button.type = "button";
      button.textContent = control.label;
      button.title = control.title;
      button.setAttribute("aria-label", control.title);
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        control.action();
      });
      controls.appendChild(button);
    });
    node.addEventListener("click", (event) => {
      if (event.target.closest(".item-controls")) return;
      if (Date.now() - lastDragEndedAt < 180) return;
      runWithRandomQuiz(() => showToast("Pode brincar!"), TOUCH_QUIZ_CHANCE);
    });
    node.appendChild(controls);
    actorLayer.appendChild(node);
  });
  if (illustratedPlaces.has(currentPlace)) {
    return;
  }
  actors[currentPlace].forEach((actor) => {
    const node = document.createElement("div");
    node.className = "actor";
    node.style.left = actor.left;
    node.style.top = actor.top;
    node.innerHTML = renderAvatarCard(actor.look);
    actorLayer.appendChild(node);
  });
}

function renderDrawer() {
  drawerCards.innerHTML = "";
  drawerCatalog[currentCategory].forEach((entry) => {
    const button = document.createElement("button");
    button.className = "drawer-card";
    if (currentCategory === "pessoas" || currentCategory === "pets") {
      button.innerHTML = renderAvatarCard(entry);
      button.addEventListener("click", () => runWithRandomQuiz(() => addPlacedAvatar(entry)));
    } else {
      button.classList.add("item-card");
      button.innerHTML = `<span class="item-sprite drawer-sprite" style="${spriteStyle(entry)}"></span>`;
      button.addEventListener("click", () => runWithRandomQuiz(() => addPlacedSprite(entry)));
    }
    drawerCards.appendChild(button);
  });
}

function openPlace(name, meta) {
  currentPlace = name;
  mapModal.classList.remove("open");
  changeRoom(meta.rooms[0]);
  playHappy();
  markSceneProgress();
  showToast(`${name} aberto!`);
}

function renderMap() {
  mapGrid.innerHTML = "";
  Object.entries(places).forEach(([name, meta]) => {
    const button = document.createElement("button");
    const isUnlocked = progress.unlockedPlaces.includes(name) || meta.unlockCost === 0;
    button.className = "map-place" + (isUnlocked ? "" : " locked");
    if (isUnlocked) {
      button.textContent = `${meta.icon} ${name}`;
      button.addEventListener("click", () => {
        runWithRandomQuiz(() => openPlace(name, meta));
      });
    } else {
      button.textContent = `🔒 ${name} (${meta.unlockCost}⭐)`;
      button.addEventListener("click", () => {
        if (stats.stars >= meta.unlockCost) {
          stats.stars -= meta.unlockCost;
          progress.unlockedPlaces.push(name);
          starCount.textContent = String(stats.stars);
          saveProgress();
          playVictory();
          showToast(`${name} desbloqueado!`);
          speak(`${name} desbloqueado`);
          renderMap();
        } else {
          playSoftError();
          showToast(`Precisa de ${meta.unlockCost} estrelas!`);
        }
      });
    }
    mapGrid.appendChild(button);
  });
}

function normalizeAnswer(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function isCorrectAnswer(quiz, value) {
  const normalizedValue = normalizeAnswer(value);
  const accepted = quiz.accepted || [quiz.answer];
  return accepted.some((entry) => normalizeAnswer(entry) === normalizedValue);
}

function completeQuizSuccess() {
  const successAction = pendingQuizAction;
  trackEvent('level_complete', { stars_earned: 2, current_stars: stats.stars + 2 });
  stats.stars += 2;
  progress.quizzes += 1;
  progress.correct += 1;
  starCount.textContent = String(stats.stars);
  if (pendingRoom && !successAction) currentRoom = pendingRoom;
  pendingRoom = null;
  pendingQuizAction = null;
  quizModal.classList.remove("open");
  if (successAction) {
    successAction();
  } else {
    renderRoomTabs();
    renderScene();
  }
  playHappy();
  if (progress.correct >= 5) unlockAchievement("reader", "Leitora");
  if (progress.correct >= 20) unlockAchievement("scholar", "Estudiosa");
  if (progress.quizzes >= 30) unlockAchievement("persistent", "Persistente");
  const fb = document.getElementById("quiz-feedback");
  if (fb) { fb.textContent = "🎉 Muito bem!"; fb.style.color = "#1a6b3a"; }
  saveProgress();
  showToast("Acertou!");
  speak("Muito bem");
}

function handleQuizWrong(btnEl) {
  progress.quizzes += 1;
  saveProgress();
  playSoftError();
  if (btnEl) {
    btnEl.classList.add("wrong");
    setTimeout(() => btnEl.classList.remove("wrong"), 600);
  }
  const fb = document.getElementById("quiz-feedback");
  if (fb) { fb.textContent = "Tente de novo!"; fb.style.color = "#e44"; }
  showToast("Tente de novo.");
  speak("Tente de novo");
}

function pickQuiz() {
  const useWriting = Math.random() < 0.45;
  const bank = useWriting ? writeQuizBank : choiceQuizBank;
  const quiz = bank[Math.floor(Math.random() * bank.length)];
  return { ...quiz, type: useWriting ? "write" : "choice" };
}

function showQuizMode(mode) {
  const writingMode = mode === "write";
  quizOptions.hidden = writingMode;
  quizWrite.hidden = !writingMode;
  quizOptions.classList.toggle("hidden", writingMode);
  quizWrite.classList.toggle("open", writingMode);
}

function openQuiz(nextRoom = null, onSuccess = null) {
  const quiz = pickQuiz();
  pendingRoom = nextRoom;
  pendingQuizAction = onSuccess;
  lastQuizText = quiz.q;
  quizQuestion.textContent = quiz.q;
  quizOptions.innerHTML = "";
  quizAnswer.value = "";
  quizSubmit.onclick = null;
  quizAnswer.onkeydown = null;

  if (quiz.type === "write") {
    showQuizMode("write");
    quizSubmit.onclick = () => {
      if (isCorrectAnswer(quiz, quizAnswer.value)) {
        completeQuizSuccess();
      } else {
        quizAnswer.select();
        handleQuizWrong(null);
      }
    };
    quizAnswer.onkeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        quizSubmit.click();
      }
    };
    setTimeout(() => quizAnswer.focus(), 260);
  } else {
    showQuizMode("choice");
    quiz.options
      .slice()
      .sort(() => Math.random() - 0.5)
      .forEach((option) => {
        const button = document.createElement("button");
        button.className = "quiz-option";
        button.textContent = option;
        button.addEventListener("click", () => {
          if (option === quiz.answer) {
            button.classList.add("correct");
            setTimeout(() => completeQuizSuccess(), 500);
          } else {
            handleQuizWrong(button);
          }
        });
        quizOptions.appendChild(button);
      });
  }
  quizModal.classList.add("open");
  playPop();
  speak(quiz.q);
}

function changeRoom(room) {
  currentRoom = room;
  sceneStage.scrollLeft = 0;
  renderRoomTabs();
  renderScene();

  playPop();
  markSceneProgress();
  showToast(room);
  speak(room);
}

function requestRoom(room) {
  if (room === currentRoom) return;
  runWithRandomQuiz(() => changeRoom(room));
}

document.getElementById("map-btn").addEventListener("click", () => {
  clearSelection();
  mapModal.classList.add("open");
});

document.getElementById("gift-btn").addEventListener("click", () => {
  stats.stars += 1;
  starCount.textContent = String(stats.stars);
  playVictory();
  saveProgress();
  showToast("Surpresa!");
});

progressBtn.addEventListener("click", () => {
  updateProgressPanel();
  progressModal.classList.add("open");
  playPop();
});

progressClose.addEventListener("click", () => {
  progressModal.classList.remove("open");
});

aboutBtn.addEventListener("click", () => {
  aboutModal.classList.add("open");
  playPop();
});

aboutClose.addEventListener("click", () => {
  aboutModal.classList.remove("open");
});

openQuizBtn.addEventListener("click", () => openQuiz());

drawerToggle.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleDrawer();
});

soundBtn.addEventListener("click", () => {
  soundEnabled = true;
  soundBtn.textContent = "🔊";
  getAudioContext();
  playHappy();
  setTimeout(() => speak(`Som ligado. ${currentPlace}. ${currentRoom}.`), 120);
  showToast("Som ligado.");
});

drawerCats.forEach((button) => {
  button.addEventListener("click", () => {
    setDrawerCollapsed(false);
    clearSelection();
    drawerCats.forEach((entry) => entry.classList.remove("active"));
    button.classList.add("active");
    currentCategory = button.dataset.cat;
    renderDrawer();
    drawerCards.scrollLeft = 0;
    playPop();
  });
});

drawerPrev.addEventListener("click", () => {
  setDrawerCollapsed(false);
  drawerCards.scrollBy({ left: -220, behavior: "smooth" });
});

drawerNext.addEventListener("click", () => {
  setDrawerCollapsed(false);
  drawerCards.scrollBy({ left: 220, behavior: "smooth" });
});

drawerCards.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    drawerCards.scrollLeft += event.deltaY;
    event.preventDefault();
  }
}, { passive: false });

quizRepeat.addEventListener("click", () => {
  playPop();
  if (lastQuizText) speak(lastQuizText);
});

quizClose.addEventListener("click", () => {
  pendingRoom = null;
  pendingQuizAction = null;
  quizAnswer.value = "";
  showQuizMode("choice");
  quizModal.classList.remove("open");
});

mapModal.addEventListener("click", (event) => {
  if (event.target === mapModal) mapModal.classList.remove("open");
});

progressModal.addEventListener("click", (event) => {
  if (event.target === progressModal) progressModal.classList.remove("open");
});

aboutModal.addEventListener("click", (event) => {
  if (event.target === aboutModal) aboutModal.classList.remove("open");
});

sceneStage.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".placed-item")) {
    clearSelection();
  }
});

window.addEventListener("pointermove", (event) => {
  if (dragState) dragState.onMove(event);
  else if (panState) panState.onMove(event);
});
window.addEventListener("pointerup", () => {
  if (dragState) dragState.onEnd();
  if (panState) panState.onEnd();
});
window.addEventListener("pointercancel", () => {
  if (dragState) dragState.onEnd();
  if (panState) panState.onEnd();
});
sceneStage.addEventListener("pointerdown", (event) => {
  const itemNode = event.target.closest(".placed-item");
  const controls = event.target.closest(".item-controls");
  
  if (itemNode && !controls) {
    beginDrag(event, parseInt(itemNode.dataset.id), itemNode);
  } else {
    beginPan(event);
  }
});
document.addEventListener("pointerdown", () => getAudioContext(), { once: true, passive: true });
document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".placed-item")) {
    clearSelection();
  }
}, { capture: true });

document.addEventListener("gesturestart", (event) => event.preventDefault());
document.addEventListener("dblclick", (event) => {
  if (!event.target.closest("input")) event.preventDefault();
}, { passive: false });

loadProgress();
starCount.textContent = String(stats.stars);
registerServiceWorker();
watchCriticalAssets();
renderRoomTabs();
renderScene();
renderDrawer();
renderMap();
markSceneProgress();

const versionEl = document.getElementById("app-version");
if (versionEl) versionEl.textContent = APP_VERSION;

function checkOffline() {
  const offlineScreen = document.getElementById("offline-screen");
  if (!offlineScreen) return;
  if (!navigator.onLine) {
    offlineScreen.classList.add("show");
  }
}
window.addEventListener("offline", checkOffline);
window.addEventListener("online", () => {
  const offlineScreen = document.getElementById("offline-screen");
  if (offlineScreen) offlineScreen.classList.remove("show");
});
const offlineDismiss = document.getElementById("offline-dismiss");
if (offlineDismiss) {
  offlineDismiss.addEventListener("click", () => {
    document.getElementById("offline-screen").classList.remove("show");
  });
}

function initCapacitor() {
  if (!window.Capacitor?.isNativePlatform()) return;
  const { StatusBar, SplashScreen } = window.Capacitor.Plugins;
  if (StatusBar) {
    StatusBar.setBackgroundColor({ color: "#fff0f8" }).catch(() => {});
    StatusBar.setStyle({ style: "LIGHT" }).catch(() => {});
  }
  if (SplashScreen) {
    SplashScreen.hide().catch(() => {});
  }
  if (screen.orientation?.lock) {
    screen.orientation.lock("portrait").catch(() => {});
  }
}

const adMobConfig = {
  appId: "ca-app-pub-3366407431216875~3117070772",
  bannerId: "ca-app-pub-3366407431216875/1301426225",
  interstitialId: "ca-app-pub-3366407431216875/6356715894",
  rewardedId: "ca-app-pub-3366407431216875/1295960909",
};

let adMobReady = false;
let bannerVisible = false;
let lastInterstitialAt = 0;
let interstitialCount = 0;
let rewardedLoaded = false;
let interstitialLoaded = false;
const INTERSTITIAL_COOLDOWN_MS = 180000;
const MAX_INTERSTITIALS_PER_SESSION = 4;
const MIN_ACTIONS_BEFORE_INTERSTITIAL = 8;

function getAdMob() {
  if (!window.Capacitor?.isNativePlatform()) return null;
  return window.Capacitor?.Plugins?.AdMob || null;
}

async function initAdMob() {
  const AdMob = getAdMob();
  if (!AdMob) return;
  try {
    await AdMob.initialize({
      requestTrackingAuthorization: false,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
      maxAdContentRating: "G",
    });
    adMobReady = true;
    AdMob.addListener("onRewardedVideoAdLoaded", () => { rewardedLoaded = true; });
    AdMob.addListener("onRewardedVideoAdFailedToLoad", () => { rewardedLoaded = false; });
    AdMob.addListener("onInterstitialAdLoaded", () => { interstitialLoaded = true; });
    AdMob.addListener("onInterstitialAdFailedToLoad", () => { interstitialLoaded = false; });
    preloadRewarded();
    preloadInterstitial();
  } catch (e) {
    adMobReady = false;
  }
}

function showBannerAd() {
  if (!adMobReady || bannerVisible) return;
  const AdMob = getAdMob();
  if (!AdMob) return;
  AdMob.showBanner({
    adId: adMobConfig.bannerId,
    adSize: "BANNER",
    position: "BOTTOM_CENTER",
    isTesting: false,
    npa: true,
  }).then(() => {
    bannerVisible = true;
  }).catch(() => {
    bannerVisible = false;
  });
}

function hideBannerAd() {
  if (!bannerVisible) return;
  const AdMob = getAdMob();
  if (!AdMob) return;
  AdMob.hideBanner().then(() => {
    bannerVisible = false;
  }).catch(() => {});
}

function preloadRewarded() {
  const AdMob = getAdMob();
  if (!AdMob) return;
  AdMob.prepareRewardVideoAd({
    adId: adMobConfig.rewardedId,
    isTesting: false,
    npa: true,
  }).catch(() => { rewardedLoaded = false; });
}

function isRewardedReady() {
  return adMobReady && rewardedLoaded;
}

function showRewardedAd(onReward, onFail) {
  const AdMob = getAdMob();
  if (!AdMob || !rewardedLoaded) {
    if (onFail) onFail();
    return;
  }
  let rewardHandlerPromise = null;
  let closeHandlerPromise = null;

  const removeHandlers = async () => {
    try {
      const rewardH = await rewardHandlerPromise;
      if (rewardH) rewardH.remove();
    } catch (e) {}
    try {
      const closeH = await closeHandlerPromise;
      if (closeH) closeH.remove();
    } catch (e) {}
  };

  rewardHandlerPromise = AdMob.addListener("onRewarded", () => {
    if (onReward) onReward();
    removeHandlers();
    rewardedLoaded = false;
    setTimeout(preloadRewarded, 2000);
  });
  closeHandlerPromise = AdMob.addListener("onRewardedVideoAdClosed", () => {
    removeHandlers();
    rewardedLoaded = false;
    setTimeout(preloadRewarded, 2000);
  });
  AdMob.showRewardVideoAd().catch(() => {
    removeHandlers();
    rewardedLoaded = false;
    if (onFail) onFail();
    setTimeout(preloadRewarded, 5000);
  });
}

function preloadInterstitial() {
  const AdMob = getAdMob();
  if (!AdMob) return;
  AdMob.prepareInterstitial({
    adId: adMobConfig.interstitialId,
    isTesting: false,
    npa: true,
  }).catch(() => { interstitialLoaded = false; });
}

function canShowInterstitial() {
  if (!adMobReady || !interstitialLoaded) return false;
  if (interstitialCount >= MAX_INTERSTITIALS_PER_SESSION) return false;
  if (progress.actions < MIN_ACTIONS_BEFORE_INTERSTITIAL) return false;
  if (Date.now() - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return false;
  return true;
}

function tryShowInterstitial() {
  if (!canShowInterstitial()) return false;
  const AdMob = getAdMob();
  if (!AdMob) return false;
  
  let closeHandlerPromise = null;

  const removeHandler = async () => {
    try {
      const closeH = await closeHandlerPromise;
      if (closeH) closeH.remove();
    } catch (e) {}
  };

  closeHandlerPromise = AdMob.addListener("onInterstitialAdClosed", () => {
    removeHandler();
    interstitialLoaded = false;
    setTimeout(preloadInterstitial, 3000);
  });
  AdMob.showInterstitial().then(() => {
    lastInterstitialAt = Date.now();
    interstitialCount++;
    interstitialLoaded = false;
  }).catch(() => {
    removeHandler();
    interstitialLoaded = false;
    setTimeout(preloadInterstitial, 5000);
  });
  return true;
}

const _origMapOpen = mapModal.classList.add.bind(mapModal.classList);
mapModal.addEventListener("transitionend", () => {
  if (mapModal.classList.contains("open")) showBannerAd();
});

const modalsWithBanner = [mapModal, progressModal, aboutModal];
modalsWithBanner.forEach((modal) => {
  const observer = new MutationObserver(() => {
    const anyOpen = modalsWithBanner.some((m) => m.classList.contains("open"));
    if (!anyOpen) hideBannerAd();
  });
  observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
});

const giftBtnOriginal = document.getElementById("gift-btn");
if (giftBtnOriginal) {
  const giftBtn = giftBtnOriginal.cloneNode(true);
  giftBtnOriginal.parentNode.replaceChild(giftBtn, giftBtnOriginal);
  giftBtn.addEventListener("click", () => {
    if (isRewardedReady()) {
      showToast("Assista para ganhar estrelas!");
      showRewardedAd(
        () => {
          stats.stars += 5;
          starCount.textContent = String(stats.stars);
          playVictory();
          saveProgress();
          showToast("🎉 +5 estrelas!");
          speak("Parabéns, cinco estrelas");
        },
        () => {
          stats.stars += 1;
          starCount.textContent = String(stats.stars);
          playHappy();
          saveProgress();
          showToast("🎁 +1 estrela!");
        }
      );
    } else {
      stats.stars += 1;
      starCount.textContent = String(stats.stars);
      playVictory();
      saveProgress();
      showToast("🎁 Surpresa!");
    }
  });
}

const _origOpenPlace = openPlace;
openPlace = function(name, meta) {
  trackEvent('level_start', { place_name: name });
  trackEvent('page_view', { page_path: `/place/${name}`, page_title: name });
  _origOpenPlace(name, meta);
  tryShowInterstitial();
};

function requestFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

function hideLoadingScreen() {
  trackEvent('app_open');
  trackEvent('game_start');
  setTimeout(() => {
    loadingScreen.classList.add("hide");
    initCapacitor();
    initAdMob();
    checkOffline();
  }, 1000);
}

hideLoadingScreen();
