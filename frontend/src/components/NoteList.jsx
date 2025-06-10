import React from "react";
import NoteCard from "./NoteCard";



function NoteList({ notes, onDelete }) {
  if (notes.length === 0) {
    return <p>No algorithm notes yet. Add some!</p>;
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default NoteList;
