import executeDuckQuery from "./csvSQLAI/duckdb/executeDuckQuery.js";

async function test() {

  try {

    const result = await executeDuckQuery(`

      SELECT
        "Patient City",
        COUNT(*) as total_appointments

      FROM
      'data/user1/parquet/appointments.parquet'

      GROUP BY "Patient City"

      ORDER BY total_appointments DESC

      LIMIT 10

    `);

    console.log(result);

  } catch (error) {

    console.log(error);

  }

}

test();