import autoMergeParquetFolder
from "../parquet/autoMergeParquetFolder.js";

await autoMergeParquetFolder({

  folderPath:

    "E:/Desktop_E/clinicea/Z-chatbot/data/user1/parquet/appointments",

  outputFile:

    "E:/Desktop_E/clinicea/Z-chatbot/data/user1/parquet/appointments_month.parquet"

});