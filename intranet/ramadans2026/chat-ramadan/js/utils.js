/**
 * utils.js
 * Version: v1.101 - Stub web-safe (pour éviter les erreurs chrome.*)
 */

const hasChrome = typeof chrome !== "undefined";
const hasStorage =
  hasChrome &&
  chrome.storage &&
  typeof chrome.storage.onChanged === "object" &&
  typeof chrome.storage.onChanged.addListener === "function";

if (!hasStorage) {
  console.log("utils.js: API chrome.storage.onChanged indisponible → aucune action.");
} else {
  console.log("utils.js: Contexte extension Chrome (storage disponible).");
  // Ici tu peux remettre ton code spécifique extension si besoin
}
