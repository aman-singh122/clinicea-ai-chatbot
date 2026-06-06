import classifyColumns
from "../semantic/columnClassifier.js";

const schema = [

  {
    name: "BillAmount",
    type: "DOUBLE"
  },

  {
    name: "DoctorName",
    type: "VARCHAR"
  },

  {
    name: "AppointmentDate",
    type: "DATE"
  }

];

console.log(
  classifyColumns(schema)
);