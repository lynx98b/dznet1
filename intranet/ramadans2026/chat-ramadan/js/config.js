/**
 * config.js
 * Version: v3.001 - Init Firebase, refs globaux, utils, rate-limit
 */

console.log("🔧 Config v3.001 - Chargement...");

// ==============================
// ⚙️ CONFIG FIREBASE
// ==============================

// ⚙️ Configuration Firebase (valeurs issues de l'ancien projet v2)
const firebaseConfig = {
  apiKey: "AIzaSyBoF6xTWr4dzgbWFwXavVC2mMshHCTK6fM",
  authDomain: "ramadan-chat-auth.firebaseapp.com",
  projectId: "ramadan-chat-auth",
  storageBucket: "ramadan-chat-auth.firebasestorage.app",
  messagingSenderId: "785976346844",
  appId: "1:785976346844:web:62b890dbc32a32596f8c19"
};

if (!firebase.apps.length) {
  window.firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
  window.firebaseApp = firebase.app();
}

window.db = firebase.firestore();
window.auth = firebase.auth();

// ==============================
// 🔗 COLLECTIONS GLOBALES
// ==============================

window.messagesRef  = window.db.collection("messages");
window.usersRef     = window.db.collection("users");
window.typingRef    = window.db.collection("typing");
window.reactionsRef = window.db.collection("reactions");

// ==============================
// 💬 GESTION UTILISATEUR GLOBAL
// ==============================

window.currentUser = null;
window.currentProfile = null;
window.selectedUser = null;

window.getCurrentUser = function () {
  return window.currentUser;
};

window.getUserProfile = function () {
  return window.currentProfile;
};

window.setSelectedUser = function (user) {
  window.selectedUser = user;
};

// ==============================
// ⏱️ RATE LIMIT
// ==============================

window.RATE_LIMIT = {
  maxMessages: 6,
  intervalMs: 60_000
};

window.messageTimestamps = [];

window.checkRateLimit = function () {
  const now = Date.now();
  const intervalStart = now - window.RATE_LIMIT.intervalMs;

  window.messageTimestamps = window.messageTimestamps.filter(
    (t) => t >= intervalStart
  );

  if (window.messageTimestamps.length >= window.RATE_LIMIT.maxMessages) {
    const remaining = Math.ceil(
      (window.messageTimestamps[0] + window.RATE_LIMIT.intervalMs - now) / 1000
    );
    const rateWarning = document.getElementById("rateWarning");
    const rateCountdown = document.getElementById("rateCountdown");
    if (rateWarning && rateCountdown) {
      rateCountdown.textContent = remaining + "s";
      rateWarning.classList.add("show");
      setTimeout(() => rateWarning.classList.remove("show"), 2000);
    }
    return false;
  }

  window.updateRateCounter &&
    window.updateRateCounter(
      window.RATE_LIMIT.maxMessages - window.messageTimestamps.length
    );
  return true;
};

window.updateRateCounter = function (remaining) {
  const el = document.getElementById("rateCounter");
  if (!el) return;
  el.textContent = `${remaining}/${window.RATE_LIMIT.maxMessages} messages`;
};

// ==============================
// 🧼 SANITIZE & BAD WORD FILTER
// ==============================

window.sanitizeHTML = function (str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

// Placeholder basique – à enrichir
const BAD_WORDS = ["con", "merde"];
window.filterBadWords = function (text) {
  let filtered = text;
  BAD_WORDS.forEach((w) => {
    const re = new RegExp(w, "gi");
    filtered = filtered.replace(re, "****");
  });
  return filtered;
};

// ==============================
// 🔊 SONS (stubs safe)
// ==============================

window.soundEnabled = true;

window.playMessageSound = function () {
  if (!window.soundEnabled) return;
  console.log("🔊 (stub) son message");
};

window.playGiftSound = function () {
  if (!window.soundEnabled) return;
  console.log("🔊 (stub) son cadeau");
};

console.log("✅ Config chargée - Firebase initialisé");
