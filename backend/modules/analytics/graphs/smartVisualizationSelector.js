function smartVisualizationSelector(
  query,
  result
) {

  // =========================
  // EMPTY
  // =========================

  if (
    !result ||
    !Array.isArray(result) ||
    result.length === 0
  ) {

    return {
      type: "empty"
    };

  }

  const q =
    query.toLowerCase();

  const rowCount =
    result.length;

  const firstRow =
    result[0];

  const columns =
    Object.keys(firstRow);

  // =========================
  // KPI
  // =========================

  if (
    rowCount === 1 &&
    columns.length === 1
  ) {

    return {
      type: "kpi"
    };

  }

  // =========================
  // KPI CARD
  // =========================

  if (
    rowCount === 1 &&
    columns.length === 2
  ) {

    return {
      type: "kpiCard"
    };

  }

  // =========================
  // TREND
  // =========================

  const trendWords = [

    "trend",
    "growth",
    "timeline",
    "monthly",
    "daily",
    "weekly",
    "yearly",
    "time",
    "date"

  ];

  if (

    trendWords.some(
      word => q.includes(word)
    )

  ) {

    return {
      type: "lineChart"
    };

  }

  // =========================
  // DISTRIBUTION
  // =========================

  const distributionWords = [

    "distribution",
    "status",
    "share",
    "percentage",
    "ratio"

  ];

  if (

    distributionWords.some(
      word => q.includes(word)
    )

  ) {

    return {

      type:

        rowCount <= 8

          ? "pieChart"

          : "barChart"

    };

  }

  // =========================
  // TOP / BEST
  // =========================

  const topWords = [

    "top",
    "highest",
    "best",
    "most"

  ];

  if (

    topWords.some(
      word => q.includes(word)
    )

  ) {

    return {

      type:

        rowCount > 5

          ? "horizontalBar"

          : "barChart"

    };

  }

  // =========================
  // REVENUE
  // =========================

  if (

    q.includes("revenue") ||
    q.includes("sales") ||
    q.includes("income")

  ) {

    return {

      type:

        rowCount > 5

          ? "horizontalBar"

          : "barChart"

    };

  }

  // =========================
  // COMPARISON
  // =========================

  if (

    q.includes("compare") ||
    q.includes("comparison") ||
    q.includes("vs")

  ) {

    return {
      type: "groupedBar"
    };

  }

  // =========================
  // LARGE TABLES
  // =========================

  if (
    rowCount > 20
  ) {

    return {
      type: "table"
    };

  }

  // =========================
  // DEFAULT
  // =========================

  return {
    type: "barChart"
  };

}

export default smartVisualizationSelector;