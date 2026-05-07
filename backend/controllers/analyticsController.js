import path from "path";
import { fileURLToPath } from "url";

import loadExcel from "../../analytics/loadExcel.js";

import processAnalyticsQuery
from "../../analytics/queryProcessor.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


async function analyticsController(req, res) {

    try {

        const { query, user } = req.body;


        // User file path
        const filePath = path.join(
            __dirname,
            `../../data/${user}/Appointments Report-202605071242.csv`
        );


        // Load data
        const data = loadExcel(filePath);


        // Process query
        const result =
            await processAnalyticsQuery(query, data);


        // Send response
        res.json(result);

    } catch (error) {

        console.log(error);

        res.status(500).json({

            type: "text",

            message:
                "Analytics processing failed."
        });
    }
}


export default analyticsController;