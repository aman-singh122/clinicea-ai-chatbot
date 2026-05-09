function graphDecisionEngine(
  query,
  result
) {

  const q =
    query.toLowerCase();

  // =====================
  // LINE GRAPH
  // =====================

  if (

    q.includes("trend") ||

    q.includes("monthly") ||

    q.includes("daily") ||

    q.includes("over time") ||

    q.includes("yearly") ||

    q.includes("timeline")

  ) {

    return {

      graph: true,

      graphType: "line"
    };
  }

  // =====================
  // PIE CHART
  // =====================

  if (

    q.includes("distribution") ||

    q.includes("percentage") ||

    q.includes("share") ||

    q.includes("ratio")

  ) {

    return {

      graph: true,

      graphType: "pie"
    };
  }

  // =====================
  // BAR CHART
  // =====================

  if (

    q.includes("top") ||

    q.includes("compare") ||

    q.includes("highest") ||

    q.includes("most") ||

    q.includes("best") ||

    q.includes("status") ||

    q.includes("appointments") ||

    q.includes("revenue") ||

    q.includes("medicine") ||

    q.includes("doctor") ||

    q.includes("item")

  ) {

    return {

      graph: true,

      graphType: "bar"
    };
  }

  // =====================
  // DEFAULT
  // =====================

  return {

    graph: true,

    graphType: "bar"
  };
}

export default graphDecisionEngine;