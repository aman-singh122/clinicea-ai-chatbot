import fs from "fs";
import csv from "csv-parser";
import parquet from "parquetjs-lite";

async function csvToParquet(csvPath, parquetPath) {

  const rows = [];

  return new Promise((resolve, reject) => {

    fs.createReadStream(csvPath)

      .pipe(csv())

      .on("data", (data) => {

        rows.push(data);

      })

      .on("end", async () => {

        try {

          // =========================
          // AUTO SCHEMA
          // =========================

          const firstRow = rows[0];

          const schemaObject = {};

          for (const key in firstRow) {

            schemaObject[key] = {
              type: "UTF8",
              optional: true,
            };

          }

          const schema = new parquet.ParquetSchema(schemaObject);

          // =========================
          // WRITER
          // =========================

          const writer = await parquet.ParquetWriter.openFile(
            schema,
            parquetPath
          );

          // =========================
          // WRITE ROWS
          // =========================

          for (const row of rows) {

            await writer.appendRow(row);

          }

          await writer.close();

          console.log("Parquet file created");

          resolve();

        } catch (error) {

          reject(error);

        }

      });

  });

}

export default csvToParquet;