import csvToParquet from "./csvSQLAI/duckdb/csvToParquet.js";

async function test() {

  // =========================
  // APPOINTMENTS
  // =========================

  await csvToParquet(

    "data/user1/Appointments Report-202605071242.csv",

    "data/user1/parquet/appointments.parquet"

  );

  // =========================
  // BILLS
  // =========================

  await csvToParquet(

    "data/user1/Bills Report-202605071243.csv",

    "data/user1/parquet/bills.parquet"

  );

  // =========================
  // BILL ITEMS
  // =========================

  await csvToParquet(

    "data/user1/Bill Items Report-202605071243.csv",

    "data/user1/parquet/billitems.parquet"

  );

  console.log("All parquet files created");

}

test();