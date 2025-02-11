/******/ (() => { // webpackBootstrap
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
console.log("🟢 content.js started execution.");

// ✅ Retrieve the stored text from chrome.storage
chrome.storage.sync.get("selectedText", function (data) {
  if (chrome.runtime.lastError) {
    console.error("❌ Error accessing storage:", chrome.runtime.lastError.message);
    return;
  }
  if (!data.selectedText) {
    console.warn("ℹ️ No selected text found in storage.");
    return;
  }
  console.log("✅ Selected text retrieved:", data.selectedText);
});
/******/ })()
;