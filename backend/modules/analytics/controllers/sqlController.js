import path from "path";

import { fileURLToPath } from "url";

// =========================
// DUCKDB
// =========================

import validateSQL from "../sql/validateSQL.js";

import smartVisualizationSelector from "../graphs/smartVisualizationSelector.js";

import executeDuckQuery from "../duckdb/executeDuckQuery.js";

import businessRules from "../semantic/businessRules.js";

// =========================
// AI + ANALYTICS
// =========================

import repairSQLQuery from "../sql/repairSQLQuery.js";

import sqlQueryGenerator from "../sql/sqlQueryGenerator.js";

import graphDecisionEngine from "../graphs/graphDecisionEngine.js";

import graphGenerator from "../graphs/graphGenerator.js";

import sqlAnswerBuilder from "../sql/sqlAnswerBuilder.js";

// =========================
// DYNAMIC DATASETS
// =========================

import getAllDatasets from "../utils/getAllDatasets.js";

import getDatasetSchemas from "../utils/getDatasetSchemas.js";

import selectDataset from "../sql/selectDataset.js";

// =========================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// =========================

async function sqlController(req, res) {
  try {
    const { query, user } = req.body;

    // =========================
    // GET ALL DATASETS
    // =========================

    const datasets = getAllDatasets(user);

    console.log("\nALL DATASETS:\n", datasets);

    // =========================
    // EMPTY CHECK
    // =========================

    if (datasets.length === 0) {
      return res.status(400).json({
        success: false,

        answer: "No datasets uploaded.",
      });
    }

    // =========================
    // GET ALL SCHEMAS
    // =========================

    const schemaMap = await getDatasetSchemas(datasets);

    console.log("\nSCHEMA MAP:\n", schemaMap);

    // =========================
    // AI DATASET SELECTION
    // =========================

    const selectedDataset = await selectDataset({
      query,

      datasets,

      schemaMap,
    });

    console.log("\nSELECTED DATASET:\n", selectedDataset);

    // =========================
    // FIND DATASET
    // =========================

    const matchedDataset = datasets.find(
      (dataset) =>
        dataset.dataset.toLowerCase() === selectedDataset.toLowerCase(),
    );

    // =========================
    // CHECK
    // =========================

    if (!matchedDataset) {
      return res.status(400).json({
        success: false,

        answer: "Dataset selection failed.",
      });
    }

    // =========================
    // PARQUET PATH
    // =========================

    const parquetPath = matchedDataset.fullPath;

    console.log("\nPARQUET PATH:\n", parquetPath);

    // =========================
    // CURRENT SCHEMA
    // =========================

    const schemaInfo = schemaMap[matchedDataset.dataset];

    console.log("\nSCHEMA INFO:\n", schemaInfo);

    // =========================
    // AI SQL GENERATION
    // =========================

    const sql = await sqlQueryGenerator(
      query,

      schemaInfo,

      businessRules[matchedDataset.dataset] || {},
    );

    console.log("\nAI SQL:\n", sql);

    // =========================
    // REPLACE TABLE
    // =========================

    const finalSql = sql.replace(
      /FROM\s+records/gi,

      `FROM read_parquet('${parquetPath.replace(/\\/g, "/")}')`,
    );

    // =========================
    // VALIDATE SQL
    // =========================

    const safeSQL = validateSQL(finalSql);

    console.log("\nSAFE FINAL SQL:\n", safeSQL);

    let rawResult;

    try {
      // =========================
      // FIRST EXECUTION
      // =========================

      rawResult = await executeDuckQuery(safeSQL);
    } catch (sqlError) {
      console.log("\nINITIAL SQL FAILED:\n");

      console.log(sqlError.message);

      // =========================
      // REPAIR SQL
      // =========================

      const repairedSQL = await repairSQLQuery(
        query,

        safeSQL,

        sqlError.message,

        schemaInfo,
      );

      console.log("\nREPAIRED SQL:\n", repairedSQL);

      // =========================
      // VALIDATE AGAIN
      // =========================

      const validatedRepairSQL = validateSQL(repairedSQL);

      console.log("\nVALIDATED REPAIRED SQL:\n", validatedRepairSQL);

      // =========================
      // RETRY EXECUTION
      // =========================

      rawResult = await executeDuckQuery(validatedRepairSQL);
    }

    // =========================
    // BIGINT FIX
    // =========================

    const result = JSON.parse(
      JSON.stringify(
        rawResult,

        (key, value) => (typeof value === "bigint" ? Number(value) : value),
      ),
    );

    console.log("\nREAL RESULT:\n", result);

    // =========================
    // EMPTY RESULT
    // =========================

    if (!result || result.length === 0) {
      return res.json({
        success: true,

        type: "analytics",

        answer: "No matching records found.",

        result: [],
      });
    }

    // =========================
    // GRAPH ENGINE
    // =========================

    const visualization = smartVisualizationSelector(
      query,

      result,
    );

    console.log("\nSMART VISUALIZATION:\n", visualization);

    const graphConfig = graphDecisionEngine(
      query,

      result,
    );

    let graphData = null;

    if (graphConfig.graph) {
      graphData = graphGenerator(result);
    }

    console.log("\nGRAPH CONFIG:\n", graphConfig);

    console.log("\nGRAPH DATA:\n", graphData);

    // =========================
    // NATURAL LANGUAGE ANSWER
    // =========================

    const answer = await sqlAnswerBuilder(
      query,

      result,
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

      
      visualization,

      graphData,

      graphConfig,

      data: result.map((item) => ({
        label: Object.values(item)[0],

        value: Object.values(item)[1],
      })),
    });
  } catch (error) {
    console.log("\nSQL CONTROLLER ERROR:\n");

    console.log(error);

    res.status(500).json({
      success: false,

      answer: "Analytics generation failed.",

      error: error.message,
    });
  }
}

export default sqlController;
