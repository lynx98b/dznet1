/**
 * utils.js
 * Version: v1.102 - Stub web-safe + shim chrome.storage
 */

const UTILS_VERSION = "v1.102";
const hasChrome = typeof chrome !== "undefined";
const hasStorage =
  hasChrome &&
  chrome.storage &&
  typeof chrome.storage.onChanged === "object" &&
  typeof chrome.storage.onChanged.addListener === "function";

if (!hasStorage) {
  // Fournit un shim inoffensif pour empêcher toute erreur d'accès dans un contexte web pur
  const storageShim = {
    addListener: () => {},
    removeListener: () => {},
    hasListeners: () => false
  };

  const baseChrome = typeof window !== "undefined" ? window.chrome || {} : {};
  baseChrome.storage = baseChrome.storage || {};
  baseChrome.storage.onChanged = baseChrome.storage.onChanged || storageShim;

  if (typeof window !== "undefined") {
    window.chrome = baseChrome;
  }

  console.log(
    `utils.js ${UTILS_VERSION}: API chrome.storage.onChanged absente → shim neutre installé.`
  );
} else {
  console.log(`utils.js ${UTILS_VERSION}: Contexte extension Chrome (storage disponible).`);
  // Ici tu peux remettre ton code spécifique extension si besoin
}
