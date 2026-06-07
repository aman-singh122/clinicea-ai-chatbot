import createGeminiClient
from "../../../../config/gemini.js";

import getUserGemini
from "../../../utils/getUserGemini.js";

// =========================
// DYNAMIC SQL REPAIR ENGINE
// =========================

async function dynamicRepairSQLQuery({
  query,
  user,
  failedSQL,
  errorMessage,
  schemaInfo,
  metadata,
  parquetPath
}) {

  const apiKey =
    getUserGemini(user) ||
    getUserGemini("user1");

  if (!apiKey) {

    throw new Error(
      "No Gemini API Key Found"
    );

  }

  const ai =
    createGeminiClient(apiKey);

  const cleanParquetPath =
    parquetPath.replace(
      /\\/g,
      "/"
    );

  const formattedColumns =
    schemaInfo
      .map(col =>
        `"${col.name}" (${col.type})`
      )
      .join(", ");

  const prompt = `

You are an expert DuckDB SQL repair engine for dynamic uploaded datasets.

Your job is to fix the failed SQL query.

================================================
DATASET
================================================

Dataset:
${metadata.dataset}

Required source:
read_parquet('${cleanParquetPath}')

================================================
METADATA
================================================

Metrics:
${JSON.stringify(metadata.metrics || [], null, 2)}

Dimensions:
${JSON.stringify(metadata.dimensions || [], null, 2)}

Dates:
${JSON.stringify(metadata.dates || [], null, 2)}

================================================
AVAILABLE COLUMNS
================================================

${formattedColumns}

================================================
STRICT RULES
================================================

- Return ONLY raw SQL.
- No markdown.
- No explanation.
- No comments.
- Generate exactly one SELECT or WITH query.
- Use ONLY this source:
  read_parquet('${cleanParquetPath}')
- NEVER use table names like appointments, bills, or billitems.
- NEVER hallucinate columns.
- ALWAYS use exact column names from AVAILABLE COLUMNS.
- ALWAYS wrap column names in double quotes.
- Do not use DELETE, UPDATE, INSERT, DROP, ALTER, CREATE, COPY, ATTACH, or DETACH.
- Do not use REPLACE().

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

`;

  const response =
    await ai.models.generateContent({

      model: "gemini-2.5-flash",

      contents: prompt

    });

  return response.text
    .replace(/```sql/gi, "")
    .replace(/```/g, "")
    .trim();

}

export default dynamicRepairSQLQuery;
