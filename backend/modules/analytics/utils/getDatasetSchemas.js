import executeDuckQuery
from "../duckdb/executeDuckQuery.js";

// =========================
// GET DATASET SCHEMAS
// =========================

async function getDatasetSchemas(
  datasets
) {

  const schemaMap = {};

  for (const dataset of datasets) {

    const sql = `

DESCRIBE
SELECT *
FROM read_parquet(
'${dataset.fullPath.replace(/\\/g, "/")}'
)

`;

    const result =
      await executeDuckQuery(sql);

    schemaMap[
      dataset.dataset
    ] = result.map(col => ({

      name:
        col.column_name,

      type:
        col.column_type

    }));

  }

  return schemaMap;

}

export default getDatasetSchemas;