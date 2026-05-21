async function executeSql(db, sql) {

  try {

    const cleanedSql =
      sql
        .replace(/\\n/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    console.log(
      "\nFINAL SQL:\n",
      cleanedSql
    );

    const rows =
      await db.all(cleanedSql);

    console.log(
      "\nTOTAL RESULTS:",
      rows.length
    );

    return rows;

  } catch (error) {

    console.log(
      "\nSQL EXECUTION ERROR:\n",
      error
    );

    return [];
  }
}

export default executeSql;