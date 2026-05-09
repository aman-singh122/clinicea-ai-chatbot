import dotenv from "dotenv";

dotenv.config();

import fs from "fs";
import explanationEngine
from "./analytics/explanationEngine.js";

import graphEngine
from "./analytics/graphEngine.js";

import Papa from "papaparse";

import queryToJson
from "./analytics/queryToJson.js";

import buildSchema
from "./analytics/schemaEngine.js";

import semanticMapper
from "./analytics/semanticMapper.js";

import executeAnalytics
from "./analytics/executeAnalytics.js";


// ==========================
// LOAD CSV
// ==========================

const csv =
  fs.readFileSync(

    "./data/user1/Appointments Report-202605071242.csv",

    "utf-8"
  );

const parsed =
  Papa.parse(csv, {

    header: true,

    skipEmptyLines: true
  });

const data =
  parsed.data;


// ==========================
// USER QUERY
// ==========================

const userQuery =
  "top 5 doctors by appointments";


// ==========================
// QUERY TO JSON
// ==========================

const queryJson =
  await queryToJson(userQuery);

console.log(
  "\nQUERY JSON:\n",
  queryJson
);


// ==========================
// BUILD SCHEMA
// ==========================

const schema =
  buildSchema(data);

console.log(
  "\nSCHEMA:\n",
  schema
);


// ==========================
// SEMANTIC MAPPING
// ==========================

let dimensionColumn = null;

if (

  queryJson.dimension

) {

  dimensionColumn =
    semanticMapper(

      schema,

      queryJson.dimension
    );
}

let metricColumn = null;

if (

  queryJson.metric

) {

  metricColumn =
    semanticMapper(

      schema,

      queryJson.metric
    );
}

console.log(
  "\nMAPPED COLUMNS:\n",
  {
    dimensionColumn,
    metricColumn
  }
);


// ==========================
// EXECUTE ANALYTICS
// ==========================
if (

  queryJson.aggregation === "count"

) {

  metricColumn = null;
}

const result =
  executeAnalytics(

    data,

    queryJson,

    {

      dimension:
        dimensionColumn,

      metric:
        metricColumn
    }
  );

console.log(
  "\nFINAL RESULT:\n",
  result
);

console.table(result);

const graphConfig =
  graphEngine(queryJson);

console.log(

  "\nGRAPH CONFIG:\n",

  

  graphConfig
);

const explanation =
  explanationEngine(

    queryJson,

    result
  );

console.log(

  "\nAI EXPLANATION:\n",

  explanation
);