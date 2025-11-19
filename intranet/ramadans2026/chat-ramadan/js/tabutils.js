/**
 * tabutils.js
 * Version: v1.101 - Stub web-safe (chrome.tabs)
 */

const hasChromeTabs =
  typeof chrome !== "undefined" &&
  chrome.tabs &&
  chrome.tabs.onUpdated &&
  typeof chrome.tabs.onUpdated.addListener === "function";

if (!hasChromeTabs) {
  console.log("tabutils.js: API chrome.tabs.onUpdated indisponible → aucune action.");
} else {
  console.log("tabutils.js: Contexte extension Chrome (tabs disponible).");
  // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { ... });
}
