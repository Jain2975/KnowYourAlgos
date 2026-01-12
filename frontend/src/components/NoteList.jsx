import React from "react";
import NoteCard from "./NoteCard";
import {useDrag} from 'react-dnd';



function NoteList({ notes, setNotes,onDelete, onEdit }) {

  const API_BASE=import.meta.env.VITE_API_URL;
  
  const saveOrderToDB = async (updatedNotes) => {

  const orderedIds = updatedNotes.map(n => n._id);

  await fetch(`${API_BASE}/algos/notes/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderedIds }),
  });
};


  const onReorder = (fromIndex, toIndex) => {
    setNotes((prev) =>{
      const updatedNotes = [...prev];
      const [movedNote] = updatedNotes.splice(fromIndex, 1);
      updatedNotes.splice(toIndex, 0, movedNote);

      saveOrderToDB(updatedNotes);

      return updatedNotes;
    })
  }

  if (notes.length === 0) {
    return <p>No algorithm notes yet. Add some!</p>;
  }

  return (
    <div className="note-list">
      {notes.map((note, index) => (
        <NoteCard key={note._id} note={note} index={index} onDelete={onDelete} onEdit={onEdit} onReorder={onReorder}/>
      ))}
    </div>
  );
}

export default NoteList;
