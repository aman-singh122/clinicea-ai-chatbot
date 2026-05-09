import fs from "fs";
import csv from "csv-parser";

function cleanHeader(header) {
  return header.replace(/^\uFEFF/, "").trim();
}

// =========================
// NORMALIZE DATE
// 08-04-2026
// TO
// 2026-04-08
// =========================

function normalizeDate(date) {
  if (!date) {
    return "";
  }

  const value = String(date).trim();

  // MATCH DD-MM-YYYY

  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  // IF NOT DATE
  // RETURN ORIGINAL VALUE

  if (!match) {
    return value;
  }

  const [, day, month, year] = match;

  // SQLITE FORMAT

  return `${year}-${month}-${day}`;
}

// =========================
// CSV LOADER
// =========================

async function csvLoader(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)

      .pipe(
        csv({
          mapHeaders: ({ header }) => cleanHeader(header),
        }),
      )

      .on("data", (row) => {
        // =========================
        // REMOVE DUPLICATE HEADER ROW
        // =========================

        if (row.ApptStartDtm === "ApptStartDtm") {
          return;
        }

        const cleanedRow = {};

        // =========================
        // LOOP ALL COLUMNS
        // =========================

        for (const key in row) {
          let value = row[key];

          // NULL FIX

          if (value === undefined || value === null) {
            value = "";
          }

          value = String(value).trim();

          // =========================
          // DATE NORMALIZATION
          // =========================

          if (
            key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("dtm")
          ) {
            value = normalizeDate(value);
          }

          cleanedRow[key] = value;
        }

        results.push(cleanedRow);
      })

      .on("end", () => {
        console.log("\nCSV LOADED:", results.length, "rows");

        resolve(results);
      })

      .on("error", (error) => {
        reject(error);
      });
  });
}

export default csvLoader;
