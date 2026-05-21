function validateSQL(sql) {

  // =========================
  // BASIC CLEANING
  // =========================

  let cleanedSQL =

    sql
      .replace(/--.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();

  // =========================
  // EMPTY CHECK
  // =========================

  if (!cleanedSQL) {

    throw new Error(
      "SQL query is empty."
    );

  }

  // =========================
  // BLOCK MULTIPLE STATEMENTS
  // =========================

  const semicolonCount =

    (cleanedSQL.match(/;/g) || [])
      .length;

  if (semicolonCount > 1) {

    throw new Error(
      "Multiple SQL statements are not allowed."
    );

  }

  // =========================
  // REMOVE FINAL ;
  // =========================

  cleanedSQL =
    cleanedSQL.replace(/;$/, "");

  // =========================
  // NORMALIZE
  // =========================

  const normalizedSQL =

    cleanedSQL.toUpperCase();

  // =========================
  // ONLY SELECT ALLOWED
  // =========================

  if (

    !normalizedSQL.startsWith(
      "SELECT"
    )

  ) {

    throw new Error(

      "Only SELECT queries are allowed."

    );

  }

  // =========================
  // BLOCK DANGEROUS KEYWORDS
  // =========================

  const blockedKeywords = [

    "DROP",
    "DELETE",
    "UPDATE",
    "INSERT",
    "ALTER",
    "TRUNCATE",
    "CREATE",
    "REPLACE",
    "MERGE",
    "GRANT",
    "REVOKE"

  ];

  for (const keyword of blockedKeywords) {

    const regex =
      new RegExp(
        `\\b${keyword}\\b`,
        "i"
      );

    if (regex.test(cleanedSQL)) {

      throw new Error(

        `Blocked SQL keyword: ${keyword}`

      );

    }

  }

  // =========================
  // AUTO LIMIT PROTECTION
  // =========================

  const hasLimit =

    /\bLIMIT\b/i.test(cleanedSQL);

  if (!hasLimit) {

    cleanedSQL += "\nLIMIT 100";

  }

  // =========================
  // FINAL SAFE SQL
  // =========================

  return cleanedSQL;

}

export default validateSQL;