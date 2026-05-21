import ai from "../config/gemini.js";

async function sqlAnswerBuilder(query, result) {

  // =========================
  // EMPTY RESULT HANDLING
  // =========================

  if (
    !result ||
    result.length === 0
  ) {

    return "No matching records were found.";
  }

  // =========================
  // PROMPT
  // =========================

  const prompt = `

You are a professional healthcare analytics AI assistant.

Your job is to explain SQL results
in a clean, short, human-friendly way.

================================================
STRICT RULES
================================================

Return ONLY clean plain text.

DO NOT use:

- markdown
- **
- bullet stars
- quotes
- JSON
- code blocks
- headings
- numbering

Keep answers:

- short
- professional
- natural
- business style

================================================
GOOD EXAMPLES
================================================

Question:
total revenue

Answer:
The total revenue generated was 1,295,038.

------------------------------------------------

Question:
top selling item

Answer:
The highest revenue-generating item was
[W] - Pick Up and Drop Off
with total revenue of 1,125,297.9.

------------------------------------------------

Question:
appointment status summary

Answer:
Scheduled appointments were the highest
with 117 records.

================================================
USER QUESTION
================================================

${query}

================================================
SQL RESULT
================================================

${JSON.stringify(

  result,

  (key, value) =>

    typeof value === "bigint"
      ? Number(value)
      : value,

  2

)}

`;

  // =========================
  // GEMINI RESPONSE
  // =========================

  const response =
    await ai.models.generateContent({

      model: "gemini-2.5-flash",

      contents: prompt
    });

  // =========================
  // CLEAN RESPONSE
  // =========================

  let answer =
    response.text;

  answer = answer

    // REMOVE MARKDOWN
    .replace(/\*\*/g, "")

    // REMOVE SINGLE *
    .replace(/\*/g, "")

    // REMOVE QUOTES
    .replace(/"/g, "")

    // REMOVE EXTRA LINES
    .replace(/\n{3,}/g, "\n\n")

    // CLEAN SPACES
    .replace(/\s+/g, " ")

    .trim();

  return answer;
}

export default sqlAnswerBuilder;