import duckdb from "duckdb";

const db = new duckdb.Database(":memory:");

export default db;