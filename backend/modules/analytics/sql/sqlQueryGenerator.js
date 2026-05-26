import ai from "../../../../config/gemini.js";
async function sqlQueryGenerator(
  query,
  schemaInfo,
  semanticInfo
) {

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

export default sqlQueryGenerator;