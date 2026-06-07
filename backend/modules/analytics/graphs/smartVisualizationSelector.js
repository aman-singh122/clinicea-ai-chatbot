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
  // FIND COLUMN TYPES
  // =========================

  const numericColumns =
    columns.filter(col =>
      result.some(row => {

        const value =
          row[col];

        if (
          typeof value === "number"
        ) {
          return true;
        }

        if (
          typeof value === "string"
        ) {

          const cleaned =
            value
              .replace(/,/g, "")
              .replace(/₹/g, "")
              .replace(/%/g, "")
              .trim();

          return !isNaN(
            Number(cleaned)
          );
        }

        return false;

      })
    );

  const dateColumns =
    columns.filter(col => {

      const lower =
        col.toLowerCase();

      return (
        lower.includes("date") ||
        lower.includes("dtm") ||
        lower.includes("time")
      );

    });

  const statusColumns =
    columns.filter(col =>
      col.toLowerCase().includes("status")
    );

  // =========================
  // KPI
  // =========================

  if (
    rowCount === 1 &&
    numericColumns.length === 1
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
    columns.length > 1
  ) {

    return {
      type: "kpiCard"
    };

  }

  // =========================
  // DATE + STATUS
  // =========================

  if (
    dateColumns.length > 0 &&
    statusColumns.length > 0 &&
    numericColumns.length > 0
  ) {

    return {
      type: "stackedBar"
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
    ) ||

    dateColumns.length > 0

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
  // STATUS ANALYSIS
  // =========================

  if (

    q.includes("status")

  ) {

    return {

      type:

        rowCount <= 8

          ? "pieChart"

          : "barChart"

    };

  }

  // =========================
  // REVENUE
  // =========================

  if (

    q.includes("revenue") ||
    q.includes("sales") ||
    q.includes("income") ||
    q.includes("earnings")

  ) {

    return {

      type:

        rowCount > 5

          ? "horizontalBar"

          : "barChart"

    };

  }

  // =========================
  // TOP ANALYSIS
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
  // HUGE TABLES
  // =========================

  if (
    rowCount > 100
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