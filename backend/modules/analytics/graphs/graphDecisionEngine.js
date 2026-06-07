function graphDecisionEngine(
  query,
  result
) {

  if (
    !result ||
    !Array.isArray(result) ||
    result.length === 0
  ) {
    return { graph: false };
  }

  if (
    result.length <= 1
  ) {
    return { graph: false };
  }

  const q =
    query.toLowerCase();

  const firstRow =
    result[0];

  const columns =
    Object.keys(firstRow);

  if (
    columns.length < 2
  ) {
    return { graph: false };
  }

  const rowCount =
    result.length;

  // =========================
  // NUMERIC COLUMN
  // =========================

  const numericColumn =
    columns.find(col =>

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

  if (!numericColumn) {
    return { graph: false };
  }

  // =========================
  // TEXT COLUMN
  // =========================

  const textColumn =
    columns.find(col =>
      typeof firstRow[col] ===
      "string"
    ) || columns[0];

  // =========================
  // DATE COLUMN
  // =========================

  const dateColumn =
    columns.find(col => {

      const lower =
        col.toLowerCase();

      return (
        lower.includes("date") ||
        lower.includes("dtm") ||
        lower.includes("time")
      );

    });

  const statusColumn =
    columns.find(col =>
      col.toLowerCase()
        .includes("status")
    );

  // =========================
  // HUGE TABLE
  // =========================

  if (
    rowCount > 120
  ) {
    return { graph: false };
  }

  // =========================
  // STATUS TREND
  // =========================

  if (

    dateColumn &&
    statusColumn &&
    (
      q.includes("status") ||
      q.includes("appointment")
    )

  ) {

    return {

      graph: true,

      graphType:
        "stackedBar",

      title:
        "Status Trend Analysis",

      xAxis:
        dateColumn,

      yAxis:
        numericColumn,

      category:
        statusColumn,

      stacked: true,

      horizontal: false

    };

  }

  // =========================
  // REVENUE TREND
  // =========================

  if (

    (
      q.includes("revenue") ||
      q.includes("sales") ||
      q.includes("income") ||
      q.includes("earnings")
    )

    &&

    dateColumn

  ) {

    return {

      graph: true,

      graphType:
        "line",

      title:
        "Revenue Trend",

      xAxis:
        dateColumn,

      yAxis:
        numericColumn,

      horizontal: false,

      stacked: false

    };

  }

  // =========================
  // TREND
  // =========================

  const trendWords = [

    "trend",
    "timeline",
    "growth",
    "monthly",
    "daily",
    "weekly",
    "yearly",
    "over time"

  ];

  if (

    trendWords.some(
      word =>
        q.includes(word)
    )

  ) {

    return {

      graph: true,

      graphType:
        "line",

      title:
        "Trend Analysis",

      xAxis:
        dateColumn || textColumn,

      yAxis:
        numericColumn,

      horizontal: false,

      stacked: false

    };

  }

  // =========================
  // STATUS
  // =========================

  if (
    q.includes("status")
  ) {

    return {

      graph: true,

      graphType:

        rowCount <= 8
          ? "pie"
          : "bar",

      title:
        "Status Analysis",

      xAxis:
        textColumn,

      yAxis:
        numericColumn

    };

  }

  // =========================
  // DISTRIBUTION
  // =========================

  if (

    q.includes("distribution") ||
    q.includes("share") ||
    q.includes("ratio") ||
    q.includes("percentage")

  ) {

    return {

      graph: true,

      graphType:

        rowCount <= 8
          ? "pie"
          : "bar",

      title:
        "Distribution Analysis",

      xAxis:
        textColumn,

      yAxis:
        numericColumn

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

      graph: true,

      graphType:

        rowCount > 5
          ? "horizontalBar"
          : "bar",

      title:
        "Revenue Analysis",

      horizontal:
        rowCount > 5,

      xAxis:
        textColumn,

      yAxis:
        numericColumn

    };

  }

  // =========================
  // TOP ANALYSIS
  // =========================

  if (

    q.includes("top") ||
    q.includes("highest") ||
    q.includes("best") ||
    q.includes("most")

  ) {

    return {

      graph: true,

      graphType:

        rowCount > 5
          ? "horizontalBar"
          : "bar",

      title:
        "Top Performance Analysis",

      horizontal:
        rowCount > 5,

      xAxis:
        textColumn,

      yAxis:
        numericColumn

    };

  }

  // =========================
  // DEFAULT
  // =========================

  return {

    graph: true,

    graphType:
      "bar",

    title:
      "Analytics Chart",

    xAxis:
      textColumn,

    yAxis:
      numericColumn,

    horizontal: false,

    stacked: false
  };

}

export default graphDecisionEngine;