import path from "path";

import { fileURLToPath }
from "url";

import csvLoader
from "./csvLoader.js";

import csvSchema
from "./csvSchema.js";

import csvToSqlite
from "../csvSQLAI/csvToSqlite.js";

import sqlQueryGenerator
from "../csvSQLAI/sqlQueryGenerator.js";

import executeSql
from "../csvSQLAI/executeSql.js";

import sqlAnswerBuilder
from "../csvSQLAI/sqlAnswerBuilder.js";


// =========================
// __dirname
// =========================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);


// =========================
// CONTROLLER
// =========================

async function csvController(req, res) {

  try {

    const {
      query,
      user,
      file
    } = req.body;

    // =========================
    // FILE PATH
    // =========================

    const filePath =
      path.join(

        __dirname,

        `../data/${user}/${file}`
      );

    console.log(
      "\nCSV FILE:\n",
      filePath
    );

    // =========================
    // LOAD CSV
    // =========================

    const data =
      await csvLoader(filePath);

    console.log(
      "\nTOTAL ROWS:\n",
      data.length
    );

    // =========================
    // SCHEMA
    // =========================

    const schema =
      csvSchema(data);

    console.log(
      "\nSCHEMA:\n",
      schema
    );

    // =========================
    // CSV → SQLITE
    // =========================

    const db =
      await csvToSqlite(filePath);

    // =========================
    // GENERATE SQL
    // =========================

    const sql =
      await sqlQueryGenerator(

        query,
        schema
      );

    console.log(
      "\nGENERATED SQL:\n",
      sql
    );

    // =========================
    // EXECUTE SQL
    // =========================

    const result =
      await executeSql(
        db,
        sql
      );

    console.log(
      "\nSQL RESULT:\n",
      result
    );

    // =========================
    // NATURAL ANSWER
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

      type: "csv-ai",

      sql,

      result,

      answer
    });

  } catch (error) {

    console.log(
      "\nCSV AI ERROR:\n",
      error
    );

    res.status(500).json({

      success: false,

      answer:
        "CSV AI failed."
    });
  }
}

export default csvController;