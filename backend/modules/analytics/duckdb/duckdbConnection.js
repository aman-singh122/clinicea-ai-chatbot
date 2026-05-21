import duckdb from "duckdb";

// =========================
// DATABASE
// =========================

const database =

  new duckdb.Database(
    "data/clinicea.duckdb"
  );

// =========================
// CONNECTION
// =========================

const db =
  database.connect();

export default db;