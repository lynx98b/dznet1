/**
 * utils.js
 * Version: v1.100 - Stub web-safe (pour éviter les erreurs chrome.*)
 */

if (typeof chrome === "undefined") {
  console.log("utils.js: Exécution hors extension Chrome → aucune action.");
} else {
  console.log("utils.js: Contexte extension Chrome.");
  // Ici tu peux remettre ton code spécifique extension si besoin
}
