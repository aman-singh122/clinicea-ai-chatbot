function graphDecisionEngine(
  query,
  result
) {

  const q =
    query.toLowerCase();

  // =========================
  // EMPTY RESULT
  // =========================

  if (
    !result ||
    result.length === 0
  ) {

    return {

      graph: false

    };

  }

  // =========================
  // COLUMN DETECTION
  // =========================

  const firstRow =
    result[0];

  const columns =
    Object.keys(firstRow);

  // =========================
  // GRAPH CONFIG
  // =========================

  const config = {

    graph: true,

    graphType: "bar",

    title: "Analytics Chart",

    xAxis: columns[0],

    yAxis: columns[1],

    horizontal: false,

    stacked: false

  };

  // =========================
  // ROW COUNT
  // =========================

  const rowCount =
    result.length;

  // =========================
  // TIME DETECTION
  // =========================

  const timeWords = [

    "trend",
    "monthly",
    "daily",
    "yearly",
    "timeline",
    "over time",
    "growth",
    "week",
    "weekday",
    "month",
    "date"

  ];

  if (

    timeWords.some(
      word => q.includes(word)
    )

  ) {

    config.graphType = "line";

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
    "percentage",
    "ratio"

  ];

  if (

    distributionWords.some(
      word => q.includes(word)
    )

  ) {

    // Too many categories
    // pie looks ugly

    if (rowCount <= 8) {

      config.graphType = "pie";

    } else {

      config.graphType = "bar";

    }

    config.title =
      "Distribution Analysis";

    return config;

  }

  // =========================
  // CORRELATION
  // =========================

  const correlationWords = [

    "relationship",
    "correlation",
    "impact",
    "compare duration"

  ];

  if (

    correlationWords.some(
      word => q.includes(word)
    )

  ) {

    config.graphType =
      "scatter";

    config.title =
      "Correlation Analysis";

    return config;

  }

  // =========================
  // STACKED BAR
  // =========================

  if (

    q.includes("status by") ||

    q.includes("category by") ||

    q.includes("grouped")

  ) {

    config.graphType =
      "stackedBar";

    config.stacked = true;

    config.title =
      "Grouped Comparison";

    return config;

  }

  // =========================
  // HORIZONTAL BAR
  // =========================

  if (

    rowCount > 10

  ) {

    config.horizontal = true;

  }

  // =========================
  // REVENUE
  // =========================

  if (

    q.includes("revenue") ||

    q.includes("sales") ||

    q.includes("earnings")

  ) {

    config.graphType =
      "bar";

    config.title =
      "Revenue Analysis";

    return config;

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

    config.graphType =
      "bar";

    config.title =
      "Top Performance Analysis";

    return config;

  }

  // =========================
  // DEFAULT
  // =========================

  return config;

}

export default graphDecisionEngine;