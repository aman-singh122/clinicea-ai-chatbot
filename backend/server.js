// ================= IMPORTS =================
import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import createGeminiClient from "../config/gemini.js";

import getUserGemini from "./utils/getUserGemini.js";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import dashboardRoutes from "./modules/analytics/dashboard/dashboardRoutes.js";
import { encrypt, decrypt } from "./utils/encryption.js";
// import analyticsRoutes from "./routes/analyticsRoutes.js";
// import csvRoutes from "../csvAI/csvRoutes.js";

import detectIntent from "./utils/detectIntent.js";

// import sqlRoutes from "../csvSQLAI/sqlRoutes.js";

import sqlRoutes from "./modules/analytics/routes/sqlRoutes.js";

import uploadAnalyticsRoutes from "./modules/analytics/routes/uploadAnalyticsRoutes.js";

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
const videosPath = path.join(__dirname, "../data/videos.json");
const uploadsPath = path.join(__dirname, "../uploads");

const app = express();
app.use(express.static("frontend"));
app.use("/graphs", express.static("backend/graphs"));
app.use("/uploads", express.static(uploadsPath));

// ================= APP =================
app.use(cors({ origin: "*" }));
app.use(express.json());
// app.use("/api", csvRoutes);

app.use("/api", sqlRoutes);

app.use("/api", uploadAnalyticsRoutes);

app.use("/api", dashboardRoutes);

//video function

function findRelevantVideo(question, videos, intent) {
  const q = question.toLowerCase();

  let bestVideo = null;
  let bestScore = 0;

  for (const video of videos) {
    let score = 0;

    // ===== TITLE MATCH =====
    if (q.includes(video.title.toLowerCase())) {
      score += 10;
    }

    // ===== CATEGORY MATCH =====
    if (q.includes(video.category.toLowerCase())) {
      score += 3;
    }

    // ===== KEYWORD MATCH =====
    for (const keyword of video.keywords) {
      const k = keyword.toLowerCase();

      if (q.includes(k)) {
        score += 5;
      }

      const words = k.split(" ");

      for (const word of words) {
        if (word.length < 4) continue;

        if (q.includes(word)) {
          
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestVideo = video;
    }
  }

if (intent.clinicea || intent.video) {
  return bestScore >= 3 ? bestVideo : null;
}

return bestScore >= 8 ? bestVideo : null;
}

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

    console.log("=================================");
    console.log("FILE:", req.file.originalname);
    console.log("PAGES:", data.numpages);
    console.log("TEXT LENGTH:", data.text.length);
    console.log("TEXT SAMPLE:");
    console.log(data.text.substring(0, 500));
    console.log("=================================");

    if (!data.text || data.text.trim().length < 50) {
      fs.unlinkSync(filePath); // uploaded pdf delete

      return res.status(400).json({
        error:
          "Scanned/Image PDF is not supported. Please upload a text-searchable PDF.",
      });
    }

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
      filename: req.file.originalname, // ADD THIS
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

    apiKeys[user] = encrypt(apiKey);

    fs.writeFileSync(apiKeysPath, JSON.stringify(apiKeys, null, 2));

    res.json({ message: "API key saved" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to save API key");
  }
});

// ===== BILL GENERATION FUNCTION =====
function generateBill(user, patient, fileNo, extractedText) {
  //  safety (important fix)
  extractedText = extractedText || "";

  const doc = new PDFDocument();

  const fileName = `bill_${patient}_${Date.now()}.pdf`;

  //  user-wise folder
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

  // safe substring (no crash)
  doc.text(
    extractedText.length > 0
      ? extractedText.substring(0, 200)
      : "Basic consultation completed",
  );

  doc.moveDown();

  doc.text("Consultation Charges: ₹500");
  doc.text("Total: ₹500");

  doc.end();

  //  correct URL return
  return `http://localhost:5000/uploads/${user}/${fileName}`;
}

// ================= CHAT =================
app.post("/chat", async (req, res) => {
  try {
    const { user, query } = req.body;

    const question = query;

    const intent = detectIntent(question);

    console.log(intent);
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
    const apiKey = getUserGemini(user);

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

    // find patient name

    // detect bill command

    // for Gemini (string)
    const userDocs = userDocsArray.map((doc) => doc.content).join("\n");

    // ================= VIDEOS =================

    let videos = [];

    if (fs.existsSync(videosPath)) {
      try {
        videos = JSON.parse(fs.readFileSync(videosPath, "utf-8"));
      } catch {
        videos = [];
      }
    }

    const lowerQ = question.toLowerCase();

   const matchedVideo =
  findRelevantVideo(question, videos, intent);

    // =========================
    // PRIORITY MATCHING
    // =========================

    let matchedPatients = [];

    // ===== PATIENT ID MATCH =====

    matchedPatients = userPatients.filter((p) =>
      lowerQ.includes(p.patientId.toLowerCase()),
    );

    // ===== FILE NO MATCH =====

    if (matchedPatients.length === 0) {
      matchedPatients = userPatients.filter((p) =>
        lowerQ.includes(String(p.fileNo)),
      );
    }

    // ===== FULL NAME MATCH =====

    if (matchedPatients.length === 0) {
      matchedPatients = userPatients.filter((p) =>
        lowerQ.includes(p.fullName.toLowerCase()),
      );
    }

    // ===== SHORT NAME MATCH =====

    if (matchedPatients.length === 0) {
      matchedPatients = userPatients.filter((p) =>
        lowerQ.includes(p.name.toLowerCase()),
      );
    }

    // =========================
    // MULTIPLE MATCHES
    // =========================

    if (matchedPatients.length > 1) {
      const patientList = matchedPatients
        .map((p, index) => `${index + 1}. ${p.fullName} (${p.patientId})`)
        .join("\n");

      return res.json({
        type: "text",

        answer: `Multiple patients found:

${patientList}

Please provide patientId or file number.`,
      });
    }

    // =========================
    // SINGLE MATCH
    // =========================

    const foundPatient = matchedPatients[0];

    if (lowerQ.includes("bill") && foundPatient) {
      const filePath = foundPatient.filePath;

      let extractedText = "";

      if (filePath && fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        extractedText = data.text || "";
      }

      const billUrl = generateBill(
        user,
        foundPatient.fullName,
        foundPatient.fileNo,
        extractedText,
      );

      return res.json({
        type: "action",
        action: "new_bill",
        patient: foundPatient.fullName,

        patientId: foundPatient.patientId,
        fileNo: foundPatient.fileNo,
        billUrl: billUrl,
        summary:
          extractedText && extractedText.length > 0
            ? extractedText.substring(0, 120)
            : "Basic consultation completed successfully",
      });
    }

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
    const ai = createGeminiClient(apiKey);

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `

You are a professional AI assistant for Clinicea.

You answer questions using ONLY the provided context from:

1. User Uploaded Documents
2. Clinicea Knowledge Base
3. Clinicea Video Dataset

PRIORITY RULES:

* User Uploaded Documents have the highest priority
* If the user uploads documents, answer mainly from those documents
* If both documents and Clinicea data are relevant, combine them naturally
* If there is any conflict, trust the uploaded documents

CLINICEA QUESTIONS:
If the user asks:

* how to do something in Clinicea
* Clinicea workflows
* billing, EMR, appointments, inventory, reports, payments, packages, etc.
* Clinicea features or modules
* video walkthrough related queries

Then answer using the Clinicea backend knowledge base and video dataset.

VIDEO HANDLING:

* If a relevant Clinicea video/tutorial is available, include the video card or demo preview
* Prefer showing the most relevant video
* Give a short helpful explanation along with the video
* Do not dump unnecessary details

STRICT RULES:

* Use ONLY the provided context
* Do NOT use external knowledge
* Do NOT guess or hallucinate information


RESPONSE STYLE:

* Natural and human-like
* Professional and clean
* Similar to ChatGPT responses
* Clear and easy to understand
* Avoid robotic wording
* Keep answers concise but useful
* Use bullets or steps when needed
* Avoid repetition

FORMATTING:

* No JSON
* No code blocks
* No raw copied paragraphs from documents
* No mentioning sources or context
* Return only the final answer naturally

GOAL:
Help users quickly understand Clinicea workflows, uploaded reports, and medical or clinic-related information in a clean conversational way.


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

    // ================= VIDEO PRIORITY RESPONSE =================

    if (matchedVideo) {
      return res.json({
        type: "video",

        answer: "Watch the tutorial video below to get your answer.",

        video: {
          title: matchedVideo.title,

          url: matchedVideo.url,

          thumbnail: matchedVideo.thumbnail,

          description: matchedVideo.description,
        },
      });
    }
    const response = await chat.sendMessage({
      message: prompt,
    });

    console.log(JSON.stringify(response, null, 2));

    res.json({
      type: matchedVideo ? "video" : "text",

      answer:
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        (matchedVideo
          ? "Relevant Clinicea tutorial found below."
          : "Answer not found"),

      video: matchedVideo
        ? {
            title: matchedVideo.title,
            url: matchedVideo.url,
            thumbnail: matchedVideo.thumbnail,
            description: matchedVideo.description,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Api key not valid" });
  }
});

// ================= GET USER DOCUMENTS =================
app.get("/documents/:user", (req, res) => {
  const user = req.params.user;

  let result = [];

  // =========================
  // PDF DOCUMENTS
  // =========================

  if (fs.existsSync(docsPath)) {
    try {
      const docs = JSON.parse(fs.readFileSync(docsPath, "utf-8"));

      result.push(
        ...docs
          .filter((d) => d.user === user)
          .map((d) => ({
            filename: d.filename,
            type: "pdf",
          })),
      );
    } catch {}
  }

  // =========================
  // PARQUET DOCUMENTS
  // =========================

  try {
    const parquetDir = path.join(__dirname, "../data", user, "parquet");

    if (fs.existsSync(parquetDir)) {
      const parquetFiles = fs
        .readdirSync(parquetDir)
        .filter((file) => file.endsWith(".parquet"))
        .map((file) => ({
          filename: file,
          type: "parquet",
        }));

      result.push(...parquetFiles);
    }
  } catch (err) {
    console.log(err);
  }

  res.json(result);
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
