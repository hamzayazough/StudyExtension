console.log("✅ content.js loaded");

// Prevent duplicate popups
if (document.getElementById("ai-popup-root")) {
    console.log("🛑 Popup already exists, removing it...");
    document.getElementById("ai-popup-root").remove();
}

// Retrieve selected text from storage
chrome.storage.sync.get("selectedText", (data) => {
    if (!data.selectedText) {
        console.error("❌ No selected text found in storage.");
        return;
    }
    console.log("✅ Selected text retrieved:", data.selectedText);

    // Create a root div for React
    const popupContainer = document.createElement("div");
    popupContainer.id = "ai-popup-root";
    document.body.appendChild(popupContainer);
    console.log("✅ Popup container created.");

    // Inject the React popup script
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("popup.js");
    script.onload = () => console.log("✅ Popup script loaded successfully.");
    document.body.appendChild(script);
});
