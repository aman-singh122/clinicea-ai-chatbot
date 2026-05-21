import fs from "fs";

import path from "path";

// =========================
// GET LATEST DATASET FILES
// =========================

function getLatestDatasetFiles(user) {

  const parquetDir =

    path.join(
      "data",
      user,
      "parquet"
    );

  // =========================
  // CHECK FOLDER
  // =========================

  if (
    !fs.existsSync(parquetDir)
  ) {

    return {};
  }

  // =========================
  // ALL FILES
  // =========================

  const files =

    fs.readdirSync(parquetDir);

  // =========================
  // FIND DATASETS
  // =========================

  const datasets = {

    appointments: null,

    bills: null,

    billitems: null

  };

  for (const file of files) {

    const lower =
      file.toLowerCase();

    if (

      lower.includes(
        "appointment"
      )

    ) {

      datasets.appointments =
        file;

    }

    if (
      lower.includes("bill") &&
      !lower.includes("item")
    ) {

      datasets.bills =
        file;

    }

    if (

      lower.includes(
        "item"
      )

    ) {

      datasets.billitems =
        file;

    }

  }

  return datasets;

}

export default getLatestDatasetFiles;