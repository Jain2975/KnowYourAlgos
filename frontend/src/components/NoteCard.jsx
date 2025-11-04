import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

// Prism imports
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";          // VS Code dark theme
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";

// Optional line numbers
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-numbers/prism-line-numbers";

function NoteCard({ note, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({
    name: note.name,
    category: note.category,
    description: note.description,
    useCases: note.useCases,
    language: note.language || "javascript",
    codeSnippet: note.codeSnippet || "",
  });

  // Highlight Prism after render/update
  useEffect(() => {
    Prism.highlightAll();
  }, [isEditing, note.codeSnippet, editedNote.codeSnippet]);

  const handleSave = () => {
    onEdit(note._id, editedNote);
    setIsEditing(false);
  };

  return (
    <Accordion sx={{ marginBottom: "10px" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {note.name}{" "}
          <small style={{ marginLeft: 8, color: "#888" }}>
            ({note.category}) • {note.language?.toUpperCase() || "JS"}
          </small>
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        {isEditing ? (
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={editedNote.name}
              onChange={(e) =>
                setEditedNote({ ...editedNote, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Category"
              value={editedNote.category}
              onChange={(e) =>
                setEditedNote({ ...editedNote, category: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={editedNote.description}
              onChange={(e) =>
                setEditedNote({ ...editedNote, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Use Cases"
              value={editedNote.useCases}
              onChange={(e) =>
                setEditedNote({ ...editedNote, useCases: e.target.value })
              }
              fullWidth
            />

            {/* ✅ Language Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={editedNote.language}
                label="Language"
                onChange={(e) =>
                  setEditedNote({ ...editedNote, language: e.target.value })
                }
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="c">C</MenuItem>
                <MenuItem value="java">Java</MenuItem>
              </Select>
            </FormControl>

            {/* Code input */}
            <TextField
              label="Code Snippet"
              value={editedNote.codeSnippet}
              onChange={(e) =>
                setEditedNote({ ...editedNote, codeSnippet: e.target.value })
              }
              multiline
              rows={5}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success" onClick={handleSave}>
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        ) : (
          <>
            <Typography>
              <strong>Description:</strong> {note.description}
            </Typography>
            <Typography>
              <strong>Use Cases:</strong> {note.useCases}
            </Typography>

            {/* ✅ Prism Code View */}
            {note.codeSnippet && (
              <pre className="line-numbers" style={{ marginTop: "15px" }}>
                <code className={`language-${note.language}`}>
                  {note.codeSnippet}
                </code>
              </pre>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="contained" color="error" onClick={() => onDelete(note._id)}>
                Delete
              </Button>
            </Stack>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default NoteCard;
