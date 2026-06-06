
function graphDecisionEngine(
  query,
  result
) {

  // =========================
  // BASIC VALIDATION
  // =========================

  if (

    !result ||

    !Array.isArray(result) ||

    result.length === 0

  ) {

    return {

      graph: false

    };

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

    return {

      graph: false

    };

  }

  const rowCount =
    result.length;

  // =========================
  // SMART NUMERIC COLUMN
  // =========================

  const numericColumn =

    columns.find(col => {

      return result.some(row => {

       const value =
  Number(
    String(row[col])
      .replace(/,/g, "")
      .replace(/₹/g, "")
      .replace(/%/g, "")
      .trim()
  );

        return !isNaN(value);

      });

    });

  // =========================
  // SMART TEXT COLUMN
  // =========================

const preferredTextColumns = [

  "doctor",
  "Doctor",
  "For",

  "patient",
  "Patient",
  "ApptWithFullName",

  "city",
  "City",

  "status",
  "Status",

  "category",
  "Category",

  "department",
  "Department",

  "service",
  "Service",

  "name",
  "Name"

];

  const textColumn =

    preferredTextColumns.find(
      preferred =>
        columns.includes(preferred)
    )

    ||

    columns.find(col => {

      return result.some(row => {

        return (

          typeof row[col] ===
          "string"

        );

      });

    });

  // =========================
  // NO NUMERIC DATA
  // =========================

  if (!numericColumn) {

    return {

      graph: false

    };

  }

  // =========================
  // DEFAULT CONFIG
  // =========================

  const config = {

    graph: true,

    graphType: "bar",

    title: "Analytics Chart",

    xAxis:
      textColumn || columns[0],

    yAxis:
      numericColumn,

    horizontal: false,

    stacked: false

  };

  // =========================
  // HUGE TABLES
  // =========================

  if (

    rowCount > 120

  ) {

    return {

      graph: false

    };

  }

  // =========================
  // TIME / TREND ANALYSIS
  // =========================

  const trendWords = [

    "trend",
    "timeline",
    "growth",

    "monthly",
    "daily",
    "weekly",
    "yearly",

    "over time",

    "date",
    "hour",
    "time"

  ];

  if (

    trendWords.some(
      word => q.includes(word)
    )

  ) {

    config.graphType =
      "line";

    config.title =
      "Trend Analysis";

    return config;

  }

  // =========================
  // DISTRIBUTION
  // =========================

  const distributionWords = [

    "distribution",
    "share",
    "status",
    "ratio",
    "percentage"

  ];

  if (

    distributionWords.some(
      word => q.includes(word)
    )

  ) {

    config.graphType =

      rowCount <= 8

        ? "pie"

        : "bar";

    config.title =
      "Distribution Analysis";

    return config;

  }

  // =========================
  // REVENUE ANALYSIS
  // =========================

  if (

    q.includes("revenue") ||

    q.includes("sales") ||

    q.includes("income") ||

    q.includes("earnings")

  ) {

    config.graphType =

      rowCount > 5

        ? "horizontalBar"

        : "bar";

    config.horizontal =
      rowCount > 5;

    config.title =
      "Revenue Analysis";

    return config;

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

    config.graphType =

      rowCount > 5

        ? "horizontalBar"

        : "bar";

    config.horizontal =
      rowCount > 5;

    config.title =
      "Top Performance Analysis";

    return config;

  }

  // =========================
  // COMPARISON
  // =========================

  if (

    q.includes("compare") ||

    q.includes("comparison") ||

    q.includes("vs")

  ) {

    config.graphType =
      "bar";

    config.title =
      "Comparison Analysis";

    return config;

  }

  // =========================
  // LARGE TABLES
  // =========================

if (
  rowCount > 80
) {

    return {

      graph: false

    };

  }

  // =========================
  // DEFAULT SMALL ANALYTICS
  // =========================

  return config;

}

export default graphDecisionEngine;