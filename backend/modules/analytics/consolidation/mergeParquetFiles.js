import db from "../duckdb/duckdbConnection.js";

async function mergeParquetFiles(

  parquetFiles,

  outputPath

) {

  const cleanedFiles =

    parquetFiles.map(

      file =>

        `'${file.replace(/\\/g, "/")}'`

    );

  const cleanOutput =

    outputPath.replace(
      /\\/g,
      "/"
    );

  const sql = `

COPY (

  SELECT *

  FROM read_parquet([

    ${cleanedFiles.join(",")}

  ])

)

TO '${cleanOutput}'

(FORMAT PARQUET);

`;

  return new Promise(

    (resolve, reject) => {

      db.run(

        sql,

        err => {

          if (err) {

            reject(err);

          } else {

            resolve();

          }

        }

      );

    }

  );

}

export default mergeParquetFiles;