import db from "../duckdb/duckdbConnection.js";

// =========================
// CSV TO PARQUET
// USING DUCKDB
// =========================

async function csvToParquet(
  csvPath,
  parquetPath
) {

  // =========================
  // CLEAN PATHS
  // =========================

  const cleanCSVPath =
    csvPath.replace(
      /\\/g,
      "/"
    );

  const cleanParquetPath =
    parquetPath.replace(
      /\\/g,
      "/"
    );

  // =========================
  // STATIC MANAGED TABLES
  // =========================

  let tableName = "";

  const lowerParquetPath =
    cleanParquetPath.toLowerCase();

  if (
    lowerParquetPath.includes("appointment")
  ) {

    tableName =
      "appointments";

  } else if (
    lowerParquetPath.includes("billitem")
  ) {

    tableName =
      "billitems";

  } else if (
    lowerParquetPath.includes("bill")
  ) {

    tableName =
      "bills";

  }

  // =========================
  // SQL
  // =========================

  const copySql = `

COPY (

  SELECT *

  FROM read_csv_auto(
    '${cleanCSVPath}',
    sample_size = -1,
    ignore_errors = true
  )

)

TO '${cleanParquetPath}'

(FORMAT PARQUET);

`;

  const tableSql =
    tableName
      ? `

CREATE OR REPLACE TABLE ${tableName} AS

SELECT *

FROM read_parquet(
  '${cleanParquetPath}'
);

`
      : "";

  const sql =
    copySql + tableSql;

  // =========================
  // DEBUG
  // =========================

  console.log(
    "\nCSV TO PARQUET SQL:\n",
    sql
  );

  console.log(
    "\nDUCKDB TABLE:\n",
    tableName || "dynamic parquet only"
  );

  // =========================
  // EXECUTE
  // =========================

  return new Promise(
    (resolve, reject) => {

      db.run(
        sql,
        (err) => {

          if (err) {

            console.log(
              "\nCSV TO PARQUET FAILED:\n"
            );

            console.log(err);

            reject(err);

          } else {

            console.log(
              "\nPARQUET GENERATED SUCCESSFULLY"
            );

            if (tableName) {

              console.log(
                "\nDUCKDB TABLE CREATED:",
                tableName
              );

            } else {

              console.log(
                "\nDYNAMIC DATASET SAVED AS PARQUET ONLY"
              );

            }

            resolve();

          }

        }
      );

    }
  );

}

export default csvToParquet;
