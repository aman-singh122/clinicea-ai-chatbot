import fs from "fs";

import path from "path";

import classifyColumns from "./columnClassifier.js";

// =========================
// BUILD DATASET METADATA
// =========================

function buildDatasetMetadata({
  user,
  dataset,
  schema
}) {

  if (!user) {

    throw new Error(
      "User is required for metadata generation"
    );

  }

  if (!dataset) {

    throw new Error(
      "Dataset is required for metadata generation"
    );

  }

  if (
    !schema ||
    !Array.isArray(schema)
  ) {

    throw new Error(
      "Schema array is required for metadata generation"
    );

  }

  const classified =
    classifyColumns(schema);

  const metadata = {

    dataset,

    metrics:
      classified.metrics,

    dimensions:
      classified.dimensions,

    dates:
      classified.dates,

    createdAt:
      new Date().toISOString()

  };

  const metadataDir =
    path.join(
      "data",
      user,
      "metadata"
    );

  if (!fs.existsSync(metadataDir)) {

    fs.mkdirSync(
      metadataDir,
      { recursive: true }
    );

  }

  const metadataPath =
    path.join(
      metadataDir,
      `${dataset}.metadata.json`
    );

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(
      metadata,
      null,
      2
    )
  );

  console.log(
    "\nDYNAMIC DATASET METADATA GENERATED"
  );

  console.log(
    "DATASET:",
    dataset
  );

  console.log(
    "METRICS:",
    metadata.metrics
  );

  console.log(
    "DIMENSIONS:",
    metadata.dimensions
  );

  console.log(
    "DATES:",
    metadata.dates
  );

  console.log(
    "METADATA PATH:",
    metadataPath
  );

  return metadata;

}

export default buildDatasetMetadata;
