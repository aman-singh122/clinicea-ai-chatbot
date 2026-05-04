// ================= IMPORTS =================
import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// ================= COMMONJS SUPPORT =================
const require = createRequire(import.meta.url);

// ================= PDF PARSE =================
const pdfParse = require("pdf-parse");

// ================= DIR SETUP =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= PATHS =================
const apiKeysPath = path.join(__dirname, "../data/apiKeys.json");
const docsPath = path.join(__dirname, "../data/documents.json");
const cliniceaPath = path.join(__dirname, "../data/clinicea.json");
const uploadsPath = path.join(__dirname, "../uploads");

// ================= APP =================
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const user = req.body?.user || "user1";

    const dir = path.join(uploadsPath, user);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ================= UPLOAD =================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const user = req.body.user;
    const filePath = req.file.path;

    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    let docs = [];

    if (fs.existsSync(docsPath)) {
      try {
        const fileData = fs.readFileSync(docsPath, "utf-8");
        docs = fileData ? JSON.parse(fileData) : [];
      } catch {
        docs = [];
      }
    }

  docs.push({
  user,
  filename: req.file.originalname,  // ✅ ADD THIS
  content: data.text || ""
});

    fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2));

    res.status(200).json({ message: "File uploaded successfully" });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ================= SAVE API KEY =================
app.post("/save-api-key", (req, res) => {
  try {
    const { user, apiKey } = req.body;

    let apiKeys = {};

    if (fs.existsSync(apiKeysPath)) {
      try {
        const fileData = fs.readFileSync(apiKeysPath, "utf-8");
        apiKeys = fileData ? JSON.parse(fileData) : {};
      } catch {
        apiKeys = {};
      }
    }

    apiKeys[user] = apiKey;

    fs.writeFileSync(apiKeysPath, JSON.stringify(apiKeys, null, 2));

    res.json({ message: "API key saved" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to save API key");
  }
});

// ================= CHAT =================
app.post("/chat", async (req, res) => {
  try {
    const { user, question } = req.body;

    // ===== API KEY =====
    const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
    const apiKey = apiKeys[user];

    if (!apiKey) {
      return res.json({ answer: "Please add API key in settings." });
    }

    // ===== USER DOCS =====
    let documents = [];

    if (fs.existsSync(docsPath)) {
      try {
        const fileData = fs.readFileSync(docsPath, "utf-8");
        documents = fileData ? JSON.parse(fileData) : [];
      } catch {
        documents = [];
      }
    }

    const userDocs = documents
      .filter(doc => doc.user === user)
      .map(doc => doc.content)
      .join("\n");

    // ===== CLINICEA DATA =====
    let cliniceaData = "";

    if (fs.existsSync(cliniceaPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(cliniceaPath, "utf-8"));

        cliniceaData = data
          .map(item => `${item.title}:\n${item.content}`)
          .join("\n\n");
      } catch {
        cliniceaData = "";
      }
    }

    if (!userDocs && !cliniceaData) {
      return res.json({ answer: "No data available." });
    }

    // ===== GEMINI =====
    const ai = new GoogleGenAI({ apiKey });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `

You are an intelligent AI assistant designed to answer user questions using ONLY the provided context.

You will receive two types of context:
1. Clinicea Knowledge Base (system-level information)
2. User Uploaded Documents (user-specific data)

========================
YOUR RESPONSIBILITIES:
========================

- Carefully read and understand BOTH:
  • Clinicea Knowledge Base
  • User Documents

- Combine information from both sources when needed

- Provide clear, accurate, and structured answers

- Prefer User Documents if there is any conflict with Clinicea data

========================
STRICT RULES:
========================

1. DO NOT use any external knowledge.
2. DO NOT assume or guess anything.
3. DO NOT generate information not present in the context.
4. If the answer is not present in the given data, respond EXACTLY with:
   "Answer not found"

========================
ANSWER STYLE:
========================

- Keep answers clear and easy to understand
- Use simple explanations
- Use bullet points if helpful
- Be concise but complete
- Avoid unnecessary repetition

========================
PRIORITY LOGIC:
========================

1. First priority → User Uploaded Documents
2. Second priority → Clinicea Knowledge Base

If answer exists partially in both → combine them properly.

========================
EDGE CASE HANDLING:
========================

- If question is vague → answer based on closest relevant context
- If multiple answers exist → give the most relevant one
- If conflicting data → trust User Documents over system data

========================
OUTPUT RULE:
========================

Only return the final answer.
Do NOT mention:
- "based on context"
- "according to documents"
- "Clinicea data says"

Just answer naturally like a helpful assistant.

`
      }
    });

    // ===== FINAL PROMPT =====
    const prompt = `
CLINICEA KNOWLEDGE BASE:
${cliniceaData}

USER DOCUMENTS:
${userDocs}

QUESTION:
${question}
`;

    const response = await chat.sendMessage({
      message: prompt
    });

    res.json({ answer: response.text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Api key not valid" });
  }
});

// ================= GET USER DOCUMENTS =================
app.get("/documents/:user", (req, res) => {
  const user = req.params.user;

  if (!fs.existsSync(docsPath)) {
    return res.json([]);
  }

  try {
    const docs = JSON.parse(fs.readFileSync(docsPath, "utf-8"));

    const userDocs = docs.filter(d => d.user === user);

    res.json(userDocs);
  } catch (err) {
    res.json([]);
  }
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});