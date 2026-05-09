import ai from "../config/gemini.js";

async function queryToJson(query) {

  const prompt = `
You are an advanced AI analytics query parser.

Your task:
Convert natural language analytics queries
into structured JSON.

IMPORTANT RULES:

- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text
- Never return null
- Always detect the best analytics intent

==================================
SUPPORTED OPERATIONS
==================================

- groupBy
- trend
- comparison
- distribution
- summary

==================================
SUPPORTED AGGREGATIONS
==================================

- sum
- count
- avg
- min
- max

==================================
GRAPH RULES
==================================

SUMMARY QUERIES:
- graph = false

GROUP / TREND / COMPARISON:
- graph = true

==================================
FILTER RULES
==================================

Use this format:

{
  "field": "status",
  "operator": "=",
  "value": "cancelled"
}

Supported operators:
- =
- >
- <
- between

==================================
IMPORTANT LOGIC
==================================

1. If query asks:
- how many
- total
- count
- number of

THEN:
operation = "summary"

2. If query asks:
- top
- highest
- lowest
- best
- most

THEN:
operation = "groupBy"

3. If query asks:
- trend
- over time
- monthly
- daily

THEN:
operation = "trend"

4. If query asks:
- distribution
- breakdown
- percentage

THEN:
operation = "distribution"

5. If query asks:
- compare
- versus
- vs

THEN:
operation = "comparison"

==================================
EXAMPLES
==================================

Query:
top 5 doctors by revenue

JSON:
{
  "intent": "analytics",
  "operation": "groupBy",
  "dimension": "doctor",
  "metric": "revenue",
  "aggregation": "sum",
  "sort": "desc",
  "limit": 5,
  "graph": true
}

Query:
top patients by billing

JSON:
{
  "intent": "analytics",
  "operation": "groupBy",
  "dimension": "patient",
  "metric": "billing",
  "aggregation": "sum",
  "sort": "desc",
  "graph": true
}

Query:
top services by revenue

JSON:
{
  "intent": "analytics",
  "operation": "groupBy",
  "dimension": "service",
  "metric": "revenue",
  "aggregation": "sum",
  "sort": "desc",
  "graph": true
}

Query:
how many appointments were cancelled

JSON:
{
  "intent": "analytics",
  "operation": "summary",
  "metric": "appointments",
  "aggregation": "count",
  "filters": [
    {
      "field": "status",
      "operator": "=",
      "value": "cancelled"
    }
  ],
  "graph": false
}

Query:
which patient has negative balance

JSON:
{
  "intent": "analytics",
  "operation": "groupBy",
  "dimension": "patient",
  "metric": "balance",
  "aggregation": "min",
  "sort": "asc",
  "graph": true
}

Query:
revenue between march and april

JSON:
{
  "intent": "analytics",
  "operation": "trend",
  "metric": "revenue",
  "aggregation": "sum",
  "filters": [
    {
      "field": "date",
      "operator": "between",
      "value": ["march","april"]
    }
  ],
  "graph": true
}

Query:
appointments after 5 pm

JSON:
{
  "intent": "analytics",
  "operation": "summary",
  "metric": "appointments",
  "aggregation": "count",
  "filters": [
    {
      "field": "time",
      "operator": ">",
      "value": "17:00"
    }
  ],
  "graph": false
}

Query:
appointment status distribution

JSON:
{
  "intent": "analytics",
  "operation": "distribution",
  "dimension": "status",
  "aggregation": "count",
  "graph": true
}

Query:
doctor revenue comparison

JSON:
{
  "intent": "analytics",
  "operation": "comparison",
  "dimension": "doctor",
  "metric": "revenue",
  "aggregation": "sum",
  "graph": true
}

==================================
USER QUERY
==================================

${query}
`;

  try {

    const response =
      await ai.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt
      });

    let text =
      response.text;

    // =========================
    // CLEAN RESPONSE
    // =========================

    text =
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed =
      JSON.parse(text);

    // =========================
    // FAIL SAFE DEFAULTS
    // =========================

    if (!parsed.intent) {

      parsed.intent =
        "analytics";
    }

    if (!parsed.operation) {

      parsed.operation =
        "groupBy";
    }

    if (!parsed.aggregation) {

      parsed.aggregation =
        "count";
    }

    if (
      parsed.graph === undefined
    ) {

      parsed.graph = true;
    }

    return parsed;

  } catch (error) {

    console.log(
      "\nQUERY TO JSON ERROR:\n",
      error.message
    );

    // =========================
    // FALLBACK RULE ENGINE
    // =========================

    const lowerQuery =
      query.toLowerCase();

    // SUMMARY

    if (

      lowerQuery.includes(
        "how many"
      ) ||

      lowerQuery.includes(
        "total"
      ) ||

      lowerQuery.includes(
        "count"
      )

    ) {

      return {

        intent: "analytics",

        operation: "summary",

        metric: "appointments",

        aggregation: "count",

        graph: false
      };
    }

    // TOP / HIGHEST

    if (

      lowerQuery.includes("top") ||

      lowerQuery.includes(
        "highest"
      )

    ) {

      return {

        intent: "analytics",

        operation: "groupBy",

        dimension: "doctor",

        aggregation: "count",

        sort: "desc",

        limit: 10,

        graph: true
      };
    }

    // DEFAULT

    return {

      intent: "analytics",

      operation: "groupBy",

      aggregation: "count",

      graph: true
    };
  }
}

export default queryToJson;