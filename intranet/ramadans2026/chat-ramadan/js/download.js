/**
 * download.js
 * Version: v1.102 - Stub web-safe + shim chrome.downloads
 */

const DOWNLOAD_VERSION = "v1.102";
const hasDownloads =
  typeof chrome !== "undefined" &&
  chrome.downloads &&
  chrome.downloads.onCreated &&
  typeof chrome.downloads.onCreated.addListener === "function";

if (!hasDownloads) {
  const onCreatedShim = {
    addListener: () => {},
    removeListener: () => {},
    hasListeners: () => false
  };

  const baseChrome = typeof window !== "undefined" ? window.chrome || {} : {};
  baseChrome.downloads = baseChrome.downloads || {};
  baseChrome.downloads.onCreated = baseChrome.downloads.onCreated || onCreatedShim;

  if (typeof window !== "undefined") {
    window.chrome = baseChrome;
  }

  console.log(
    `download.js ${DOWNLOAD_VERSION}: API chrome.downloads.onCreated absente → shim neutre installé.`
  );
} else {
  console.log(`download.js ${DOWNLOAD_VERSION}: Contexte extension Chrome (downloads disponible).`);
  // chrome.downloads.onCreated.addListener((downloadItem) => { ... });
}
