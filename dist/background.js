/******/ (() => { // webpackBootstrap
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "getMoreInfo",
    title: "Get more info",
    contexts: ["selection"] // Only show when text is selected
  });
});
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "getMoreInfo" && info.selectionText) {
    chrome.storage.sync.set({
      selectedText: info.selectionText
    }, function () {
      console.log("✅ Selected text saved:", info.selectionText);

      // Try injecting the script
      chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        files: ["content.js"]
      }).then(function () {
        return console.log("✅ content.js injection attempted");
      })["catch"](function (err) {
        return console.error("❌ content.js injection failed:", err);
      });
    });
  } else {
    console.error("❌ No text selected or incorrect menu ID.");
  }
});
/******/ })()
;