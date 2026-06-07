import createGeminiClient
from "../../../../config/gemini.js";

import getUserGemini
from "../../../utils/getUserGemini.js";

// =========================
// DYNAMIC SQL GENERATOR
// =========================

async function dynamicSQLQueryGenerator({
  query,
  user,
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

      const q = query.toLowerCase();

if (
  q.includes("top revenue doctor") ||
  q.includes("doctor revenue") ||
  q.includes("highest earning doctor")
) {

  const doctorColumn =
    schemaInfo.find(
      c =>
        c.name === "Doctor Name"
    )?.name ||

    schemaInfo.find(
      c =>
        c.name === "For"
    )?.name ||

    schemaInfo.find(
      c =>
        c.name === "Consulted By"
    )?.name;

  const revenueColumn =
    schemaInfo.find(
      c =>
        c.name === "Total (After Tax) Amt"
    )?.name ||

    schemaInfo.find(
      c =>
        c.name === "Service Price (After tax)"
    )?.name ||

    schemaInfo.find(
      c =>
        c.name === "Service Price After Tax"
    )?.name;

  if (doctorColumn && revenueColumn) {

    return `
SELECT
  "${doctorColumn}",
  SUM("${revenueColumn}") AS total_revenue
FROM read_parquet('${cleanParquetPath}')
WHERE "${doctorColumn}" IS NOT NULL
GROUP BY "${doctorColumn}"
ORDER BY total_revenue DESC
LIMIT 5
`;
  }
}

  const prompt = `

You are an expert DuckDB SQL generator for dynamic healthcare analytics datasets.

Your task:
Convert the user's natural language question into a DuckDB SELECT query for ONE uploaded dataset.

================================================
DATASET
================================================

Dataset name:
${metadata?.dataset || "User Selected Dataset"}

Dataset parquet source:
read_parquet('${cleanParquetPath}')

================================================
METADATA
================================================

Metrics:
${JSON.stringify(metadata?.metrics || [], null, 2)}

Dimensions:
${JSON.stringify(metadata?.dimensions || [], null, 2)}

Dates:
${JSON.stringify(metadata?.dates || [], null, 2)}

================================================
AVAILABLE COLUMNS
================================================

${formattedColumns}


================================================
COLUMN DETECTION RULES
================================================

Before generating SQL:

Check whether these columns exist.

Doctor columns priority:

1. "Doctor Name"
2. "For"
3. "Consulted By"
4. "Provider"
5. "Physician"

Revenue columns priority:

1. "Total (After Tax) Amt"
2. "Total Billed Amt"
3. "Service Price (After tax)"
4. "Service Price After Tax"

Patient columns priority:

1. "Patient Name"
2. "ApptWithFullName"
3. "BillToName"

IMPORTANT:

If user asks:

- top revenue doctors
- doctor revenue
- highest earning doctor
- doctor wise revenue

Then:

Use the FIRST available doctor column from the list above.

NEVER use:

"Resource"

for doctor analytics.

If "Doctor Name" exists:
always prefer "Doctor Name"

If "For" exists:
use "For"

only when "Doctor Name" does not exist.
================================================
STRICT RULES
================================================

- Return ONLY raw SQL.
- No markdown.
- No explanation.
- No comments.
- Generate exactly one SELECT or WITH query.
- Use DuckDB SQL only.
- Use ONLY this parquet source:
  read_parquet('${cleanParquetPath}')
- NEVER use table names like appointments, bills, or billitems.
- NEVER hallucinate columns.
- ALWAYS use exact column names from AVAILABLE COLUMNS.
- ALWAYS wrap column names in double quotes.
- Do not use DELETE, UPDATE, INSERT, DROP, ALTER, CREATE, COPY, ATTACH, or DETACH.
- Do not use REPLACE().

================================================
ANALYTICS RULES
================================================


- For total/count questions, use COUNT(*) unless a specific metric is requested.
- For metric questions, use SUM, AVG, MIN, or MAX based on the user's wording.
- For top/highest/best/most questions, ORDER BY the metric DESC and LIMIT 5.
- For lowest/least/minimum questions, ORDER BY the metric ASC and LIMIT 5.
- For trend/monthly/daily/weekly/date questions, group by the most relevant date column.
- For chart-friendly answers, prefer one dimension/date column plus one numeric aggregate.
- Ignore empty text values when grouping if useful.


================================================
HEALTHCARE SEMANTIC RULES
================================================

doctor =
"For"

provider =
"For"

consultant =
"For"

physician =
"For"

clinician =
"For"

patient =
"ApptWithFullName"

city =
"Patient City"

appointment revenue =
SUM("Service Price (After tax)")

IMPORTANT:

If both columns exist:

"For"
"Resource"

Then:

"For" = doctor/provider

"Resource" = room/service/wellness resource

For doctor analytics ALWAYS prefer:

"For"

Never use "Resource" for doctor ranking unless user explicitly asks about resources.


================================================
COLUMN SELECTION PRIORITY
================================================

When user asks:

top revenue doctors
doctor revenue
highest earning doctor
doctor wise revenue

Prefer:

"For"

as grouping column.

Example:

SELECT
  "For",
  SUM("Service Price (After tax)") AS total_revenue
FROM read_parquet(...)
GROUP BY "For"
ORDER BY total_revenue DESC
LIMIT 5

================================================
DATE RULES
================================================

DuckDB syntax:

strftime(date_column, format)

Correct:

strftime("ApptStartDtm", '%Y-%m')

Wrong:

strftime('%Y-%m', "ApptStartDtm")

DATE columns are already typed.

Do not CAST DATE columns.

================================================
TIME ANALYTICS RULES
================================================

For:

busy hour
peak hour
appointment timing
hourly trend

Use:

"Appt Start Time"

Example:

strftime(
  try_strptime(
    "Appt Start Time",
    '%I:%M %p'
  ),
  '%H'
)

================================================
SMART NUMERIC RULES
================================================

BIGINT
INTEGER
DOUBLE

are already numeric.

Never CAST them unnecessarily.

Never use REPLACE() on numeric columns.

Only clean values if they contain text such as:

45 Mins
₹1200
35%

================================================
REVENUE RULES
================================================

Revenue priority:

1. "Total (After Tax) Amt"
2. "Total Billed Amt"
3. "Service Price (After tax)"
4. "Service Price After Tax"

Doctor revenue:

GROUP BY "For"

Patient revenue:

GROUP BY "ApptWithFullName"

================================================
TOP RULES
================================================

top
highest
best
most
maximum

ORDER BY metric DESC

LIMIT 5

================================================
LOWEST RULES
================================================

lowest
least
minimum

ORDER BY metric ASC

LIMIT 5

================================================
TREND RULES
================================================

If user asks:

trend
growth
monthly
daily
weekly
timeline
over time

Group by date/month.

Prefer date column from metadata.

================================================
GROWTH RULES
================================================

For:

growth
increase
decrease
comparison
month over month

Use:

LAG()
OVER()

when applicable.

================================================
GRAPH OUTPUT RULES
================================================

For dashboard analytics:

Prefer:

1 dimension column

+

1 aggregate metric

Example:

Doctor + Revenue

City + Count

Month + Revenue

================================================
NULL FILTER RULES
================================================

When grouping:

ignore null values

Example:

WHERE "For" IS NOT NULL
AND "For" != ''

WHERE "Patient City" IS NOT NULL
AND "Patient City" != ''

================================================
HEALTHCARE COLUMN HINTS
================================================

doctor =
"For"

provider =
"For"

consultant =
"For"

physician =
"For"

clinician =
"For"

patient =
"ApptWithFullName"

city =
"Patient City"

appointment source =
"Appointment Source"

service =
"Service Name"

================================================
RESOURCE RULES
================================================

If both exist:

"For"
"Resource"

Then:

"For" = doctor/provider

"Resource" = room/service/wellness resource

Never use Resource for doctor ranking.

Never use Resource for doctor revenue.

Prefer "For" for all doctor analytics.

================================================
SQL SAFETY
================================================

Only generate:

SELECT

or

WITH

queries.

Never generate:

INSERT
UPDATE
DELETE
DROP
ALTER
CREATE
COPY
ATTACH
DETACH

================================================
USER QUESTION
================================================

${query}

`;

  let response;

  let retries = 5;

  while (retries > 0) {

    try {
      console.log("\n===== FINAL PROMPT =====\n");
console.log(prompt);

      response =
        await ai.models.generateContent({

          model: "gemini-2.5-flash",

          contents: prompt

        });
        console.log("\n===== GEMINI SQL =====\n");
console.log(response.text);

      break;

    } catch (error) {

      retries--;

      console.log(
        "\nDYNAMIC GEMINI SQL RETRY..."
      );

      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      if (retries === 0) {

        throw error;

      }

    }

  }

  return response.text
    .replace(/```sql/g, "")
    .replace(/```/g, "")
    .trim();

}

export default dynamicSQLQueryGenerator;
