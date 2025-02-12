chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["apiKey"], (data) => {
    if (!data.apiKey) {
      chrome.storage.sync.set({ apiKey: "" }, () => {
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
        console.error("Error saving selectedText:", chrome.runtime.lastError);
      }
      chrome.storage.sync.get("apiKey", (data) => {
        chrome.windows.create({
          url: chrome.runtime.getURL("popup.html"),
          type: "popup",
          width: 400,
          height: 500,
        });
      });
      });

  }
});
