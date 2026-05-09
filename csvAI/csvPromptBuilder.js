function csvPromptBuilder(query, rows, schema) {

  return `

You are an advanced CSV AI assistant.

Your job:
Analyze CSV data and answer user questions correctly.

IMPORTANT RULES:

- Use ONLY the provided CSV data
- Never make up answers
- Perform reasoning on rows
- Find highest values
- Find lowest values
- Count records
- Compare records
- Analyze amounts
- Analyze patient names
- Analyze bill amounts

If answer not found:
Reply:
"Answer not found in CSV."

=========================
CSV COLUMNS
=========================

${schema.join(", ")}

=========================
CSV DATA
=========================

${JSON.stringify(rows, null, 2)}

=========================
USER QUESTION
=========================

${query}

`;
}

export default csvPromptBuilder;