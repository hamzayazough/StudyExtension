/******/ (() => { // webpackBootstrap
/*!************************!*\
  !*** ./src/options.js ***!
  \************************/
window.onload = function () {
  var saveButton = document.getElementById("saveApiKey");
  var apiKeyInput = document.getElementById("apiKeyInput");
  var statusText = document.getElementById("status");
  if (!saveButton || !apiKeyInput || !statusText) {
    console.error("❌ Missing elements in options.html!");
    return;
  }
  saveButton.addEventListener("click", function () {
    var apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      statusText.innerText = "❌ Please enter a valid API key.";
      return;
    }
    chrome.storage.sync.set({
      apiKey: apiKey
    }, function () {
      chrome.storage.sync.get("apiKey", function (data) {
        console.log("📦 API Key stored");
      });
      statusText.innerText = "✅ API Key saved successfully!";
      setTimeout(function () {
        return window.close();
      }, 1000);
    });
  });
  chrome.storage.sync.get("apiKey", function (data) {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });
};
/******/ })()
;