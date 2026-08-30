import React, { useState, useEffect, useRef } from "react";
import AddNote from "./components/AddNote.jsx";
import NoteList from "./components/NoteList.jsx";
import "./styles.css";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL;

function App() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(true);

  //Globat Chat States
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    setUser(data.user);
    await fetchNotes();
  }

  async function register(username, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error("Register failed");
    const data = await res.json();
    setUser(data.user);
    await fetchNotes();
  }

  async function logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setNotes([]);
  }

  // Fetches notes from the server; the cookie is already set so no user
  // argument is needed — avoids reading stale React state.
  async function fetchNotes() {
    const res = await fetch(`${API_BASE}/algos/notes`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
  }

  // Load notes once the user state is set (covers page-refresh / token restore).
  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addNote = async (newNote) => {
    try {
      const res = await fetch(`${API_BASE}/algos/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newNote),
      });
      if (!res.ok) throw new Error("Failed to add note");
      const savedNote = await res.json();
      setNotes((prev) => [...prev, savedNote]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateNote = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/algos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Failed to update note");

      const updatedNote = await res.json();
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === id ? updatedNote : note)),
      );
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_BASE}/algos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [...new Set(notes.map((n) => n.category))].sort();

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = `${note.name} ${note.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || note.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  //Websockets and Global Chat '
  function toggleChat() {
    if (isChatOpen) closeChat();
    else openChat();
  }
  async function openChat() {
    setIsChatOpen(true);

    setMessages([]); // Clear previous messages
    // 1. Create socket first (if not already created)
    if (!socketRef.current) {
      const socket = io(API_BASE, { withCredentials: true });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to chat:", socket.id);
      });

      socket.on("chatMessage", (msg) => {
        setMessages((prev) => {
          const updated = [...prev, msg];
          return updated.length > 50 ? updated.slice(-50) : updated;
        });
      });
    }

    // 2. THEN load chat history
    try {
      const resp = await fetch(`${API_BASE}/chat/history`, {
        method: "GET",
        credentials: "include",
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages(data);
      }
    } catch (err) {
      console.log("Error fetching chat history:", err);
    }
  }

  function closeChat() {
    setIsChatOpen(false);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }

  function sendMessage() {
    if (!chatInput.trim() || !socketRef.current) return;

    if (chatInput.length > 200) {
      alert("Message too long! Please limit to 200 characters.");
      return;
    }

    socketRef.current.emit("chatMessage", {
      user: user.username,
      text: chatInput,
      time: new Date().toISOString(),
    });

    setChatInput("");
  }

  if (loading) {
    return (
      <div className="app-skeleton">
        <div className="skeleton skeleton-title"></div>

        <div className="skeleton skeleton-input"></div>
        <div className="skeleton skeleton-input"></div>
        <div className="skeleton skeleton-button"></div>

        <div className="skeleton-note-card">
          <div className="skeleton skeleton-note-title"></div>
          <div className="skeleton skeleton-note-line"></div>
          <div className="skeleton skeleton-note-line small"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <h1>🧠 Know Your Algorithms</h1>

        {authMode === "login" ? (
          <AuthForm
            mode="login"
            onSubmit={login}
            switchMode={() => setAuthMode("register")}
          />
        ) : (
          <AuthForm
            mode="register"
            onSubmit={register}
            switchMode={() => setAuthMode("login")}
          />
        )}
      </div>
    );
  }

  const downloadNotes = async () => {
    try {
      const resp = await fetch(`${API_BASE}/algos/pdf`, {
        method: "GET",
        credentials: "include",
      });
      if (!resp.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await resp.blob();

      const url = window.URL.createObjectURL(blob);

      const tempElement = document.createElement("a");
      tempElement.href = url;
      tempElement.download = "KnowYourAlgoes_Notes.pdf";
      document.body.appendChild(tempElement);

      tempElement.click();
      alert("Notes downloaded successfully!");
      tempElement.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("Frontend error", err);
    }
  };
  return (
    <div className={`App ${isChatOpen ? "shifted" : ""}`}>
      <div className="app-header">
        <div className="app-header-left">
          <h1 className="app-title">🧠 KnowYourAlgos</h1>
          <span className="app-stats">
            {notes.length} note{notes.length !== 1 ? "s" : ""} •{" "}
            {[...new Set(notes.map((n) => n.category))].length} categor
            {[...new Set(notes.map((n) => n.category))].length !== 1
              ? "ies"
              : "y"}
          </span>
        </div>
        <div className="app-header-right">
          <span className="welcome-name">Hi, {user?.username}!</span>
          <button
            className="btn-outline"
            onClick={downloadNotes}
            title="Download PDF"
          >
            ⬇ PDF
          </button>
          <button
            className="btn-outline btn-danger"
            onClick={logout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <AddNote onAdd={addNote} />

      <div className="search-filter-row">
        <input
          className="search-input"
          type="text"
          placeholder="🔍  Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="category-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <NoteList
        notes={filteredNotes}
        setNotes={setNotes}
        onDelete={deleteNote}
        onEdit={updateNote}
      />

      <div className="chat-tab" onClick={toggleChat}>
        <div className={`arrow ${isChatOpen ? "open" : ""}`}>&#9654;</div>
      </div>

      <div className={`chat-panel ${isChatOpen ? "open" : ""}`}>
        <h3>Global Chat</h3>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <p>
              <em>No messages yet...</em>
            </p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="chat-message">
                <div className="chat-message-header">
                  <strong>{msg.user}</strong>
                  <span className="chat-timestamp">
                    {new Date(msg.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="chat-message-text">{msg.text}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode, onSubmit, switchMode }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await onSubmit(email, password);
      } else {
        await onSubmit(username, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      {mode === "register" && (
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      <p style={{ marginTop: "10px" }}>
        {mode === "login"
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          style={{ background: "none", color: "#3498db", cursor: "pointer" }}
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </p>
    </form>
  );
}

export default App;
