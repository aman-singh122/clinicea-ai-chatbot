import {
  getTotalRows,
  findColumn,
  detectBestColumn,
  filterRows,
  countByColumn,
  sumColumn,
  getRowsByDate,
} from "./analyticsEngine.js";

import {
  generatePieChart,
  generateBarChart,
  generateLineChart,
} from "./graphGenerator.js";

async function processAnalyticsQuery(query, data) {

  query =
    query.toLowerCase();

console.log(

  "CSV HEADERS:",

  Object.keys(data[0])

);
  // =========================
  // GRAPH COLUMN DETECTION
  // =========================

  const graphColumn =
    detectBestColumn(
      data,
      query
    );


  // =========================
  // PIE CHART
  // =========================

  if (

    query.includes("distribution") ||

    query.includes("pie chart") ||

    query.includes("pie graph")

  ) {

    const graphPath =
      await generatePieChart(
        data,
        graphColumn
      );

    return {

      type: "graph",

      graphUrl:
        graphPath,

      message:
        `${graphColumn} distribution graph generated successfully.`
    };
  }


  // =========================
  // BAR CHART
  // =========================

  if (

    query.includes("bar chart") ||

    query.includes("bar graph") ||

    query.includes("comparison")

  ) {

    const graphPath =
      await generateBarChart(
        data,
        graphColumn
      );

    return {

      type: "graph",

      graphUrl:
        graphPath,

      message:
        `${graphColumn} comparison graph generated successfully.`
    };
  }


  // =========================
  // LINE CHART
  // =========================

  if (

    query.includes("trend") ||

    query.includes("line chart") ||

    query.includes("line graph")

  ) {

    const graphPath =
      await generateLineChart(
        data,
        graphColumn
      );

    return {

      type: "graph",

      graphUrl:
        graphPath,

      message:
        `${graphColumn} trend graph generated successfully.`
    };
  }


  // =========================
  // TOTAL RECORDS
  // =========================

  if (

    query.includes("total") ||

    query.includes("how many") ||

    query.includes("records")

  ) {

    return {

      type: "text",

      message:
        `Total records are ${getTotalRows(data)}`
    };
  }


  // =========================
  // CANCELLED RECORDS
  // =========================

  if (
    query.includes("cancelled")
  ) {

    const statusColumn =
      findColumn(data, [
        "status"
      ]);

    if (!statusColumn) {

      return {

        type: "text",

        message:
          "Status column not found."
      };
    }

    const cancelled =
      filterRows(
        data,
        statusColumn,
        "cancelled"
      );

    return {

      type: "text",

      message:
        `Cancelled records are ${cancelled.length}`
    };
  }


  // =========================
  // COMPLETED RECORDS
  // =========================

  if (

    query.includes("completed") ||

    query.includes("check out")

  ) {

    const statusColumn =
      findColumn(data, [
        "status"
      ]);

    if (!statusColumn) {

      return {

        type: "text",

        message:
          "Status column not found."
      };
    }

    const completed =
      filterRows(
        data,
        statusColumn,
        "check out"
      );

    return {

      type: "text",

      message:
        `Completed records are ${completed.length}`
    };
  }


  // =========================
  // WAITING RECORDS
  // =========================

  if (
    query.includes("waiting")
  ) {

    const statusColumn =
      findColumn(data, [
        "status"
      ]);

    if (!statusColumn) {

      return {

        type: "text",

        message:
          "Status column not found."
      };
    }

    const waiting =
      filterRows(
        data,
        statusColumn,
        "waiting"
      );

    return {

      type: "text",

      message:
        `Waiting records are ${waiting.length}`
    };
  }


  // =========================
  // REVENUE
  // =========================

  if (

    query.includes("revenue") ||

    query.includes("income") ||

    query.includes("sales")

  ) {

    const revenueColumn =
      findColumn(data, [

        "amount",

        "price",

        "after tax",

        "revenue",

        "total",

        "grand total",

        "bill amount",

        "paid"
      ]);


    if (!revenueColumn) {

      return {

        type: "text",

        message:
          "Revenue column not found."
      };
    }


    const revenue =
      sumColumn(
        data,
        revenueColumn
      );

    return {

      type: "text",

      message:
        `Total revenue is ₹${revenue}`
    };
  }


  // =========================
  // DATE QUERY
  // =========================

  const dateMatch =
    query.match(
      /\d{2}-\d{2}-\d{4}/
    );


  if (dateMatch) {

    const date =
      dateMatch[0];


    const dateColumn =
      findColumn(data, [

        "date",

        "created",

        "appointment",

        "time"
      ]);


    if (!dateColumn) {

      return {

        type: "text",

        message:
          "Date column not found."
      };
    }


    const rows =
      getRowsByDate(
        data,
        dateColumn,
        date
      );

    return {

      type: "text",

      message:
        `Total records on ${date} are ${rows.length}`
    };
  }


  // =========================
  // FALLBACK COLUMN SUMMARY
  // =========================

  if (

    query.includes("summary") ||

    query.includes("analysis")

  ) {

    const counts =
      countByColumn(
        data,
        graphColumn
      );

    return {

      type: "text",

      message:
        JSON.stringify(
          counts,
          null,
          2
        )
    };
  }


  // =========================
  // UNKNOWN QUERY
  // =========================

  return {

    type: "text",

    message:
      "Sorry, I could not understand the analytics query."
  };
}

export default processAnalyticsQuery;