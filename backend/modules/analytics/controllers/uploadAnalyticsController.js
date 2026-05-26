import fs from "fs";

import path from "path";

import csvToParquet from "../parquet/csvToParquet.js";

import mergeParquetFiles from "../consolidation/mergeParquetFiles.js";

import groupDatasetFiles from "../consolidation/groupDatasetFiles.js";

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

      setTimeout(() => {
        try {
          if (fs.existsSync(uploadedPath)) {
            fs.unlinkSync(uploadedPath);

            console.log("\nTEMP CSV DELETED");
          }
        } catch (deleteError) {
          console.log("\nTEMP CSV DELETE FAILED");

          console.log(deleteError);
        }
      }, 5000);

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
      console.log("\nPARQUET UPLOADED:\n", uploadedPath);

      return res.json({
        success: true,

        type: "parquet",

        message: "Parquet uploaded successfully",

        parquet: uploadedPath,
      });
    }

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
