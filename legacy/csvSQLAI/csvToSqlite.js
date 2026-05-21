import sqlite3 from "sqlite3";

import { open }
from "sqlite";

import csvLoader
from "../csvAI/csvLoader.js";


// =========================
// DATE CONVERTER
// =========================

function convertDate(value) {

  if (!value) {
    return value;
  }

  // DD-MM-YYYY

  const regex =
    /^(\d{2})-(\d{2})-(\d{4})$/;

  const match =
    String(value).match(regex);

  if (!match) {
    return value;
  }

  const day =
    match[1];

  const month =
    match[2];

  const year =
    match[3];

  // SQLITE FORMAT

  return `${year}-${month}-${day}`;
}


// =========================
// CSV TO SQLITE
// =========================

async function csvToSqlite(filePath) {

  // LOAD CSV

  const data =
    await csvLoader(filePath);

  // EMPTY CHECK

  if (
    !data ||
    data.length === 0
  ) {

    throw new Error(
      "CSV file is empty."
    );
  }

  // OPEN DATABASE

  const db =
    await open({

      filename:
        "./clinic.db",

      driver:
        sqlite3.Database
    });

    
  // DROP OLD TABLE

  await db.exec(`
    DROP TABLE IF EXISTS records
  `);

  // =========================
  // CREATE TABLE
  // =========================

  const columns =
    Object.keys(data[0]);

  const columnSQL =
    columns
      .map(col =>
        `"${col}" TEXT`
      )
      .join(",");

  await db.exec(`
    CREATE TABLE records (
      ${columnSQL}
    )
  `);

  // =========================
  // INSERT DATA
  // =========================

  for (const row of data) {

    const cleanedValues =
      columns.map((col) => {

        let value =
          row[col];

        // NULL FIX

        if (
          value === undefined ||
          value === null
        ) {

          value = "";
        }

        // DATE FIX


        return String(value);
      });

    const placeholders =
      columns
        .map(() => "?")
        .join(",");

    await db.run(

      `
      INSERT INTO records
      VALUES (${placeholders})
      `,

      cleanedValues
    );
  }

  console.log(
    "\nSQLITE DATABASE CREATED"
  );

  console.log(
    "TOTAL ROWS:",
    data.length
  );

  console.log(
    "COLUMNS:",
    columns
  );

  return db;
}

export default csvToSqlite;