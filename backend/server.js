// ================= IMPORTS =================
import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// ================= DIR SETUP =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= COMMONJS SUPPORT =================
const require = createRequire(import.meta.url);

// ================= LIBS =================
const PDFDocument = require("pdfkit");
const pdfParse = require("pdf-parse");

// ================= PATHS =================
const patientsPath = path.join(__dirname, "../data/patients.json");
const apiKeysPath = path.join(__dirname, "../data/apiKeys.json");
const docsPath = path.join(__dirname, "../data/documents.json");
const cliniceaPath = path.join(__dirname, "../data/clinicea.json");
const uploadsPath = path.join(__dirname, "../uploads");

const app = express();
app.use("/uploads", express.static(uploadsPath));

// ================= APP =================
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
  },
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
      filename: req.file.originalname, // ✅ ADD THIS
      content: data.text || "",
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

// ===== BILL GENERATION FUNCTION =====
function generateBill(user, patient, fileNo, extractedText) {

  // 🔥 safety (important fix)
  extractedText = extractedText || "";

  const doc = new PDFDocument();

  const fileName = `bill_${patient}_${Date.now()}.pdf`;

  // 🔥 user-wise folder
  const userDir = path.join(uploadsPath, user);

  // create folder if not exists
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // ===== CONTENT =====
  doc.fontSize(20).text("Clinicea Bill", { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text(`Patient Name: ${patient}`);
  doc.text(`File No: ${fileNo}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);

  doc.moveDown();

  doc.text("Treatment Summary:");

  // 🔥 safe substring (no crash)
  doc.text(
    extractedText.length > 0
      ? extractedText.substring(0, 200)
      : "Basic consultation completed"
  );

  doc.moveDown();

  doc.text("Consultation Charges: ₹500");
  doc.text("Total: ₹500");

  doc.end();

  // 🔥 correct URL return
  return `http://localhost:5000/uploads/${user}/${fileName}`;
}

// ================= CHAT =================
app.post("/chat", async (req, res) => {
  try {
    const { user, question } = req.body;

    // ================= LOAD PATIENTS =================
    let patientsData = [];

    if (fs.existsSync(patientsPath)) {
      try {
        patientsData = JSON.parse(fs.readFileSync(patientsPath, "utf-8"));
      } catch {
        patientsData = [];
      }
    }

    // current user patients
    const userPatientsObj = patientsData.find((p) => p.user === user);
    const userPatients = userPatientsObj ? userPatientsObj.patients : [];

    // ===== API KEY =====
    const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
    const apiKey = apiKeys[user];

    if (!apiKey) {
      return res.json({ answer: "Please add API key in settings." });
    }

    // ================= LOAD DOCUMENTS (FIXED POSITION) =================
    let documents = [];

    if (fs.existsSync(docsPath)) {
      try {
        const fileData = fs.readFileSync(docsPath, "utf-8");
        documents = fileData ? JSON.parse(fileData) : [];
      } catch {
        documents = [];
      }
    }

    // ===== USER DOCS (FULL OBJECT) =====
    const userDocsArray = documents.filter((doc) => doc.user === user);

    // ================= ACTION SYSTEM =================
    const lowerQ = question.toLowerCase();

    // find patient name
    const foundPatient = userPatients.find((p) => lowerQ.includes(p.name));

    // detect bill command
if (lowerQ.includes("bill") && foundPatient) {

const filePath = foundPatient.filePath;

let extractedText = "";

if (filePath && fs.existsSync(filePath)) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  extractedText = data.text || "";
}

  const billUrl = generateBill(
    foundPatient.name,
    foundPatient.fileNo,
    extractedText
  );

  return res.json({
    type: "action",
    action: "new_bill",
    patient: foundPatient.name,
    fileNo: foundPatient.fileNo,
    billUrl: billUrl,
   summary: extractedText && extractedText.length > 0
  ? extractedText.substring(0, 120)
  : "Basic consultation completed successfully"
  });
}



    // for Gemini (string)
    const userDocs = userDocsArray.map((doc) => doc.content).join("\n");

    // ================= CLINICEA DATA =================
    let cliniceaData = "";

    if (fs.existsSync(cliniceaPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(cliniceaPath, "utf-8"));

        cliniceaData = data
          .map((item) => `${item.title}:\n${item.content}`)
          .join("\n\n");
      } catch {
        cliniceaData = "";
      }
    }

    if (!userDocs && !cliniceaData) {
      return res.json({ answer: "No data available." });
    }

    // ================= GEMINI =================
    const ai = new GoogleGenAI({ apiKey });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `

You are an AI assistant that answers questions ONLY using the provided context.

You will receive:
1. Clinicea Knowledge Base
2. User Uploaded Documents

GOAL:
Understand the content and give a clear, simple, human-friendly answer. Do NOT copy raw text.

RULES:
- Use ONLY the given context
- Do NOT use external knowledge
- Do NOT guess or assume anything
- If the answer is not present, reply exactly:
Answer not found

PRIORITY:
1. User Uploaded Documents (highest priority)
2. Clinicea Knowledge Base

If both contain relevant information → combine clearly  
If there is a conflict → trust User Documents  

ANSWER STYLE:
- Simple and easy to understand
- Short sentences
- Human-like explanation (not robotic)
- Use bullet points or steps when helpful
- Remove unnecessary technical wording
- Avoid repetition

FORMATTING:
- No JSON, no code blocks
- No markdown symbols
- Do not copy raw document text
- Do not wrap answer in quotes

OUTPUT:
Return only the final answer naturally.
Do not mention sources or context.

`,
      },
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
      message: prompt,
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

    const userDocs = docs.filter((d) => d.user === user);

    res.json(userDocs);
  } catch (err) {
    res.json([]);
  }
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
