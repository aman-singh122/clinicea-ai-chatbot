import path from "path";

import { fileURLToPath }
from "url";

import csvToSqlite
from "./csvToSqlite.js";

import sqlQueryGenerator
from "./sqlQueryGenerator.js";

import graphDecisionEngine
from "./graphDecisionEngine.js";

import graphGenerator
from "./graphGenerator.js";


import executeSql
from "./executeSql.js";


import sqlAnswerBuilder
from "./sqlAnswerBuilder.js";


import datasetRouter
from "./datasetRouter.js";


// =========================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);


// =========================

async function sqlController(req, res) {

  try {

  const {
  query,
  user
} = req.body;

// =========================
// AUTO DATASET DETECTION
// =========================

const dataset =
  datasetRouter(query);

let file = "";

// =========================
// FILE MAPPING
// =========================

if (dataset === "Appointments") {

  file =
    "Appointments Report-202605071242.csv";
}

else if (dataset === "Bills") {

  file =
    "Bills Report-202605071243.csv";
}

else if (dataset === "BillItems") {

  file =
    "Bill Items Report-202605071243.csv";
}

console.log(
  "\nDATASET:",
  dataset
);

console.log(
  "\nSELECTED FILE:",
  file
);

    const filePath =
      path.join(

        __dirname,

        `../data/${user}/${file}`
      );

    // CSV → SQLITE

    const db =
      await csvToSqlite(filePath);

    // GET COLUMNS

    const columnsResult =
      await db.all(`
        PRAGMA table_info(records)
      `);

    const columns =
      columnsResult.map(
        col => col.name
      );

    // AI SQL QUERY

    const sql =
      await sqlQueryGenerator(

        query,
        columns
      );

    console.log("\nSQL:\n", sql);

    // EXECUTE SQL

const result =
  await executeSql(
    db,
    sql
  );

console.log(
  "\nREAL RESULT:\n",
  result
);

const graphConfig =

  graphDecisionEngine(
    query,
    result
  );

let graphData = null;

if (graphConfig.graph) {

  graphData =

    graphGenerator(
      result
    );
}

console.log(
  "\nGRAPH CONFIG:\n",
  graphConfig
);

console.log(
  "\nGRAPH DATA:\n",
  graphData
);
    // NATURAL ANSWER

    const answer =
      await sqlAnswerBuilder(
        query,
        result
      );

res.json({

  success: true,

  type: "analytics",

  explanation: answer,

  data: result.map(
    item => ({

      label:
        Object.keys(item)[0],

      value:
        Object.values(item)[0]
    })
  ),

  success: true,

sql,

result,

answer,

graphConfig,

graphData
});

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      answer:
        "SQL AI failed."
    });
  }
}

export default sqlController;