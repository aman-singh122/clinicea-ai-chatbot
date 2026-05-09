function graphEngine(query, result) {

  // =========================
  // NO GRAPH REQUEST
  // =========================

  if (
    query.graph === false
  ) {

    return null;
  }

  const queryText =
    JSON.stringify(query)
      .toLowerCase();

  // =========================
  // SMALL DATA PIE CHART
  // =========================

  if (

    queryText.includes(
      "distribution"
    ) ||

    queryText.includes(
      "status"
    )

  ) {

    return {

      type: "pie",

      title:
        "Distribution Analysis"
    };
  }

  // =========================
  // TREND ANALYSIS
  // =========================

  if (

    query.operation ===
    "trend"

  ) {

    return {

      type: "line",

      title:
        "Trend Analysis"
    };
  }

  // =========================
  // COMPARISON
  // =========================

  if (

    query.operation ===
    "comparison"

  ) {

    return {

      type: "bar",

      title:
        "Comparison Analysis"
    };
  }

  // =========================
  // TOP ANALYTICS
  // =========================

  if (

    queryText.includes("top") ||

    queryText.includes("highest")

  ) {

    return {

      type: "bar",

      title:
        "Top Analytics"
    };
  }

  // =========================
  // LARGE DATASET
  // =========================

  if (
    result &&
    result.length > 15
  ) {

    return {

      type: "horizontalBar",

      title:
        "Large Dataset Analysis"
    };
  }

  // =========================
  // DEFAULT
  // =========================

  return {

    type: "bar",

    title:
      "Analytics Graph"
  };
}

export default graphEngine;