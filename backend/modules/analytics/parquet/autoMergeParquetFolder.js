import fs from "fs";
import path from "path";

import mergeParquetFiles
from "./mergeParquetFiles.js";

// =========================
// AUTO MERGE PARQUET FOLDER
// =========================

async function autoMergeParquetFolder({

  folderPath,
  outputFile

}) {

  // =========================
  // CHECK FOLDER
  // =========================

  if (

    !fs.existsSync(folderPath)

  ) {

    throw new Error(
      "Folder does not exist."
    );

  }

  // =========================
  // GET ALL PARQUET FILES
  // =========================

  const parquetFiles =

    fs

      .readdirSync(folderPath)

      .filter(

        file =>

          file.endsWith(".parquet")

      )

      .map(

        file =>

          path.join(
            folderPath,
            file
          )

      );

  // =========================
  // EMPTY CHECK
  // =========================

  if (

    parquetFiles.length === 0

  ) {

    throw new Error(
      "No parquet files found."
    );

  }

  console.log(
    "\nPARQUET FILES FOUND:\n",
    parquetFiles
  );

  // =========================
  // MERGE
  // =========================

  await mergeParquetFiles({

    inputFiles:
      parquetFiles,

    outputFile

  });

}

export default autoMergeParquetFolder;