import fs from "fs";

import path from "path";


function findRelevantFiles(user, query) {

    const userFolder =
        path.join("data", user);

    const files =
        fs.readdirSync(userFolder);

    query =
        query.toLowerCase();

    const matchedFiles = [];


    // APPOINTMENTS
    if (

        query.includes("appointment") ||

        query.includes("doctor") ||

        query.includes("schedule")

    ) {

        const appointmentFile =

            files.find(file =>

                file.toLowerCase()
                    .includes("appointment")
            );

        if (appointmentFile) {

            matchedFiles.push(
                appointmentFile
            );
        }
    }


    // REVENUE / BILLS
    if (

        query.includes("revenue") ||

        query.includes("income") ||

        query.includes("bill")

    ) {

        const billFile =

            files.find(file =>

                file.toLowerCase()
                    .includes("bills report")
            );

        if (billFile) {

            matchedFiles.push(
                billFile
            );
        }
    }


    // BILL ITEMS
    if (

        query.includes("service") ||

        query.includes("item") ||

        query.includes("treatment")

    ) {

        const itemFile =

            files.find(file =>

                file.toLowerCase()
                    .includes("bill items")
            );

        if (itemFile) {

            matchedFiles.push(
                itemFile
            );
        }
    }


    // IF NOTHING MATCHES
    if (matchedFiles.length === 0) {

        return files;
    }


    return matchedFiles;
}


export default findRelevantFiles;