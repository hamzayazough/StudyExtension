import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./popup.css";

const API_URL = "http://localhost:4000/graphql";

const SidePanel = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["username", "selectedSubject"], async (data) => {
      if (data.username) {
        setUsername(data.username);
        await authenticateUser(data.username);
      } else {
        const inputUsername = prompt("Enter your username:");
        if (inputUsername) {
          chrome.storage.sync.set({ username: inputUsername });
          setUsername(inputUsername);
          await authenticateUser(inputUsername);
        }
      }

      if (data.selectedSubject) {
        setSelectedSubject(data.selectedSubject);
      }
    });
  }, []);

  const authenticateUser = async (username) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { authenticateUser(username: "${username}") { id username } }`,
        }),
      });

      const result = await response.json();
      const user = result.data.authenticateUser;

      if (user) {
        setUserId(user.id);
        chrome.storage.sync.set({ userId: user.id });
        fetchSubjects(user.id);
      }
    } catch (error) {
      console.error("❌ Error authenticating user:", error);
    }
  };

  const fetchSubjects = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query { getSubjects(userId: "${userId}") { id name } }`,
        }),
      });

      const result = await response.json();
      setSubjects(result.data.getSubjects);
    } catch (error) {
      console.error("❌ Error fetching subjects:", error);
    }
  };

  const addSubject = async () => {
    if (!newSubjectName.trim() || !userId) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { createSubject(userId: "${userId}", name: "${newSubjectName}") { id name } }`,
        }),
      });

      const result = await response.json();
      setSubjects([...subjects, result.data.createSubject]);
      setNewSubjectName("");
    } catch (error) {
      console.error("❌ Error adding subject:", error);
    }
  };

  const deleteSubject = async (subjectName) => {
    try {
      chrome.storage.sync.get(["username"], async (data) => {
        if (!data.username) {
          alert("❌ Username not found. Please log in again.");
          return;
        }

        const username = data.username;

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation { deleteSubject(username: "${username}", subjectName: "${subjectName}") }`,
          }),
        });

        const result = await response.json();

        if (result.data.deleteSubject) {
          setSubjects(subjects.filter((subject) => subject.name !== subjectName));

          if (selectedSubject === subjectName) {
            setSelectedSubject(null);
            chrome.storage.sync.remove("selectedSubject");
          }
        } else {
          console.error("❌ Failed to delete subject:", result);
        }
      });
    } catch (error) {
      console.error("❌ Error deleting subject:", error);
    }
  };

  const selectSubject = (subject) => {
    setSelectedSubject(subject);
    chrome.storage.sync.set({ 
      selectedSubject: { id: subject.id, name: subject.name }
    });
  };

  return (
    <div className="sidepanel">
      <div className="header">
        <h2>📚 StudySimplified</h2>
        <p>Logged in as: <strong>{username}</strong></p>
        <p>Selected KB: <strong>{selectedSubject ? selectedSubject.name : "None"}</strong></p>
      </div>

      <div className="subject-list">
        {subjects.map((subject) => (
            <div
                key={subject.id}
                className={`subject-card ${selectedSubject?.id === subject.id ? "selected" : ""}`}
                onClick={() => selectSubject(subject)}
            >
                <span>{subject.name}</span>
                <button className="delete-btn" onClick={() => deleteSubject(subject.name)}>
                    ✖
                </button>
            </div>
        ))}
      </div>

      <div className="add-subject">
        <input
          type="text"
          placeholder="New Subject Name"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
        />
        <button onClick={addSubject}>➕ Add</button>
      </div>
    </div>
  );
};

const root = document.getElementById("sidepanel-root");
if (root) {
  ReactDOM.createRoot(root).render(<SidePanel />);
} else {
  console.error("Failed to find sidepanel-root");
}
