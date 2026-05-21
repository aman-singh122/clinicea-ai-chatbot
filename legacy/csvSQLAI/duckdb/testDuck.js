import executeDuckQuery from "./executeDuckQuery.js";

async function test() {

  const result = await executeDuckQuery(`

    SELECT
      "ApptStartDtm"

    FROM read_parquet(
      'E:/Desktop_E/clinicea/Z-chatbot/data/user1/parquet/appointments.parquet'
    )

    LIMIT 10

  `);

  console.log(result);

}

test();