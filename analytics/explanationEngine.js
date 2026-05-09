function explanationEngine(

  query,
  result

) {

  if (

    !result.length

  ) {

    return "No analytics data found.";
  }

  const top =
    result[0];

  // =========================
  // COUNT
  // =========================

  if (

    query.aggregation === "count"

  ) {

    return `

${top.label}
has the highest count
with ${top.value} records.

`;
  }

  // =========================
  // SUM
  // =========================

  if (

    query.aggregation === "sum"

  ) {

    return `

${top.label}
generated the highest total
value of ${top.value}.

`;
  }

  // =========================
  // AVG
  // =========================

  if (

    query.aggregation === "avg"

  ) {

    return `

Average value observed:
${top.value.toFixed(2)}

`;
  }

  return "Analytics generated successfully.";
}

export default explanationEngine;