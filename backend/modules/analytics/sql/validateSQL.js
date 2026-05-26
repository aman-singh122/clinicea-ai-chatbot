function validateSQL(sql) {

  // =========================
  // BASIC CLEANING
  // =========================

  let cleanedSQL =

    sql

      .replace(/--.*$/gm, "")

      .replace(
        /\/\*[\s\S]*?\*\//g,
        ""
      )

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

    (
      cleanedSQL.match(/;/g)
      || []
    ).length;

  if (semicolonCount > 1) {

    throw new Error(

      "Multiple SQL statements are not allowed."

    );

  }

  // =========================
  // REMOVE FINAL ;
  // =========================

  cleanedSQL =

    cleanedSQL.replace(
      /;$/,
      ""
    );

  // =========================
  // NORMALIZE
  // =========================

  const normalizedSQL =

    cleanedSQL
      .trim()
      .toUpperCase();

  // =========================
  // ALLOW:
  // SELECT
  // WITH (CTE)
  // =========================

  const allowedStarts = [

    "SELECT",

    "WITH"

  ];

  const validStart =

    allowedStarts.some(

      keyword =>

        normalizedSQL.startsWith(
          keyword
        )

    );

  if (!validStart) {

    throw new Error(

      "Only SELECT/CTE analytics queries are allowed."

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
    "REVOKE",
    "ATTACH",
    "DETACH",
    "COPY",
    "EXPORT",
    "IMPORT"

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
  // BLOCK SYSTEM TABLE ACCESS
  // =========================

  const blockedSystemPatterns = [

    /information_schema/i,

    /pg_/i,

    /sqlite_master/i

  ];

  for (const pattern of blockedSystemPatterns) {

    if (pattern.test(cleanedSQL)) {

      throw new Error(

        "System table access is not allowed."

      );

    }

  }

  // =========================
  // AUTO LIMIT PROTECTION
  // =========================

  const hasLimit =

    /\bLIMIT\b/i.test(
      cleanedSQL
    );

  // don't inject LIMIT
  // if query already contains
  // window/ranking logic

  const complexQuery =

    /\bOVER\b/i.test(
      cleanedSQL
    );

  if (

    !hasLimit

    &&

    !complexQuery

  ) {

    cleanedSQL +=
      "\nLIMIT 100";

  }

  // =========================
  // FINAL SAFE SQL
  // =========================

  return cleanedSQL;

}

export default validateSQL;