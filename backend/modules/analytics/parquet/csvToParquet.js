import db from "../duckdb/duckdbConnection.js";

// =========================
// CSV → PARQUET
// USING DUCKDB
// =========================

async function csvToParquet(

csvPath,
parquetPath

) {

// =========================
// CLEAN PATHS
// =========================

const cleanCSVPath =


csvPath.replace(
  /\\/g,
  "/"
);


const cleanParquetPath =


parquetPath.replace(
  /\\/g,
  "/"
);


// =========================
// FIXED TABLE NAMES
// =========================

let tableName = "";

// =========================
// APPOINTMENTS
// =========================

if (


cleanParquetPath
  .toLowerCase()
  .includes("appointment")


) {


tableName =
  "appointments";


}

// =========================
// BILL ITEMS
// =========================

else if (


cleanParquetPath
  .toLowerCase()
  .includes("billitem")


) {


tableName =
  "billitems";


}

// =========================
// BILLS
// =========================

else if (


cleanParquetPath
  .toLowerCase()
  .includes("bill")


) {


tableName =
  "bills";


}

// =========================
// SAFETY
// =========================

else {


throw new Error(
  "Unknown dataset type"
);


}

// =========================
// SQL
// =========================

const sql = `

-- =========================
-- CSV → PARQUET
-- =========================

COPY (

SELECT *

FROM read_csv_auto(


'${cleanCSVPath}',

sample_size = -1,

ignore_errors = true


)

)

TO '${cleanParquetPath}'

(FORMAT PARQUET);

-- =========================
-- CREATE MANAGED TABLE
-- =========================

CREATE OR REPLACE TABLE ${tableName} AS

SELECT *

FROM read_parquet(

'${cleanParquetPath}'

);

`;

// =========================
// DEBUG
// =========================

console.log(
"\nCSV TO PARQUET SQL:\n",
sql
);

console.log(
"\nDUCKDB TABLE:\n",
tableName
);

// =========================
// EXECUTE
// =========================

return new Promise(


(
  resolve,
  reject
) => {

  db.run(

    sql,

    (err) => {

      if (err) {

        console.log(
          "\nCSV → PARQUET FAILED:\n"
        );

        console.log(err);

        reject(err);

      }

      else {

        console.log(
          "\nPARQUET GENERATED SUCCESSFULLY"
        );

        console.log(
          "\nDUCKDB TABLE CREATED:",
          tableName
        );

        resolve();

      }

    }

  );

}


);

}

export default csvToParquet;
