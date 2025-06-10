import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

function NoteCard({ note, onDelete }) {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-content-${note.id}`}
        id={`panel-header-${note.id}`}
      >
        <Typography>
          {note.name}{" "}
          <small style={{ marginLeft: 8, color: "#666" }}>
            ({note.category})
          </small>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <strong>Description:</strong> {note.description}
        </Typography>
        <Typography>
          <strong>Use Cases:</strong> {note.useCases}
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => onDelete(note.id)}
          style={{ marginTop: 12 }}
        >
          Delete
        </Button>
      </AccordionDetails>
    </Accordion>
  );
}

export default NoteCard;
