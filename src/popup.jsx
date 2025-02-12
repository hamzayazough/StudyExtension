import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Groq from "groq-sdk";
import "./popup.css";

const Popup = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groqInstance, setGroqInstance] = useState(null);

  const closePopup = () => {
    if (chrome?.windows) {
      chrome.windows.getCurrent((window) => {
        chrome.windows.remove(window.id);
      });
    } else {
      console.warn("Unable to close popup: chrome.windows API not available.");
    }
  };

  useEffect(() => {
    if (!chrome || !chrome.storage) {
      setError("Not running inside a Chrome extension!");
      return;
    }

    chrome.storage.sync.get(["selectedText", "apiKey"], (data) => {
        if (chrome.runtime.lastError) {
          setError(`Error accessing storage: ${chrome.runtime.lastError.message}`);
          return;
        }
            
        if (data.apiKey && data.apiKey.trim() !== "") {

          setApiKey(data.apiKey);

          const instance = new Groq({ apiKey: data.apiKey, dangerouslyAllowBrowser: true });
          setGroqInstance(instance);

        } else {
          console.warn("API key is empty or not found.");
          setError("API key not set. Please configure it in extension settings.");
        }  
      });    
  }, []);
  
    useEffect(() => {
        if (groqInstance && messages.length === 0) {
            chrome.storage.sync.get("selectedText", (data) => {
                if (data.selectedText) {
                    const initialMessage = { role: "user", content: data.selectedText };
                    setMessages([initialMessage]);
                    setTimeout(() => fetchAIResponse([initialMessage]), 500);
                }
            });
        }
    }, [groqInstance]); 

  const fetchAIResponse = async (currentMessages = messages) => {
    if (!apiKey || !groqInstance) {
      setError("Please set your API key in the extension settings.");
      return;
    }

    try {
      setLoading(true);

      const response = await groqInstance.chat.completions.create({
        messages: currentMessages,
        model: "llama-3.3-70b-versatile",
      });

      const aiMessage = response.choices?.[0]?.message?.content || "No response.";
      setMessages([...currentMessages, { role: "assistant", content: aiMessage }]);
    } catch (err) {
      setError(`Failed to fetch AI response: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setText("");

    fetchAIResponse(updatedMessages);
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <span>🔵 StudySimplified (Groq)</span>
          <button className="close-button" onClick={closePopup}>
            ✖
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="chat-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role === "user" ? "user-message" : "ai-message"}`}>
              {msg.content}
            </div>
          ))}
        </div>

        <div className="popup-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage} disabled={loading}>
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("ai-popup-root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Popup />);
} else {
  console.error("Failed to find #ai-popup-root for mounting.");
}
