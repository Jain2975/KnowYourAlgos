import React from "react";
import NoteCard from "./NoteCard";



function NoteList({ notes, onDelete, onEdit }) {
  if (notes.length === 0) {
    return <p>No algorithm notes yet. Add some!</p>;
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteCard key={note._id} note={note} onDelete={onDelete} onEdit={onEdit}/>
      ))}
    </div>
  );
}

export default NoteList;
