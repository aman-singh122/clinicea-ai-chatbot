import fs from "fs";

import path from "path";

// =========================
// GET ALL DATASETS
// =========================

function getAllDatasets(user) {

  const parquetDir =

    path.join(
      "data",
      user,
      "parquet"
    );

  // =========================
  // CHECK
  // =========================

  if (
    !fs.existsSync(parquetDir)
  ) {

    return [];
  }

  // =========================
  // GET FILES
  // =========================

  const files =

    fs.readdirSync(parquetDir);

  // =========================
  // ONLY PARQUET
  // =========================

  const parquetFiles =

    files.filter(

      file =>

        file.endsWith(".parquet")

    );

  // =========================
  // DATASETS
  // =========================

  return parquetFiles.map(
    file => ({

      dataset:

        path.parse(file).name,

      file,

      fullPath:

        path.join(
          parquetDir,
          file
        )

    })
  );

}

export default getAllDatasets;