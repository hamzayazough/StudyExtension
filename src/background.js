chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
      id: "getMoreInfo",
      title: "Get more info",
      contexts: ["selection"],  // Only show when text is selected
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getMoreInfo" && info.selectionText) {
      chrome.storage.sync.set({ selectedText: info.selectionText }, () => {
          console.log("✅ Selected text saved:", info.selectionText);

          // Try injecting the script
          chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content.js"]
          }).then(() => console.log("✅ content.js injection attempted"))
            .catch(err => console.error("❌ content.js injection failed:", err));
      });
  } else {
      console.error("❌ No text selected or incorrect menu ID.");
  }
});
