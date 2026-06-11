
import path from "path";

import { fileURLToPath } from "url";

// =========================
// DUCKDB
// =========================

import validateSQL from "../sql/validateSQL.js";

import smartVisualizationSelector from "../graphs/smartVisualizationSelector.js";

import executeDuckQuery from "../duckdb/executeDuckQuery.js";

import businessRules from "../semantic/businessRules.js";

import loadDatasetMetadata from "../semantic/loadDatasetMetadata.js";

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

import datasetRouter from "../utils/datasetRouter.js";

import selectDataset from "../sql/selectDataset.js";

import selectDynamicDataset from "../sql/dynamicDatasetSelector.js";

import dynamicSQLQueryGenerator from "../sql/dynamicSQLQueryGenerator.js";

import dynamicRepairSQLQuery from "../sql/dynamicRepairSQLQuery.js";

// =========================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


// =========================

async function sqlController(req, res) {
  console.log("REQ BODY:");
console.log(req.body);
  try {
    const { query, user, dataset } = req.body;

    // =========================
    // GET ALL DATASETS
    // =========================

    const datasets = getAllDatasets(user);
    const schemaMap =
  await getDatasetSchemas(datasets);

const metadataMap =
  loadDatasetMetadata(user);

      let selectedDataset;
let matchedDataset;
let selectedMetadata = null;
let useDynamicFlow = false;
let forceDataset = false;
    // =========================
// USER SELECTED DATASET
// =========================

if (dataset) {

  console.log(
    "\nUSER SELECTED DATASET:\n",
    dataset
  );

  matchedDataset = datasets.find(
    d =>
      d.file === dataset ||
      d.dataset === dataset.replace(
        ".parquet",
        ""
      )
  );

  if (!matchedDataset) {
    return res.status(400).json({
      success: false,
      answer: "Selected dataset not found."
    });
  }

  selectedDataset =
    matchedDataset.dataset;

  forceDataset = true;
  useDynamicFlow = true;

  selectedMetadata =
  metadataMap[
    matchedDataset.dataset
  ];

console.log(
  "FORCED DATASET METADATA:",
  selectedMetadata
);


  console.log(
    "\nFORCED DATASET PATH:\n",
    matchedDataset.fullPath
  );
}

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

   

    console.log("\nSCHEMA MAP:\n", schemaMap);

    // =========================
    // LOAD DYNAMIC METADATA
    // =========================

    
    console.log("\nDYNAMIC METADATA MAP:\n", metadataMap);

    // =========================
    // STATIC VS DYNAMIC ROUTING
    // =========================

    const staticRoute = datasetRouter(query);

    const shouldUseStaticFlow = staticRoute && staticRoute !== "AI_FALLBACK";



if (!forceDataset) {
    if (shouldUseStaticFlow) {
      console.log("\nSTATIC ROUTE CONFIRMED:\n", staticRoute);

      // =========================
      // EXISTING STATIC AI DATASET SELECTION
      // =========================

      selectedDataset = await selectDataset({
        query,

        datasets,

        schemaMap,
      });

      console.log("\nSELECTED STATIC DATASET:\n", selectedDataset);

      matchedDataset = datasets.find(
        (dataset) =>
          dataset.dataset.toLowerCase() === selectedDataset.toLowerCase(),
      );
    } else {
      console.log("\nSTATIC ROUTER LOW CONFIDENCE - TRYING DYNAMIC METADATA");

      const dynamicSelection = selectDynamicDataset({
        query,

        datasets,

        metadataMap,
      });

      if (dynamicSelection) {
        useDynamicFlow = true;

        matchedDataset = dynamicSelection.dataset;

        selectedDataset = matchedDataset.dataset;

        selectedMetadata = dynamicSelection.metadata;

        console.log("\nSELECTED DYNAMIC DATASET:\n", selectedDataset);
      } else {
        console.log(
          "\nDYNAMIC SELECTION FAILED - USING EXISTING STATIC FALLBACK",
        );

        selectedDataset = await selectDataset({
          query,

          datasets,

          schemaMap,
        });

        console.log("\nSELECTED FALLBACK DATASET:\n", selectedDataset);

        matchedDataset = datasets.find(
          (dataset) =>
            dataset.dataset.toLowerCase() === selectedDataset.toLowerCase(),
        );
      }
    }
   // existing routing code

}



    // =========================
    // FIND DATASET
    // =========================

    if (!matchedDataset) {
      return res.status(400).json({
        success: false,

        answer: "Dataset selection failed.",
      });
    }

    // =========================
// FORCE DYNAMIC FLOW
// =========================

useDynamicFlow = true;

selectedMetadata =
  metadataMap[
    matchedDataset.dataset
  ];

console.log(
  "\nFORCED DYNAMIC FLOW:",
  useDynamicFlow
);

console.log(
  "\nSELECTED METADATA:",
  selectedMetadata
);

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

const sql = useDynamicFlow
  ? await dynamicSQLQueryGenerator({
      query,
      user,
      schemaInfo,
      metadata: selectedMetadata,
      parquetPath,
    })
  : await sqlQueryGenerator(
      user,
      query,
      schemaInfo,
      businessRules[matchedDataset.dataset] || {},
    );

    console.log("\nAI SQL:\n", sql);

    // =========================
    // REPLACE TABLE
    // =========================

    const finalSql = sql;

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

      const repairedSQL = useDynamicFlow
        ? await dynamicRepairSQLQuery({
            query,

            user,

            failedSQL: safeSQL,

            errorMessage: sqlError.message,

            schemaInfo,

            metadata: selectedMetadata,

            parquetPath,
          })
        : await repairSQLQuery(
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
  graphData = graphGenerator(
    result,
    graphConfig
  );
}
    console.log("\nGRAPH CONFIG:\n", graphConfig);

    console.log("\nGRAPH DATA:\n", graphData);

    // =========================
    // NATURAL LANGUAGE ANSWER
    // =========================

const answer = await sqlAnswerBuilder(
  user,
  query,
  result
);

console.log("\nQUESTION:\n", query);

console.log("\nFINAL SQL:\n", safeSQL);

console.log("\nROWS:\n", result.length);

console.log("\nANSWER:\n", answer);
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
