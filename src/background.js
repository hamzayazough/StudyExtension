chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["apiKey"], (data) => {
    if (!data.apiKey) {
      console.log("🔑 No API key found! Initializing empty API key.");
      chrome.storage.sync.set({ apiKey: "" }, () => {
        console.log("✅ Empty API key initialized.");
        chrome.runtime.openOptionsPage();
      });
    }
  });
});


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "getMoreInfo",
    title: "Get more info",
    contexts: ["selection"],
  });
  chrome.action.disable();

});



chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getMoreInfo" && info.selectionText) {
    chrome.storage.sync.set({ selectedText: info.selectionText }, () => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error saving selectedText:", chrome.runtime.lastError);
      } else {
        console.log("✅ Selected text saved:", info.selectionText);
      }

      chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 400,
        height: 500,
      });
    });
  }
});
