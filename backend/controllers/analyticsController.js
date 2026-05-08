import path from "path";

import { fileURLToPath }
from "url";

import loadExcel
from "../../analytics/loadExcel.js";

import processAnalyticsQuery
from "../../analytics/queryProcessor.js";

import findRelevantFile
from "../utils/findRelevantFile.js";


// __dirname setup
const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


async function analyticsController(req, res) {

    try {

        const { query, user } = req.body;


        // =========================
        // FIND RELEVANT FILES
        // =========================

        const selectedFiles =
            findRelevantFile(user, query);


        console.log(
            "Selected File:",
            selectedFiles
        );


        // =========================
        // LOAD ALL FILE DATA
        // =========================

        let allData = [];


        for (const fileName of selectedFiles) {

            const filePath =
                path.join(
                    __dirname,
                    `../../data/${user}/${fileName}`
                );


            console.log(
                "File Path:",
                filePath
            );


            // LOAD FILE
            const fileData =
                loadExcel(filePath);


            // MERGE DATA
            allData = [

                ...allData,

                ...fileData
            ];
        }


        console.log(
            "Total Records:",
            allData.length
        );


        // =========================
        // PROCESS QUERY
        // =========================

        const result =
            await processAnalyticsQuery(
                query,
                allData
            );


        // =========================
        // SEND RESPONSE
        // =========================

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