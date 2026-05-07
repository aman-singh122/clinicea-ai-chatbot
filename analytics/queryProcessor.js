import {
    getTotalAppointments,
    getCancelledAppointments,
    getCompletedAppointments,
    getWaitingAppointments,
    getTotalRevenue,
    getAppointmentsByDate
} from "./analyticsEngine.js";

import {
    generatePieChart,
    generateBarChart,
    generateLineChart
} from "./graphGenerator.js";


async function processAnalyticsQuery(query, data) {

    query = query.toLowerCase();


    // PIE CHART
    if (
        query.includes("distribution")
    ) {

        const graphPath =
            await generatePieChart(data);

        return {

            type: "graph",

            graphUrl: graphPath,

            message:
                "This pie chart shows appointment distribution."
        };
    }


    // BAR CHART
    if (
        query.includes("bar chart") ||
        query.includes("top statuses")
    ) {

        const graphPath =
            await generateBarChart(data);

        return {

            type: "graph",

            graphUrl: graphPath,

            message:
                "This bar chart compares appointment statuses."
        };
    }


    // LINE CHART
    if (
        query.includes("trend") ||
        query.includes("line chart")
    ) {

        const graphPath =
            await generateLineChart(data);

        return {

            type: "graph",

            graphUrl: graphPath,

            message:
                "This line chart shows appointment trends."
        };
    }


    // TOTAL APPOINTMENTS
    if (
        query.includes("total appointments") ||
        query.includes("how many appointments")
    ) {

        return {

            type: "text",

            message:
                `Total appointments are ${getTotalAppointments(data)}`
        };
    }


    // CANCELLED
    if (
        query.includes("cancelled")
    ) {

        return {

            type: "text",

            message:
                `Cancelled appointments are ${getCancelledAppointments(data)}`
        };
    }


    // COMPLETED
    if (
        query.includes("completed") ||
        query.includes("check out")
    ) {

        return {

            type: "text",

            message:
                `Completed appointments are ${getCompletedAppointments(data)}`
        };
    }


    // WAITING
    if (
        query.includes("waiting")
    ) {

        return {

            type: "text",

            message:
                `Waiting appointments are ${getWaitingAppointments(data)}`
        };
    }


    // REVENUE
   // REVENUE
if (
    query.includes("revenue") ||
    query.includes("income")
) {

    return {

        type: "text",

        message:
            `Total revenue is ₹${getTotalRevenue(data)}`
    };
}


// DATE APPOINTMENTS
const dateMatch =
    query.match(/\d{2}-\d{2}-\d{4}/);

if (
    query.includes("appointment") &&
    dateMatch
) {

    const date =
        dateMatch[0];

    const appointments =
        getAppointmentsByDate(data, date);

    return {

        type: "text",

        message:
            `Total appointments on ${date} were ${appointments.length}`
    };
}
}


export default processAnalyticsQuery;