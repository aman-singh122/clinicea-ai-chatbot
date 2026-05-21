import mergeParquetFiles
from "../parquet/mergeParquetFiles.js";

await mergeParquetFiles({

inputFiles: [

  "E:/Desktop_E/clinicea/Z-chatbot/data/user1/parquet/appointments.parquet",

  "E:/Desktop_E/clinicea/Z-chatbot/data/user1/parquet/appointments.parquet",

  "E:/Desktop_E/clinicea/Z-chatbot/data/user1/parquet/appointments.parquet"

],

  outputFile:

    "E:/Desktop_E/clinicea/Z-chatbot/data/user1/parquet/merged.parquet"

});