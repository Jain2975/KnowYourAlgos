import React, { useState, useEffect } from "react";
import AddNote from "./components/AddNote.jsx";
import NoteList from "./components/NoteList.jsx";
import "./styles.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch existing notes from backend on load
  useEffect(() => {
    fetch("https://knowyouralgos.onrender.com/algos")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("Failed to load notes:", err));
  }, []);

  // Add a new note and persist to backend
  const addNote = async (newNote) => {
    try {
      const res = await fetch("https://knowyouralgos.onrender.com/algos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote)
      });
      const savedNote = await res.json();
      setNotes((prev) => [...prev, savedNote]);
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  // Delete a note and persist the change
  const deleteNote = async (id) => {
    try {
      await fetch(`https://knowyouralgos.onrender.com/algos/${id}`, {
        method: "DELETE"
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  // Filter notes by name or category
  const filteredNotes = notes.filter((note) =>
    `${note.name} ${note.category}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <h1>🧠 Know Your Algorithms</h1>
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
          borderRadius: "5px"
        }}
      />

      <NoteList notes={filteredNotes} onDelete={deleteNote} />
    </div>
  );
}

export default App;
