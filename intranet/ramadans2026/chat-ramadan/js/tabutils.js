/**
 * tabutils.js
 * Version: v1.102 - Stub web-safe + shim chrome.tabs
 */

const TABUTILS_VERSION = "v1.102";
const hasChromeTabs =
  typeof chrome !== "undefined" &&
  chrome.tabs &&
  chrome.tabs.onUpdated &&
  typeof chrome.tabs.onUpdated.addListener === "function";

if (!hasChromeTabs) {
  const onUpdatedShim = {
    addListener: () => {},
    removeListener: () => {},
    hasListeners: () => false
  };

  const baseChrome = typeof window !== "undefined" ? window.chrome || {} : {};
  baseChrome.tabs = baseChrome.tabs || {};
  baseChrome.tabs.onUpdated = baseChrome.tabs.onUpdated || onUpdatedShim;

  if (typeof window !== "undefined") {
    window.chrome = baseChrome;
  }

  console.log(
    `tabutils.js ${TABUTILS_VERSION}: API chrome.tabs.onUpdated absente → shim neutre installé.`
  );
} else {
  console.log(`tabutils.js ${TABUTILS_VERSION}: Contexte extension Chrome (tabs disponible).`);
  // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { ... });
}
