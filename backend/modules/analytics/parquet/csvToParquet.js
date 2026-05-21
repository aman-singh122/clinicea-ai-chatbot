import db from "../duckdb/duckdbConnection.js";

// =========================
// CSV → PARQUET
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
  // SQL
  // =========================

  const sql = `

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

  console.log(
    "\nCSV TO PARQUET SQL:\n",
    sql
  );

  // =========================
  // EXECUTE
  // =========================

  return new Promise(

    (
      resolve,
      reject
    ) => {

      db.run(

        sql,

        (err) => {

          if (err) {

            console.log(
              "\nCSV → PARQUET FAILED:\n"
            );

            console.log(err);

            reject(err);

          } else {

            console.log(
              "\nPARQUET GENERATED SUCCESSFULLY"
            );

            resolve();

          }

        }

      );

    }

  );

}

export default csvToParquet;