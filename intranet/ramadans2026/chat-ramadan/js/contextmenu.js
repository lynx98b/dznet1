/**
 * contextmenu.js
 * Version: v1.100 - Stub web-safe (chrome.contextMenus)
 */

if (typeof chrome === "undefined" || !chrome.contextMenus) {
  console.log(
    "contextmenu.js: API chrome.contextMenus indisponible → aucune action."
  );
} else {
  console.log("contextmenu.js: Contexte extension Chrome.");
  // chrome.contextMenus.onClicked.addListener((info, tab) => { ... });
}
