/**
 * download.js
 * Version: v1.100 - Stub web-safe (chrome.downloads)
 */

if (typeof chrome === "undefined" || !chrome.downloads) {
  console.log(
    "download.js: API chrome.downloads indisponible → aucune action."
  );
} else {
  console.log("download.js: Contexte extension Chrome.");
  // chrome.downloads.onCreated.addListener((downloadItem) => { ... });
}
