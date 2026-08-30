import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";

function AddNote({ onAdd }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [useCases, setUseCases] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [timeComplexity, setTimeComplexity] = useState("");
  const [spaceComplexity, setSpaceComplexity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newNote = {
      name,
      category,
      description,
      useCases,
      language,
      code,
      timeComplexity,
      spaceComplexity,
    };

    try {
      await onAdd(newNote);
      setName("");
      setCategory("");
      setDescription("");
      setUseCases("");
      setCode("");
      setTimeComplexity("");
      setSpaceComplexity("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>➕ Add New Algorithm</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Algorithm Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Category (e.g., Graph, DP)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Short Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              label="Use Cases / Where it's used"
              value={useCases}
              onChange={(e) => setUseCases(e.target.value)}
              required
              fullWidth
              multiline
              rows={2}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Time Complexity (e.g. O(n log n))"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                fullWidth
                placeholder="O(n)"
              />
              <TextField
                label="Space Complexity (e.g. O(n))"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                fullWidth
                placeholder="O(1)"
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                labelId="language-label"
                label="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="c">C</MenuItem>
                <MenuItem value="java">Java</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Algorithm Code"
              placeholder="Paste algorithm code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              multiline
              rows={6}
              inputProps={{ style: { fontFamily: "monospace" } }}
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Note"}
            </Button>
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default AddNote;
