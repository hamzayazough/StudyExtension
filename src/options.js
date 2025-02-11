console.log("🟢 options.js loaded successfully!");

window.onload = () => {
    const saveButton = document.getElementById("saveApiKey");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const statusText = document.getElementById("status");

    if (!saveButton || !apiKeyInput || !statusText) {
        console.error("❌ Missing elements in options.html!");
        return;
    }

    saveButton.addEventListener("click", () => {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            statusText.innerText = "❌ Please enter a valid API key.";
            return;
        }

        chrome.storage.sync.set({ apiKey }, () => {
            chrome.storage.sync.get("apiKey", (data) => {
              console.log("📦 API Key stored:", data.apiKey);
            });
          
            statusText.innerText = "✅ API Key saved successfully!";
            setTimeout(() => window.close(), 1000);
          });
          
    });

    chrome.storage.sync.get("apiKey", (data) => {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
    });
};
