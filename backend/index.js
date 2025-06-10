import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'algos.json');

app.get('/algos', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read file.');
    res.json(JSON.parse(data));
  });
});

app.post('/algos', (req, res) => {
  const newNote = req.body;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read file.');
    const notes = JSON.parse(data);
    newNote.id = notes.length + 1;
    notes.push(newNote);
    fs.writeFile(filePath, JSON.stringify(notes, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to write file.');
      res.status(201).json(newNote);
    });
  });
});

app.delete('/algos/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read file.');
    const notes = JSON.parse(data);
    const newNotes = notes.filter(note => note.id !== idToDelete);
    fs.writeFile(filePath, JSON.stringify(newNotes, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to delete note.');
      res.status(200).send('Note deleted successfully.');
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
