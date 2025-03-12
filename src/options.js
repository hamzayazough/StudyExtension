const API_URL = "http://localhost:4000/graphql";

window.onload = () => {
    const saveButton = document.getElementById("saveUser");
    const usernameInput = document.getElementById("usernameInput");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const statusText = document.getElementById("status");

    if (!saveButton || !usernameInput || !apiKeyInput || !statusText) {
        console.error("❌ Missing elements in options.html!");
        return;
    }

    saveButton.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!username) {
            statusText.innerText = "❌ Please enter a username.";
            return;
        }

        if (!apiKey) {
            statusText.innerText = "❌ Please enter a valid API key.";
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `mutation { authenticateUser(username: "${username}") { id username } }`
                }),
            });

            const result = await response.json();
            const user = result.data.authenticateUser;

            if (user) {
                chrome.storage.sync.set({ 
                    apiKey, 
                    userId: user.id, 
                    username: user.username 
                }, () => {
                    console.log("✅ API Key and User stored successfully!");
                    statusText.innerText = "✅ User and API Key saved!";
                    setTimeout(() => window.close(), 1000);
                });
            } else {
                throw new Error("Failed to authenticate user.");
            }
        } catch (error) {
            console.error("❌ Error:", error);
            statusText.innerText = "❌ Failed to save. Check console for details.";
        }
    });

    chrome.storage.sync.get(["username", "apiKey"], (data) => {
        if (data.username) usernameInput.value = data.username;
        if (data.apiKey) apiKeyInput.value = data.apiKey;
    });
};
