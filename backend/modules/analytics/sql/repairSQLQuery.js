import createGeminiClient
from "../../../../config/gemini.js";

import getUserGemini
from "../../../utils/getUserGemini.js";

// =========================
// SQL REPAIR ENGINE
// =========================

async function repairSQLQuery(
  query,
  failedSQL,
  errorMessage,
  schemaInfo
) {

  // =========================
  // USER GEMINI API
  // =========================

  const apiKey =
    getUserGemini("user1");

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
    "\nSQL REPAIR AI READY"
  );

  // =========================
  // FORMAT SCHEMA
  // =========================

  const formattedColumns =
    schemaInfo
      .map(
        (col) =>
          `"${col.name}" (${col.type})`
      )
      .join(", ");

  // =========================
  // REPAIR PROMPT
  // =========================

  const prompt = `

You are an expert DuckDB SQL repair engine.

Your job is to FIX invalid SQL queries.

================================================
STRICT RULES
================================================

* Return ONLY raw SQL
* No markdown
* No explanation
* No comments
* ONLY SELECT queries allowed
* NEVER hallucinate columns
* ALWAYS use exact column names
* ALWAYS wrap column names in ""
* Use DuckDB-compatible SQL ONLY

================================================
AVAILABLE COLUMNS
================================================

${formattedColumns}

================================================
USER QUESTION
================================================

${query}

================================================
FAILED SQL
================================================

${failedSQL}

================================================
DUCKDB ERROR
================================================

${errorMessage}

================================================
TASK
================================================

Fix the SQL query based on the DuckDB error.

Return ONLY corrected SQL.

`;

  // =========================
  // GEMINI RESPONSE
  // =========================

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  console.log(
    "\nREPAIR RESPONSE:\n",
    JSON.stringify(response, null, 2)
  );

  // =========================
  // EXTRACT SQL
  // =========================

  const sql =
    response?.text ||
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";

  // =========================
  // CLEAN SQL
  // =========================

  return sql
    .replace(/```sql/gi, "")
    .replace(/```/g, "")
    .trim();
}

export default repairSQLQuery;