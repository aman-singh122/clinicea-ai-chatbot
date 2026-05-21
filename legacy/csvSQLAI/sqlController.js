import path from "path";
import { fileURLToPath } from "url";

// =========================
// DUCKDB
// =========================

import executeDuckQuery from "./duckdb/executeDuckQuery.js";

// =========================
// AI + ANALYTICS
// =========================

import sqlQueryGenerator from "./sqlQueryGenerator.js";

import graphDecisionEngine from "./graphDecisionEngine.js";

import graphGenerator from "./graphGenerator.js";

import sqlAnswerBuilder from "./sqlAnswerBuilder.js";

import datasetRouter from "./datasetRouter.js";

// =========================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// =========================

async function sqlController(req, res) {

  try {

    const { query, user } = req.body;

    // =========================
    // DATASET DETECTION
    // =========================

    const dataset =
      datasetRouter(query);

    let file = "";

    let parquetFile = "";

    // =========================
    // FILE MAPPING
    // =========================

    if (dataset === "Appointments") {

      file =
        "Appointments Report-202605071242.csv";

      parquetFile =
        "appointments.parquet";

    }

    else if (dataset === "Bills") {

      file =
        "Bills Report-202605071243.csv";

      parquetFile =
        "bills.parquet";

    }

    else if (dataset === "BillItems") {

      file =
        "Bill Items Report-202605071243.csv";

      parquetFile =
        "billitems.parquet";

    }

    console.log("\nDATASET:", dataset);

    console.log("\nSELECTED FILE:", file);

    // =========================
    // PARQUET PATH
    // =========================

    const parquetPath = path.join(

      __dirname,

      `../data/${user}/parquet/${parquetFile}`

    );

    console.log(
      "\nPARQUET PATH:",
      parquetPath
    );

    // =========================
    // GET SCHEMA INFO
    // =========================

    const columnsResult =
      await executeDuckQuery(`

        DESCRIBE
        SELECT *
        FROM read_parquet('${parquetPath.replace(/\\/g, "/")}')

      `);

    // =========================
    // SCHEMA INFO
    // =========================

    const schemaInfo =
      columnsResult.map(col => ({

        name:
          col.column_name,

        type:
          col.column_type

      }));

    console.log(
      "\nSCHEMA INFO:\n",
      schemaInfo
    );

    // =========================
    // AI SQL GENERATION
    // =========================

    const sql =
      await sqlQueryGenerator(

        query,

        schemaInfo

      );

    console.log(
      "\nAI SQL:\n",
      sql
    );

    // =========================
    // REPLACE TABLE
    // =========================

    const finalSql = sql.replace(

      /FROM\s+records/gi,

      `FROM read_parquet('${parquetPath.replace(/\\/g, "/")}')`

    );

    console.log(
      "\nFINAL SQL:\n",
      finalSql
    );

    // =========================
    // EXECUTE QUERY
    // =========================

    const rawResult =
      await executeDuckQuery(finalSql);

    // =========================
    // BIGINT FIX
    // =========================

    const result = JSON.parse(

      JSON.stringify(

        rawResult,

        (key, value) =>

          typeof value === "bigint"
            ? Number(value)
            : value

      )

    );

    console.log(
      "\nREAL RESULT:\n",
      result
    );

    // =========================
    // EMPTY RESULT
    // =========================

    if (

      !result ||

      result.length === 0

    ) {

      return res.json({

        success: true,

        type: "analytics",

        answer:
          "No matching records found.",

        result: [],

      });

    }

    // =========================
    // GRAPH ENGINE
    // =========================

    const graphConfig =
      graphDecisionEngine(

        query,

        result

      );

    let graphData = null;

    if (graphConfig.graph) {

      graphData =
        graphGenerator(result);

    }

    console.log(
      "\nGRAPH CONFIG:\n",
      graphConfig
    );

    console.log(
      "\nGRAPH DATA:\n",
      graphData
    );

    // =========================
    // NATURAL LANGUAGE ANSWER
    // =========================

    const answer =
      await sqlAnswerBuilder(

        query,

        result

      );

    // =========================
    // RESPONSE
    // =========================

    res.json({

      success: true,

      type: "analytics",

      explanation: answer,

      sql: finalSql,

      result,

      answer,

      graphConfig,

      graphData,

      data: result.map(item => ({

        label:
          Object.values(item)[0],

        value:
          Object.values(item)[1]

      }))

    });

  }

  catch (error) {

    console.log("\nSQL CONTROLLER ERROR:\n");

    console.log(error);

    res.status(500).json({

      success: false,

      answer:
        "Analytics generation failed.",

      error:
        error.message

    });

  }

}

export default sqlController;