import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const Options = () => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    chrome.storage.sync.get("apiKey", (data) => {
      setApiKey(data.apiKey || "");
    });
  }, []);

  const saveApiKey = () => {
    chrome.storage.sync.set({ apiKey }, () => {
      alert("API Key saved!");
    });
  };

  return (
    <div style={{ padding: 20, width: 300 }}>
      <h3>Settings</h3>
      <input
        type="password"
        placeholder="Enter OpenAI API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button onClick={saveApiKey}>Save</button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Options />);
