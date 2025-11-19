/**
 * contextmenu.js
 * Version: v1.102 - Stub web-safe + shim chrome.contextMenus
 */

const CONTEXTMENU_VERSION = "v1.102";
const hasContextMenu =
  typeof chrome !== "undefined" &&
  chrome.contextMenus &&
  chrome.contextMenus.onClicked &&
  typeof chrome.contextMenus.onClicked.addListener === "function";

if (!hasContextMenu) {
  const onClickedShim = {
    addListener: () => {},
    removeListener: () => {},
    hasListeners: () => false
  };

  const baseChrome = typeof window !== "undefined" ? window.chrome || {} : {};
  baseChrome.contextMenus = baseChrome.contextMenus || {};
  baseChrome.contextMenus.onClicked = baseChrome.contextMenus.onClicked || onClickedShim;

  if (typeof window !== "undefined") {
    window.chrome = baseChrome;
  }

  console.log(
    `contextmenu.js ${CONTEXTMENU_VERSION}: API chrome.contextMenus.onClicked absente → shim neutre installé.`
  );
} else {
  console.log(
    `contextmenu.js ${CONTEXTMENU_VERSION}: Contexte extension Chrome (contextMenus disponible).`
  );
  // chrome.contextMenus.onClicked.addListener((info, tab) => { ... });
}
