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

Convert user question into SQLite query.

================================================
RULES
================================================

- Table name:
records

- Return ONLY SQL

- No markdown

- No explanation

- ALWAYS wrap columns in ""

================================================
IMPORTANT BUSINESS RULES
================================================

visited =
"Status" = 'Check Out'

cancelled =
"Status" = 'Cancelled'

doctor =
"For"

patient =
"ApptWithFullName"

city =
"Patient City"

- revenue means:

IF column exists:
"Total (After Tax) Amt"

OTHERWISE:
"Service Price (After tax)"


================================================
DATASET UNDERSTANDING
================================================

If table contains:

"Item"

Then:

item means:
"Item"

product means:
"Item"

medicine means:
"Item"

service means:
"Item"

revenue means:
"Total (After Tax) Amt"

------------------------------------------------

If table contains:

"Bill For"

Then:

patient means:
"Bill For"

doctor means:
"BillDocName"

revenue means:
"Total Billed Amt"


If user asks for medicines,
drugs,
tablets,
capsules,
pharmacy items,

prefer rows where:

"Item"
contains medicine-like names.

Avoid generic services.

================================================
DATE FORMAT
================================================

Dates are stored as:

YYYY-MM-DD

Example:

2026-04-08

Month extraction:

substr("ApptStartDtm", 6, 2)

Year extraction:

substr("ApptStartDtm", 1, 4)

================================================
MONTH MAPPING
================================================

jan = 01
feb = 02
mar = 03
apr = 04
april = 04
may = 05
jun = 06
jul = 07
aug = 08
sep = 09
oct = 10
nov = 11
dec = 12

================================================
VERY IMPORTANT
================================================

- Ignore empty patient names

Example:

"ApptWithFullName" != ''

================================================
EXAMPLES
================================================

Question:
who visited in april

SQL:
SELECT DISTINCT
"ApptWithFullName"
FROM records
WHERE "Status" = 'Check Out'
AND "ApptWithFullName" != ''
AND substr(
"ApptStartDtm",
6,
2
) = '04'

------------------------------------------------

Question:
top doctors

SQL:
SELECT
"For",
COUNT(*) as total
FROM records
WHERE "For" != ''
GROUP BY "For"
ORDER BY total DESC
LIMIT 5

------------------------------------------------

Question:
how many cancelled appointments

SQL:
SELECT COUNT(*) as total
FROM records
WHERE "Status" = 'Cancelled'

================================================
IMPORTANT COLUMN RULES
================================================

- If table contains:
"Total (After Tax) Amt"

THEN revenue calculations
MUST use:

"Total (After Tax) Amt"

- If table contains:
"Service Price (After tax)"

THEN revenue calculations
MUST use:

"Service Price (After tax)"

- NEVER invent columns

- ALWAYS use exact column names
from AVAILABLE COLUMNS

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