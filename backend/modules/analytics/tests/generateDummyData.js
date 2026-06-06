import duckdb from "duckdb";

const db = new duckdb.Database(":memory:");

db.run(`

COPY (

SELECT

row_number() over() as AppointmentID,

'Patient_' || CAST(
  CAST(random()*10000 AS INTEGER)
  AS VARCHAR
) as PatientName,

CASE
  WHEN random() < 0.25 THEN 'Dr Sharma'
  WHEN random() < 0.50 THEN 'Dr Singh'
  WHEN random() < 0.75 THEN 'Dr Khan'
  ELSE 'Dr Patel'
END as DoctorName,

CASE
  WHEN random() < 0.7 THEN 'Completed'
  WHEN random() < 0.9 THEN 'Scheduled'
  ELSE 'Cancelled'
END as Status,

ROUND(random()*5000,2) as BillAmount,

CURRENT_DATE -
CAST(random()*365 AS INTEGER)
as AppointmentDate

FROM range(100000000)

)

TO 'healthcare_master.parquet'
(FORMAT PARQUET);

`, (err) => {

  if (err) {
    console.log(err);
    return;
  }

  console.log("HEALTHCARE PARQUET CREATED");
});