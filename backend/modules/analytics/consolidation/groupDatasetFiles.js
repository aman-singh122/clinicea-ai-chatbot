import path from "path";

import extractPartitionInfo
from "./extractPartitionInfo.js";

function groupDatasetFiles(files) {

  const groups = {};

  for (const file of files) {

    const filename =

      path.basename(file);

    const info =

      extractPartitionInfo(
        filename
      );

    // =========================
    // UNIQUE PARTITION KEY
    // =========================

    const key =

      `${info.dataset}_${info.year}_${info.month}`;

    if (!groups[key]) {

      groups[key] = [];

    }

    groups[key].push(file);

  }

  return groups;
}

export default groupDatasetFiles;