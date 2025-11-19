/**
 * download.js
 * Version: v1.101 - Stub web-safe (chrome.downloads)
 */

const hasDownloads =
  typeof chrome !== "undefined" &&
  chrome.downloads &&
  chrome.downloads.onCreated &&
  typeof chrome.downloads.onCreated.addListener === "function";

if (!hasDownloads) {
  console.log("download.js: API chrome.downloads.onCreated indisponible → aucune action.");
} else {
  console.log("download.js: Contexte extension Chrome (downloads disponible).");
  // chrome.downloads.onCreated.addListener((downloadItem) => { ... });
}
