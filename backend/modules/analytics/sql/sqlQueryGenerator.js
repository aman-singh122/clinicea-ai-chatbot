import createGeminiClient
from "../../../../config/gemini.js";

import getUserGemini
from "../../../utils/getUserGemini.js";


async function sqlQueryGenerator(

  
  query,
  schemaInfo,
  semanticInfo
) {


const apiKey =
  getUserGemini("user1");

// =========================
// API KEY CHECK
// =========================

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

// =========================
// DEBUG
// =========================

console.log(
  "\nAPI KEY FOUND"
);

console.log(
  "\nAI CLIENT CREATED"
);

  // =========================
  // FORMAT COLUMNS + TYPES
  // =========================

  const formattedColumns =

    schemaInfo

      .map(

        (col) =>

          `"${col.name}" (${col.type})`

      )

      .join(", ");

  // =========================
  // PROMPT
  // =========================

  const prompt = `

You are an expert DuckDB SQL generator.

Your task is to convert natural language healthcare analytics questions into accurate DuckDB SQL queries.

================================================
CORE RULES
================================================

- Table name is always:
records

- Return ONLY raw SQL

- No markdown
- No explanation
- No comments

- NEVER hallucinate columns

- ALWAYS use exact column names from AVAILABLE COLUMNS

- ALWAYS wrap column names in ""

- Use DuckDB-compatible SQL ONLY

================================================
DATE RULES
================================================

DuckDB syntax:

strftime(date_column, format)

CORRECT:

strftime("ApptStartDtm", '%Y-%m')

WRONG:

strftime('%Y-%m', "ApptStartDtm")

------------------------------------------------

IMPORTANT:

- DATE columns are already typed properly
- NEVER use try_strptime()
- NEVER CAST DATE columns

------------------------------------------------

Examples:

strftime("ApptStartDtm", '%w')

strftime("ApptStartDtm", '%Y-%m')

strftime("Bill Date", '%Y')



================================================
TIME ANALYTICS RULES
================================================

IMPORTANT:

For appointment hour analysis,
busy hour analysis,
peak time analysis,
hourly trends,
appointment timing analysis:

ALWAYS use:

"Appt Start Time"

NOT:

"ApptStartDtm"

------------------------------------------------

Correct Example:

strftime(

  try_strptime(

    "Appt Start Time",

    '%I:%M %p'

  ),

  '%H'

)

------------------------------------------------

Examples:

busiest appointment hour

SELECT

  strftime(

    try_strptime(

      "Appt Start Time",

      '%I:%M %p'

    ),

    '%H'

  ) as appointment_hour,

  COUNT(*) as total_appointments

FROM records

GROUP BY appointment_hour

ORDER BY total_appointments DESC

LIMIT 1

================================================

================================================
SMART NUMERIC RULES
================================================

Some columns are already:

DOUBLE
INTEGER
BIGINT

DO NOT use:
REPLACE()
CAST()

on already numeric columns.

------------------------------------------------

ONLY clean columns if they contain dirty text values like:

"3 Mins"
"₹1,200"
"45%"

------------------------------------------------

SAFE CLEANING EXAMPLES
================================================

Duration Example:

AVG(

  CAST(

    REPLACE(

      REPLACE(

        REPLACE(
          "Waiting Duration",
          'Mins',
          ''
        ),

        'mins',
        ''

      ),

      ',',
      ''

    )

  AS DOUBLE)

)

------------------------------------------------

Revenue Example:

SUM("Total Billed Amt")

------------------------------------------------

Another Revenue Example:

SUM("Service Price (After tax)")

================================================
IMPORTANT AGGREGATION RULES
================================================

COUNT:
COUNT(*)

SUM:
SUM(column)

AVERAGE:
AVG(column)

MINIMUM:
MIN(column)

MAXIMUM:
MAX(column)

================================================
WEEKDAY MAPPING
================================================

0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday

================================================
BUSINESS SEMANTIC RULES
================================================

visited =
"Status" = 'Check Out'

cancelled =
"Status" = 'Cancelled'

waiting =
"Status" = 'Waiting'

scheduled =
"Status" = 'Scheduled'

doctor =
"For"

patient =
"ApptWithFullName"

city =
"Patient City"

================================================
REVENUE RULES
================================================

If column exists:

"Total (After Tax) Amt"

Use it for revenue calculations.

Otherwise use:

"Total Billed Amt"

Otherwise use:

"Service Price (After tax)"

================================================
TREND RULES
================================================

If user asks:

trend
monthly
daily
growth
timeline
over time

Then generate grouped date/month queries.

================================================
TOP RULES
================================================

If user asks:

top
highest
best
most
maximum

Then:

ORDER BY metric DESC

LIMIT 5

================================================
LOWEST RULES
================================================

If user asks:

lowest
least
minimum

Then:

ORDER BY metric ASC



================================================
GROWTH / COMPARISON RULES
================================================

If the user asks about:

- growth
- increase
- decrease
- comparison
- month-over-month
- week-over-week
- change
- trend difference

Then:

Use SQL window functions like:

LAG()
OVER()

to calculate:

- difference
- growth value
- percentage growth

instead of only returning totals.

Example:

revenue growth month by month
should calculate:

current_month_revenue
-
previous_month_revenue

or growth percentage.
================================================

================================================
GRAPH OUTPUT RULES
================================================

For analytics/chart questions:

Return:

1 dimension column
+
1 aggregate column

================================================
NULL HANDLING
================================================

Ignore empty values when relevant.

Examples:

"Patient City" != ''

"For" != ''

"ApptWithFullName" != ''

================================================
SQL SAFETY
================================================

ONLY generate:

SELECT queries

NEVER generate:

DELETE
UPDATE
INSERT
DROP
ALTER


================================================
BUSINESS CONTEXT
================================================

${JSON.stringify(
  semanticInfo,
  null,
  2
)}

================================================
================================================
AVAILABLE COLUMNS
================================================

${formattedColumns}

================================================
USER QUESTION
================================================

${query}

`;

  // =========================
  // GEMINI
  // =========================

 let response;

let retries = 5;

while (retries > 0) {

  try {

    response =
      await ai.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt

      });

    break;

  } catch (error) {

    retries--;

    console.log(
      "\nGEMINI SQL RETRY..."
    );

    // wait 2 sec

    await new Promise(
      resolve =>
        setTimeout(resolve, 2000)
    );

    if (retries === 0) {

      throw error;

    }

  }

}

  // =========================
  // CLEAN SQL
  // =========================

  return response.text

    .replace(/```sql/g, "")

    .replace(/```/g, "")

    .trim();

}

export default sqlQueryGenerator;