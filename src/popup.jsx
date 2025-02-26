import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import ReactDOM from "react-dom/client";
import Groq from "groq-sdk";
import "./popup.css";

const API_URL = "http://localhost:4000/graphql";

const Popup = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groqInstance, setGroqInstance] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [userId, setUserId] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    chrome.storage.sync.get(["selectedSubject", "userId"], (data) => {
      if (data.selectedSubject) setSelectedSubject(data.selectedSubject);
      if (data.userId) setUserId(data.userId);
    });
  }, []);

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

  const confirmSaveMessage = (message) => {
    if (!selectedSubject) {
      alert("Please select a subject before saving messages.");
      return;
    }
    setSelectedMessage(message);
  };

  const saveMessageToSubject = async () => {
    if (!selectedMessage || !selectedSubject){
      console.error("❌ Invalid message or subject selected.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation { 
              addMessage(
                subjectId: ${selectedSubject.id},
                role: "${selectedMessage.role}", 
                content: """${selectedMessage.content.replace(/"/g, '\\"')}"""
              ) 
              { id role content } 
            }
          `,
        }),
      });

      const result = await response.json();
      if (result.data.addMessage) {
        console.log("✅ Message saved successfully.");
      } else {
        console.error("❌ Failed to save message:",  JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error("❌ Error saving message:", error);
    } finally {
      setSelectedMessage(null);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <span>🔵 StudySimplified (Groq)</span>
          <button className="close-button" onClick={closePopup}>✖</button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="chat-container">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.role === "user" ? "user-message" : "ai-message"}`}
              onClick={() => confirmSaveMessage(msg)}
              title="Click to save this message"
            >
          <ReactMarkdown>{msg.content}</ReactMarkdown>
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

      {selectedMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Save Message?</h3>
            <p>{selectedMessage.content}</p>
            <div className="modal-actions">
              <button onClick={saveMessageToSubject} className="confirm-btn">✅ Yes</button>
              <button onClick={() => setSelectedMessage(null)} className="cancel-btn">❌ No</button>
            </div>
          </div>
        </div>
      )}
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
