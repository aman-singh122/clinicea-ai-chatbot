import path from "path";
import { fileURLToPath } from "url";

import loadExcel from "../analytics/loadExcel.js";

import processAnalyticsQuery
    from "../analytics/queryProcessor.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


const filePath = path.join(
    __dirname,
    "../data/user1/Appointments Report-202605071242.csv"
);


const data = loadExcel(filePath);


// TEST QUERY
const query =
    "Show trend";


const result =
    await processAnalyticsQuery(query, data);


console.log(result);