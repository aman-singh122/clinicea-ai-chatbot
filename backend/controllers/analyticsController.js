import path from "path";

import { fileURLToPath }
from "url";

import loadExcel
from "../../analytics/loadExcel.js";

import queryToJson
from "../../analytics/queryToJson.js";

import schemaEngine
from "../../analytics/schemaEngine.js";

import semanticMapper
from "../../analytics/semanticMapper.js";

import executeAnalytics
from "../../analytics/executeAnalytics.js";

import graphEngine
from "../../analytics/graphEngine.js";

import explanationEngine
from "../../analytics/explanationEngine.js";

import findRelevantFiles
from "../utils/findRelevantFile.js";


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

async function analyticsController(

  req,
  res

) {

  try {

    const {

      query,

      user

    } = req.body;


    console.log(
      "\n========================="
    );

    console.log(
      "USER QUERY:\n",
      query
    );

    console.log(
      "=========================\n"
    );


    // =========================
    // FIND RELEVANT FILES
    // =========================

    const selectedFiles =
      findRelevantFiles(

        user,

        query
      );


    console.log(
      "SELECTED FILES:\n",
      selectedFiles
    );


    // =========================
    // LOAD FILES
    // =========================

    let allData = [];

    for (

      const fileName
      of selectedFiles

    ) {

      const filePath =
        path.join(

          __dirname,

          `../../data/${user}/${fileName}`
        );

      console.log(
        "\nLOADING FILE:\n",
        filePath
      );

      const fileData =
        loadExcel(filePath);

      allData = [

        ...allData,

        ...fileData
      ];
    }


    // =========================
    // NO DATA CHECK
    // =========================

    if (

      allData.length === 0

    ) {

      return res.json({

        success: false,

        type: "text",

        message:
          "No data found."
      });
    }


    console.log(
      "\nTOTAL RECORDS:\n",
      allData.length
    );


    // =========================
    // SCHEMA ENGINE
    // =========================

    const schema =
      schemaEngine(allData);


    console.log(
      "\nSCHEMA GENERATED"
    );


    // =========================
    // AVAILABLE COLUMNS
    // =========================

    const availableColumns =
      schema.map(field =>

        `${field.column} (${field.type})`
      ).join("\n");


    console.log(
      "\nAVAILABLE COLUMNS:\n",
      availableColumns
    );


    // =========================
    // AI QUERY TO JSON
    // =========================

    const queryJson =
      await queryToJson(

        query,

        availableColumns
      );


    console.log(
      "\nQUERY JSON:\n",
      queryJson
    );


    // =========================
    // QUERY FAIL SAFE
    // =========================

    if (

      !queryJson ||

      queryJson.error

    ) {

      return res.json({

        success: false,

        type: "text",

        message:
          "AI could not understand the query."
      });
    }


    // =========================
    // SEMANTIC MAPPING
    // =========================

    let dimensionColumn =
      null;

    let metricColumn =
      null;


    // =========================
    // DIMENSION
    // =========================

    if (

      queryJson.dimension

    ) {

      dimensionColumn =
        semanticMapper(

          schema,

          queryJson.dimension
        );
    }


    // =========================
    // METRIC
    // =========================

    if (

      queryJson.metric

    ) {

      metricColumn =
        semanticMapper(

          schema,

          queryJson.metric
        );
    }


    // =========================
    // COUNT FIX
    // =========================

    if (

      queryJson.aggregation ===
      "count"

    ) {

      metricColumn = null;
    }


    // =========================
    // DYNAMIC FILTER MAPPING
    // =========================

    const mappedFilters = {};

    if (

      queryJson.filters

    ) {

      for (

        const filter
        of queryJson.filters

      ) {

        mappedFilters[
          filter.field
        ] = semanticMapper(

          schema,

          filter.field
        );
      }
    }


    console.log(
      "\nMAPPED FILTERS:\n",
      mappedFilters
    );


    console.log(
      "\nMAPPED COLUMNS:\n",
      {

        dimensionColumn,

        metricColumn
      }
    );


    // =========================
    // DATE COLUMN AUTO DETECT
    // =========================

    const dateColumn =
      schema.find(

        field =>
          field.type === "date"

      )?.column;


    // =========================
    // DATE FILTER AUTO FIX
    // =========================

    if (

      queryJson.filters

    ) {

      queryJson.filters =
        queryJson.filters.map(
          filter => {

            if (

              filter.field ===
              "date"

            ) {

              return {

                ...filter,

                field:
                  dateColumn
              };
            }

            return filter;
          }
        );
    }


    // =========================
    // MAPPING FAIL SAFE
    // =========================

  if (

  queryJson.operation !==
  "summary" &&

  !dimensionColumn

) {

  return res.json({

    success: false,

    type: "text",

    message:
      "Could not map analytics columns."
  });
}


    // =========================
    // EXECUTE ANALYTICS
    // =========================

    const result =
      executeAnalytics(

        allData,

        queryJson,

        {

          dimension:
            dimensionColumn,

          metric:
            metricColumn,

          ...mappedFilters
        }
      );


    console.log(
      "\nFINAL RESULT:\n",
      result
    );


    // =========================
    // NO RESULT CHECK
    // =========================

    if (

      !result ||

      result.length === 0

    ) {

      return res.json({

        success: false,

        type: "text",

        message:
          "No analytics data found."
      });
    }


    // =========================
    // GRAPH ENGINE
    // =========================

    const graph =
      graphEngine(

        queryJson,

        result
      );


    console.log(
      "\nGRAPH CONFIG:\n",
      graph
    );


    // =========================
    // AI EXPLANATION
    // =========================

    const explanation =
      explanationEngine(

        queryJson,

        result
      );


    console.log(
      "\nAI EXPLANATION:\n",
      explanation
    );


    // =========================
    // FINAL RESPONSE
    // =========================

    return res.json({

      type: "analytics",

      success: true,

      query,

      selectedFiles,

      queryJson,

      mappedColumns: {

        dimensionColumn,

        metricColumn
      },

      mappedFilters,

      graph,

      explanation,

      data: result
    });

  } catch (error) {

    console.log(
      "\nANALYTICS ERROR:\n",
      error
    );

    return res.status(500).json({

      success: false,

      type: "text",

      message:
        "Analytics processing failed."
    });
  }
}

export default analyticsController;