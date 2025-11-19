/**
 * tabutils.js
 * Version: v1.100 - Stub web-safe (chrome.tabs)
 */

if (typeof chrome === "undefined" || !chrome.tabs) {
  console.log("tabutils.js: API chrome.tabs indisponible → aucune action.");
} else {
  console.log("tabutils.js: Contexte extension Chrome.");
  // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { ... });
}
