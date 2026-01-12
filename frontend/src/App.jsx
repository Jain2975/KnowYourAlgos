import React, { useState, useEffect } from "react";
import AddNote from "./components/AddNote.jsx";
import NoteList from "./components/NoteList.jsx";
import "./styles.css";

const API_BASE=import.meta.env.VITE_API_URL;

function App() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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
    loadNotes();
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
    loadNotes();
  }

  async function logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setNotes([]);
  }

  
  async function loadNotes() {
    if (!user) return;
    const res = await fetch(`${API_BASE}/algos/notes`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [user]);

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
        prevNotes.map((note) => (note._id === id ? updatedNote : note))
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

  
  const filteredNotes = notes.filter((note) =>
    `${note.name} ${note.category}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleChat= () =>{
    setIsChatOpen(!isChatOpen);
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

  const downloadNotes= async()=>{
    try{
      const resp=await fetch(`${API_BASE}/algos/pdf`,{
        method: "GET",
        credentials: "include"
      });
      if(!resp.ok){
        throw new Error("Failed to generate PDF");
      }

      const blob=await resp.blob();

      const url=window.URL.createObjectURL(blob);

      const tempElement=document.createElement("a");
      tempElement.href=url;
      tempElement.download="KnowYourAlgoes_Notes.pdf";
      document.body.appendChild(tempElement);

      tempElement.click();
      alert("Notes downloaded successfully!");
      tempElement.remove();

      window.URL.revokeObjectURL(url);



    }catch(err){
      console.log("Frontend error",err);
      
    }
  }
  return (
    <div className={`App ${isChatOpen ? "shifted" : ""}`}>
      <h1>🧠 Know Your Algorithms</h1>
      <p className="welcome">Welcome, {user.username}!
        <br/>
       <button onClick={logout} >Logout</button>
       <button onClick={downloadNotes} style={{ marginLeft: "10px" }}>Download All Notes</button>
       </p>

      <AddNote onAdd={addNote} />

      <input
        type="text"
        placeholder="Search by name or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "20px",
          padding: "8px",
          width: "100%",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />

      <NoteList notes={filteredNotes} setNotes={setNotes} onDelete={deleteNote} onEdit={updateNote}/>

           
<div className="chat-tab" onClick={toggleChat}>
  <div className={`arrow ${isChatOpen ? "open" : ""}`}>&#9654;</div>
</div>

      
      <div className={`chat-panel ${isChatOpen ? "open" : ""}`}>
        <h3>Global Chat</h3>
        <div className="chat-messages">
          <p><em>Chat messages will appear here...</em></p>
        </div>

        
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            
          />
          
          <button >Send</button>
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
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button type="button" onClick={switchMode} style={{ background: "none", color: "#3498db", cursor: "pointer" }}>
          {mode === "login" ? "Register" : "Login"}
        </button>
      </p>
    </form>
  );
}

export default App;
