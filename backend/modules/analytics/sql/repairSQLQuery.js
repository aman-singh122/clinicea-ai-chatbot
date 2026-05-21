import ai from "../../../../config/gemini.js";

async function repairSQLQuery(

  query,
  failedSQL,
  errorMessage,
  schemaInfo

) {

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

- Return ONLY raw SQL

- No markdown

- No explanation

- No comments

- ONLY SELECT queries allowed

- NEVER hallucinate columns

- ALWAYS use exact column names

- Use DuckDB-compatible SQL ONLY

- If a DATE function is used on VARCHAR columns,
use TRY_CAST(column AS DATE)

- If a TIMESTAMP function is used on VARCHAR columns,
use TRY_CAST(column AS TIMESTAMP)

- If GROUP BY uses an alias,
ORDER BY should also use the alias
instead of recalculating expressions

- Avoid ORDER BY expressions
that are not present in GROUP BY
or aggregates

- Prefer ordering using selected aliases
whenever possible

- If DuckDB throws Binder Errors,
simplify the query safely

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

Fix the SQL query
based on the error.

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

  // =========================
  // CLEAN SQL
  // =========================

  return response.text

    .replace(/```sql/g, "")

    .replace(/```/g, "")

    .trim();

}

export default repairSQLQuery;