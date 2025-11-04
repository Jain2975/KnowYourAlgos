import React, { useState } from "react";

function AddNote({ onAdd }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [useCases, setUseCases] = useState("");
  const [code, setCode] = useState(""); 

  const handleSubmit = (e) => {
    e.preventDefault();

    const newNote = {
      name,
      category,
      description,
      useCases,
      code, 
    };

    onAdd(newNote);

    setName("");
    setCategory("");
    setDescription("");
    setUseCases("");
    setCode(""); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Algorithm Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Category (e.g., Graph, DP)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <textarea
        placeholder="Short Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <textarea
        placeholder="Use Cases / Where it’s used"
        value={useCases}
        onChange={(e) => setUseCases(e.target.value)}
        required
      />

      
      <textarea
        placeholder="Paste algorithm code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ fontFamily: "monospace", minHeight: "130px" }}
      />

      <button type="submit">➕ Add Note</button>
    </form>
  );
}

export default AddNote;
