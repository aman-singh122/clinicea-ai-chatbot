import createGeminiClient
from "../../../../config/gemini.js";

import getUserGemini
from "../../../utils/getUserGemini.js";

// =========================
// SQL ANSWER BUILDER
// =========================

async function sqlAnswerBuilder(

  user,
  query,
  result

) {

  // =========================
  // EMPTY RESULT
  // =========================

  if (

    !result ||

    result.length === 0

  ) {

    return "No matching records were found.";

  }

  // =========================
  // USER GEMINI API
  // =========================

  const apiKey =
    getUserGemini(user);

  if (!apiKey) {

    throw new Error(
      "No Gemini API Key Found"
    );

  }

  // =========================
  // CREATE AI CLIENT
  // =========================

  const ai =
    createGeminiClient(apiKey);

  console.log(
    "\nANSWER BUILDER AI READY"
  );

  // =========================
  // NORMALIZE BIGINT
  // =========================

const normalizedResult =
  JSON.stringify(
    result.slice(0, 50),
    (key, value) =>
      typeof value === "bigint"
        ? Number(value)
        : value,
    2
  );

  // =========================
  // DETECT RESULT TYPE
  // =========================



  // =========================
  // PROMPT
  // =========================

  const prompt = `

You are an enterprise-grade healthcare analytics AI assistant.

Your role:
analyze SQL query results and generate
clear business insights.

================================================
CORE OBJECTIVE
================================================

Generate analytics-style insights,
not robotic summaries.

Your answers should sound like:

- Power BI insights
- Tableau summaries
- Executive dashboard commentary
- Business intelligence reporting

================================================
IMPORTANT RULES
================================================

- ONLY use values from SQL RESULT
- NEVER hallucinate data
- NEVER invent statistics
- NEVER create fake trends

================================================
RESPONSE STYLE
================================================

Keep responses:

- concise
- professional
- insight-driven
- executive-friendly
- human-readable

================================================
STRICT OUTPUT RULES
================================================

Return ONLY plain text.

DO NOT use:

- markdown
- headings
- bullet points
- numbering
- JSON
- code blocks
- quotes
- emojis

================================================
INSIGHT RULES
================================================

If result contains:

1 row:
- summarize the key finding

Multiple rows:
- mention top performer
- mention comparison/trend
- mention important observations

Revenue data:
- mention highest revenue contributor

Trend data:
- mention increase/decrease patterns

Category data:
- mention dominant category

Doctor analytics:
- mention top-performing doctor

Appointment analytics:
- mention highest appointment volume

================================================
GOOD EXAMPLES
================================================

Question:
monthly revenue trend

Answer:
Revenue peaked in April 2026 with 1.2M in collections, while May 2026 showed a significant decline.

------------------------------------------------

Question:
top doctors by appointments

Answer:
Dr. Sikhar handled the highest number of appointments with 71 visits, followed by Admin with 64 appointments.

------------------------------------------------

Question:
top selling services

Answer:
Pick Up and Drop Off service generated the highest revenue at 1.12M, significantly outperforming all other services.

================================================
USER QUESTION
================================================

${query}

================================================
SQL RESULT
================================================

${normalizedResult}

================================================
FINAL INSTRUCTION
================================================

Generate a clean analytics insight.

`;

  // =========================
  // GEMINI RESPONSE
  // =========================

const response =
  await ai.models.generateContent({

    model: "gemini-2.5-flash",

    contents: prompt,

    generationConfig: {
      temperature: 0
    }

  });

  // =========================
  // SAFE RESPONSE EXTRACTION
  // =========================

  let answer =

    response.text ||

    response.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text ||

    "Analytics generated successfully.";

  // =========================
  // CLEAN RESPONSE
  // =========================

  answer = answer

    // REMOVE MARKDOWN
    .replace(/\*\*/g, "")

    // REMOVE SINGLE *
    .replace(/\*/g, "")

    // REMOVE QUOTES
    .replace(/"/g, "")

    // REMOVE EXTRA NEWLINES
    .replace(/\n{3,}/g, "\n\n")

    // NORMALIZE SPACES
    .replace(/\s+/g, " ")

    // REMOVE LEADING/TRAILING
    .trim();

  // =========================
  // SAFETY FALLBACK
  // =========================

  if (!answer) {

    return "Analytics generated successfully.";

  }

  return answer;

}

export default sqlAnswerBuilder;