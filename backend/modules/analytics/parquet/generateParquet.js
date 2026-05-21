import db from "./duckdbConnection.js";

// =========================
// PATHS
// =========================

const basePath =
  "E:/Desktop_E/clinicea/Z-chatbot/data/user1";

// =========================
// ALL DATASETS
// =========================

const datasets = [

  {
    csv:
      `${basePath}/Appointments Report-202605071242.csv`,

    parquet:
      `${basePath}/parquet/appointments.parquet`,

    name:
      "Appointments"
  },

  {
    csv:
      `${basePath}/Bills Report-202605071243.csv`,

    parquet:
      `${basePath}/parquet/bills.parquet`,

    name:
      "Bills"
  },

  {
    csv:
      `${basePath}/Bill Items Report-202605071243.csv`,

    parquet:
      `${basePath}/parquet/billitems.parquet`,

    name:
      "BillItems"
  }

];

// =========================
// GENERATE PARQUET
// =========================

async function generateParquetFiles() {

  for (const dataset of datasets) {

    console.log(`\nGenerating ${dataset.name} parquet...`);

    const sql = `

      COPY (

        SELECT *

        FROM read_csv_auto(
          '${dataset.csv}'
        )

      )

      TO '${dataset.parquet}'

      (FORMAT PARQUET);

    `;

    await new Promise((resolve, reject) => {

      db.run(sql, (err) => {

        if (err) {

          console.log(
            `\n ${dataset.name} failed`
          );

          console.log(err);

          reject(err);

        } else {

          console.log(
            `\n ${dataset.name} parquet generated successfully`
          );

          resolve();

        }

      });

    });

  }

  console.log("\n ALL PARQUET FILES GENERATED");

}

generateParquetFiles();