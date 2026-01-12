import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pdf from "html-pdf-node";

dotenv.config();

const app=express();
app.use(cookieParser());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT','DELETE'],
  credentials: true 
}));

//Below is for local testing

// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'DELETE', 'PUT'],
//   credentials: true
// }))

app.use(express.json());

mongoose.connect(process.env.MONGO_URI,{
  ssl: true,                       
  tlsAllowInvalidCertificates: false, 
  serverSelectionTimeoutMS: 10000
})
// mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


//Below is for local testing

// mongoose.connect(process.env.MONGO_URI,{
//   ssl: true,                       
  
// })
// // mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error(err));

//Models
const UserSchema=new mongoose.Schema({
  username: {type: String,required: true },
  email: {type: String , required: true,unique: true},
  password: {type: String, required: true}
  
},{timestamps: true});

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    useCases: String,
    language: { type: String, default: "" },
    code: { type: String, default: "" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Note = mongoose.model("Note", noteSchema);

function auth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: process.env.NODE_ENV === "production", // needs HTTPS in prod
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
app.get("/", (req, res) => res.send("KnowYourAlgos API running 🚀"));

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password:passwordHash });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, cookieOptions);
    res.json({
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
});

app.get("/auth/me", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
});

// ---- Notes Routes (protected) ----
app.get("/algos/notes", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ order:1 });
    res.json(notes);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
//Post note
app.post("/algos/notes", auth, async (req, res) => {
  try {
    const { name, category, description, useCases,language, code } = req.body;
    if (!name || !category)
      return res.status(400).json({ message: "Missing fields" });

    const count = await Note.countDocuments({ userId: req.userId });

    const note = new Note({ userId: req.userId, name, category, description, useCases, language, code,order: count });
    await note.save();
    res.status(201).json(note);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
//Delete note
app.delete("/algos/:id", auth, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
//Update Note

app.put("/algos/:id", auth, async (req, res) => {
  try {
    const { name, category, description, useCases, language, code } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, category, description, useCases, language, code },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ message: "Failed to update note" });
  }
});

//Reorder Notes
app.put("/algos/notes/reorder", auth, async (req, res) => {
  try {
    const { orderedIds } = req.body; 

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    // Update each note's order
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      await Note.findOneAndUpdate(  
        { _id: id, userId: req.userId },
        { order: i }
      );
    }


    res.json({ message: "Order saved" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//Download Notes
app.get("/algos/pdf", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });

    if (notes.length === 0) {
      return res.status(404).json({ message: "No Notes found" });
    }

    const user = await User.findById(req.userId);

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background: #f8fafc;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #0a66c2;
              margin-bottom: 10px;
            }
            h3 {
              text-align: center;
              color: #444;
              margin-bottom: 40px;
            }
            .note {
              background: #fff;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .note h2 {
              color: #0a66c2;
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .value {
              margin-top: 4px;
              margin-bottom: 10px;
              line-height: 1.6;
            }
            footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <h1>KnowYourAlgos - Quick Revision Notes</h1>
          <h3>Generated for ${user.username}</h3>
          ${notes
  .map(
    (n, i) => `
      <div class="note">
        <h2>${i + 1}. ${n.name}</h2>
        
        <div class="label">Category:</div>
        <div class="value">${n.category}</div>

        <div class="label">Language:</div>
        <div class="value">${n.language?.toUpperCase() || "—"}</div>

        <div class="label">Description:</div>
        <div class="value">${n.description || "—"}</div>

        <div class="label">Use Cases:</div>
        <div class="value">${n.useCases || "—"}</div>

        ${
          n.code
            ? `
              <div class="label">Code:</div>
              <pre style="
                background:#f4f4f4;
                padding:12px;
                border-radius:6px;
                font-size:12px;
                overflow-x:auto;
                border:1px solid #ddd;
              ">
${n.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
              </pre>
            `
            : ""
        }
      </div>
    `
  )
  .join("")}

          <footer>Generated on ${new Date().toLocaleDateString()} © KnowYourAlgos</footer>
        </body>
      </html>
    `;

    const file = { content: html };
    const options = { format: "A4" };

    const pdfBuffer = await pdf.generatePdf(file, options);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="KnowYourAlgos_Notes.pdf"',
      "Content-Length": pdfBuffer.length
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Cannot fetch notes properly", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
