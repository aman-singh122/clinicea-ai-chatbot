import ai from "../config/gemini.js";

async function sqlQueryGenerator(
  query,
  columns
) {

  const formattedColumns =
    columns
      .map(col => `"${col}"`)
      .join(", ");

const prompt = `

You are an expert SQLite SQL generator.

Your task is to convert natural language healthcare analytics questions into accurate SQLite SQL queries.

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

- Use SQLite-compatible SQL ONLY

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

confirmed =
"Status" = 'Confirmed'

doctor =
"For"

patient =
"ApptWithFullName"

city =
"Patient City"

appointment =
records from appointment dataset

================================================
REVENUE RULES
================================================

If column exists:
"Total (After Tax) Amt"

Use it for ALL revenue calculations.

Otherwise use:
"Service Price (After tax)"

Never use any other revenue column.

================================================
DATASET UNDERSTANDING
================================================

If table contains:

"Item"

Then:

item =
"Item"

product =
"Item"

medicine =
"Item"

drug =
"Item"

tablet =
"Item"

capsule =
"Item"

service =
"Item"

revenue =
"Total (After Tax) Amt"

------------------------------------------------

If table contains:

"Bill For"

Then:

patient =
"Bill For"

doctor =
"BillDocName"

revenue =
"Total Billed Amt"

================================================
MEDICINE FILTERING RULES
================================================

If user asks for:

medicines,
drugs,
tablets,
capsules,
pharmacy items

Prefer rows where:

"Item" contains medicine-like names.

Avoid:
consultations,
packages,
procedures,
services.

================================================
DATE RULES
================================================

Dates are stored in:

YYYY-MM-DD

Example:

2026-04-08

Extract month:

substr("ApptStartDtm", 6, 2)

Extract year:

substr("ApptStartDtm", 1, 4)

Extract date:

substr("ApptStartDtm", 1, 10)

================================================
TIME ANALYTICS RULES
================================================

If user asks:

per hour,
hourly trend,
appointments per hour,
busy hours,
peak hours,
hour distribution

Then use:
substr("Appt Start Time", 1, 2)

Example:

SELECT
strftime('%H', "Appt Start Time") AS hour,
COUNT(*) as total
FROM records
GROUP BY hour
ORDER BY hour

================================================
TREND ANALYSIS RULES
================================================

If user asks:

trend,
over time,
monthly trend,
daily trend,
growth,
comparison over dates

Prefer grouped date/month queries.

Use line-chart-friendly outputs.

================================================
TOP / BEST / HIGHEST RULES
================================================

If user asks:

top,
highest,
most,
best,
maximum

Use:

ORDER BY total DESC

or revenue DESC

and LIMIT 5 unless user specifies another number.

================================================
LOWEST RULES
================================================

If user asks:

lowest,
least,
minimum

Use:

ORDER BY total ASC

================================================
COMPARISON RULES
================================================

If user asks:

compare,
vs,
difference between

Generate grouped comparison SQL.

================================================
NULL / EMPTY HANDLING
================================================

Always ignore empty values when relevant.

Examples:

"ApptWithFullName" != ''

"For" != ''

"Patient City" != ''

================================================
GRAPH FRIENDLY OUTPUT RULES
================================================

For graph/trend/chart questions:

ALWAYS return:

1 category column
+
1 numeric aggregate column

Examples:

COUNT(*)
SUM(...)
AVG(...)

================================================
AGGREGATION RULES
================================================

count =
COUNT(*)

total revenue =
SUM(...)

average =
AVG(...)

minimum =
MIN(...)

maximum =
MAX(...)

================================================
MONTH MAPPING
================================================

jan = 01
january = 01

feb = 02
february = 02

mar = 03
march = 03

apr = 04
april = 04

may = 05

jun = 06
june = 06

jul = 07
july = 07

aug = 08
august = 08

sep = 09
sept = 09
september = 09

oct = 10
october = 10

nov = 11
november = 11

dec = 12
december = 12

================================================
ADVANCED QUERY UNDERSTANDING
================================================

Understand these naturally:

- appointments by doctor
- revenue by city
- top medicines
- patient growth
- appointment trends
- cancellation trends
- doctor performance
- busiest day
- busiest hour
- monthly revenue
- appointment distribution
- service analytics
- consultation trends
- repeat patients
- top paying patients
- average waiting time
- appointment duration analysis

================================================
SQL SAFETY RULES
================================================

- NEVER use columns not present in AVAILABLE COLUMNS

- NEVER generate destructive SQL

DO NOT USE:
DELETE
UPDATE
INSERT
DROP
ALTER

ONLY generate:
SELECT queries

================================================
AVAILABLE COLUMNS
================================================

${formattedColumns}

================================================
USER QUESTION
================================================

${query}

`;

  const response =
    await ai.models.generateContent({

      model:
        "gemini-2.5-flash",

      contents:
        prompt
    });

  return response.text
    .replace(/```sql/g, "")
    .replace(/```/g, "")
    .trim();
}

export default sqlQueryGenerator;