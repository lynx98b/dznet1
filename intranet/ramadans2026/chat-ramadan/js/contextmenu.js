/**
 * contextmenu.js
 * Version: v1.101 - Stub web-safe (chrome.contextMenus)
 */

const hasContextMenu =
  typeof chrome !== "undefined" &&
  chrome.contextMenus &&
  chrome.contextMenus.onClicked &&
  typeof chrome.contextMenus.onClicked.addListener === "function";

if (!hasContextMenu) {
  console.log(
    "contextmenu.js: API chrome.contextMenus.onClicked indisponible → aucune action."
  );
} else {
  console.log("contextmenu.js: Contexte extension Chrome (contextMenus disponible).");
  // chrome.contextMenus.onClicked.addListener((info, tab) => { ... });
}
