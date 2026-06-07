import fs from "fs";

import path from "path";

// =========================
// LOAD DATASET METADATA
// =========================

function loadDatasetMetadata(user) {

  const metadataDir =
    path.join(
      "data",
      user,
      "metadata"
    );

  if (!fs.existsSync(metadataDir)) {

    return {};

  }

  const files =
    fs
      .readdirSync(metadataDir)
      .filter(file =>
        file.endsWith(".metadata.json")
      );

  const metadataMap = {};

  for (const file of files) {

    const fullPath =
      path.join(
        metadataDir,
        file
      );

    try {

      const metadata =
        JSON.parse(
          fs.readFileSync(
            fullPath,
            "utf-8"
          )
        );

      if (metadata?.dataset) {

        metadataMap[
          metadata.dataset
        ] = metadata;

      }

    } catch (error) {

      console.log(
        "\nMETADATA LOAD FAILED:\n",
        fullPath
      );

      console.log(error.message);

    }

  }

  return metadataMap;

}

export default loadDatasetMetadata;
