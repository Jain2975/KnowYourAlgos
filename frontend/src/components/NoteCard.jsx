import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

function NoteCard({ note, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({
    name: note.name,
    category: note.category,
    description: note.description,
    useCases: note.useCases,
  });

  const handleSave = () => {
    onEdit(note._id, editedNote);
    setIsEditing(false);
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-content-${note._id}`}
        id={`panel-header-${note._id}`}
      >
        <Typography>
          {note.name}{" "}
          <small style={{ marginLeft: 8, color: "#666" }}>
            ({note.category})
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
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
              >
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
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => onDelete(note._id)}
              >
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
