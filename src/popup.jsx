import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./popup.css";

const Popup = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    try {
      if (chrome?.storage) {
        chrome.storage.sync.get(["selectedText", "apiKey"], (data) => {
          if (chrome.runtime.lastError) {
            setError("⚠️ Error accessing storage: " + chrome.runtime.lastError.message);
            return;
          }

          if (!data.apiKey) {
            setShowApiKeyInput(true);
          } else {
            setApiKey(data.apiKey);
            setShowApiKeyInput(false);
          }

          if (data.selectedText) {
            setMessages([{ role: "user", content: data.selectedText }]);
          }
        });
      } else {
        setError("❌ chrome.storage is undefined! Ensure permissions in manifest.json.");
      }
    } catch (err) {
      setError("❌ Unexpected error: " + err.message);
    }
  }, []);

  const saveApiKey = () => {
    if (!text.trim()) return;
    chrome.storage.sync.set({ apiKey: text.trim() }, () => {
      setApiKey(text.trim());
      setShowApiKeyInput(false);
      setText("");
    });
  };

  const fetchAIResponse = async () => {
    if (!apiKey) {
      alert("❌ Please set your API key in the extension settings.");
      return;
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: "gpt-4", messages }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const aiMessage = data.choices?.[0]?.message?.content || "No response.";
      setMessages([...messages, { role: "assistant", content: aiMessage }]);
    } catch (error) {
      setError("⚠️ Failed to fetch AI response: " + error.message);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <span>New Convo</span>
          <button className="close-button" onClick={() => document.getElementById("ai-popup-root")?.remove()}>
            ✖
          </button>
        </div>

        {showApiKeyInput ? (
          <div className="api-key-container">
            <h3>🔑 Enter OpenAI API Key</h3>
            <input
              type="text"
              placeholder="Enter API key..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="save-api-button" onClick={saveApiKey}>
              Save Key
            </button>
          </div>
        ) : (
          <>
            {error && <div className="error-box">{error}</div>}

            <div className="chat-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role === "user" ? "user-message" : "ai-message"}`}>
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="popup-input">
              <input type="text" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
              <button onClick={fetchAIResponse}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const rootElement = document.getElementById("ai-popup-root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Popup />);
} else {
  console.error("❌ Failed to find #ai-popup-root for mounting.");
}
