import duckdb from "duckdb";

// =========================
// MERGE PARQUET FILES
// =========================

async function mergeParquetFiles({

  inputFiles,
  outputFile

}) {

  // =========================
  // EMPTY CHECK
  // =========================

  if (

    !inputFiles ||

    inputFiles.length === 0

  ) {

    throw new Error(
      "No parquet files provided."
    );

  }

  // =========================
  // CREATE FRESH DB
  // =========================

  const db =

    new duckdb.Database(
      ":memory:"
    );

  // =========================
  // FORMAT FILES
  // =========================

  const formattedFiles =

    inputFiles

      .map(

        file => `'${file}'`

      )

      .join(", ");

  // =========================
  // MERGE SQL
  // =========================

  const sql = `

COPY (

  SELECT *

  FROM read_parquet([

    ${formattedFiles}

  ])

)

TO '${outputFile}'

(FORMAT PARQUET);

`;

  console.log(
    "\nMERGE SQL:\n",
    sql
  );

  // =========================
  // EXECUTE
  // =========================

  return new Promise((resolve, reject) => {

    db.run(sql, (err) => {

      if (err) {

        console.log(
          "\nPARQUET MERGE FAILED:\n"
        );

        console.log(err);

        reject(err);

      } else {

        console.log(
          "\nPARQUET FILES MERGED SUCCESSFULLY"
        );

        resolve();

      }

    });

  });

}

export default mergeParquetFiles;