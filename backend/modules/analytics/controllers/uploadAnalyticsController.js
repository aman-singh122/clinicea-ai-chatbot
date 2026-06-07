import fs from "fs";

import path from "path";

import csvToParquet from "../parquet/csvToParquet.js";

import mergeParquetFiles from "../consolidation/mergeParquetFiles.js";

import groupDatasetFiles from "../consolidation/groupDatasetFiles.js";

import executeDuckQuery from "../duckdb/executeDuckQuery.js";

import buildDatasetMetadata from "../semantic/buildDatasetMetadata.js";

// =========================

async function generateMetadataForParquet({
  user,
  dataset,
  parquetPath
}) {

  try {

    const cleanPath =
      parquetPath.replace(
        /\\/g,
        "/"
      );

    const schemaSQL = `

DESCRIBE
SELECT *
FROM read_parquet(
'${cleanPath}'
)

`;

    const schemaResult =
      await executeDuckQuery(schemaSQL);

    const schema =
      schemaResult.map(col => ({

        name:
          col.column_name,

        type:
          col.column_type

      }));

    return buildDatasetMetadata({

      user,

      dataset,

      schema

    });

  } catch (metadataError) {

    console.log(
      "\nDATASET METADATA GENERATION FAILED:\n"
    );

    console.log(metadataError);

    return null;

  }

}

// =========================

async function uploadAnalyticsController(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,

        error: "No file uploaded",
      });
    }

    // =========================
    // FILE INFO
    // =========================

    const ext = path.extname(file.originalname).toLowerCase();

    const uploadedPath = file.path;

    const user = req.body.user || "user1";

    console.log("ORIGINAL:", file.originalname);
    console.log("EXT:", ext);
    console.log("UPLOAD PATH:", uploadedPath);
    // =========================
    // CSV DETECTED
    // =========================

    if (ext === ".csv") {
      console.log("\nCSV DETECTED");

      console.log("\nCONVERTING TO PARQUET...");

      // =========================
      // FINAL PARQUET DIRECTORY
      // =========================

      const parquetDir = path.join("data", user, "parquet");

      // =========================
      // CREATE DIRECTORY
      // =========================

      if (!fs.existsSync(parquetDir)) {
        fs.mkdirSync(parquetDir, {
          recursive: true,
        });
      }

      // =========================
      // PARQUET FILE NAME
      // =========================

      const parquetFileName = path
        .basename(uploadedPath)
        .replace(/\.csv$/i, ".parquet");

      // =========================
      // FINAL PARQUET PATH
      // =========================

      const parquetPath = path.join(parquetDir, parquetFileName);

      console.log("\nPARQUET PATH:\n", parquetPath);

      // =========================
      // CSV → PARQUET
      // =========================

      await csvToParquet(
        uploadedPath,

        parquetPath,
      );

      // =========================
      // DYNAMIC METADATA
      // =========================

      await generateMetadataForParquet({

        user,

        dataset:
          path.parse(parquetFileName).name,

        parquetPath

      });

      // =========================
      // CONSOLIDATION
      // =========================

      const allParquetFiles = fs
        .readdirSync(parquetDir)

        .filter((file) => file.endsWith(".parquet"))

        .map((file) => path.join(parquetDir, file));

      // =========================
      // GROUP FILES
      // =========================

      const groupedDatasets = groupDatasetFiles(allParquetFiles);

      // =========================
      // MERGE SAME FAMILY
      // =========================

      for (const family in groupedDatasets) {
        const files = groupedDatasets[family];

        // only merge if multiple files

        if (files.length > 1) {
          const outputPath = path.join(
            parquetDir,

            `${family}_consolidated.parquet`,
          );

          await mergeParquetFiles(
            files,

            outputPath,
          );

          console.log(`\n${family} CONSOLIDATED`);
        }
      }
      // =========================
      // DELETE TEMP CSV
      // =========================

      setTimeout(
        () => {
          try {
            if (fs.existsSync(uploadedPath)) {
              fs.unlinkSync(uploadedPath);

              console.log("\nTEMP CSV DELETED");
            }
          } catch (deleteError) {
            console.log("\nTEMP CSV DELETE FAILED");

            console.log(deleteError);
          }
        },
        60 * 60 * 1000,
      );

      // =========================
      // SUCCESS
      // =========================

      console.log("\nPARQUET CREATED:\n", parquetPath);

      return res.json({
        success: true,

        type: "csv",

        message: "CSV converted to parquet successfully",

        parquet: parquetPath,
      });
    }

    // =========================
    // PARQUET DETECTED
    // =========================

    if (ext === ".parquet") {
      console.log("PARQUET BLOCK ENTERED");
      const parquetDir = path.join("data", user, "parquet");

      if (!fs.existsSync(parquetDir)) {
        fs.mkdirSync(parquetDir, {
          recursive: true,
        });
      }

      const finalPath = path.join(parquetDir, path.basename(uploadedPath));

      try {
        fs.renameSync(uploadedPath, finalPath);

        console.log("FILE MOVED");
      } catch (err) {
        console.log("MOVE FAILED");

        console.log(err);
      }

      console.log("FILE MOVED SUCCESSFULLY");

      console.log("EXISTS IN PARQUET:", fs.existsSync(finalPath));

      console.log("EXISTS IN TEMP:", fs.existsSync(uploadedPath));

      console.log("\nPARQUET MOVED TO:\n", finalPath);

      // =========================
      // DYNAMIC METADATA
      // =========================

      await generateMetadataForParquet({

        user,

        dataset:
          path.parse(finalPath).name,

        parquetPath:
          finalPath

      });

      return res.json({
        success: true,
        type: "parquet",
        message: "Parquet uploaded successfully",
        parquet: finalPath,
      });
    }

    console.log("PARQUET BLOCK ENTERED");
    // =========================
    // INVALID FILE
    // =========================

    try {
      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    } catch (cleanupError) {
      console.log("\nINVALID FILE CLEANUP FAILED");

      console.log(cleanupError);
    }

    return res.status(400).json({
      success: false,

      error: "Only CSV or parquet files are allowed",
    });
  } catch (error) {
    console.log("\nUPLOAD ANALYTICS ERROR:\n");

    console.log(error);

    return res.status(500).json({
      success: false,

      error: "Upload failed",
    });
  }
}

export default uploadAnalyticsController;
