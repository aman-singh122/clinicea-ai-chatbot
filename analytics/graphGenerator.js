import { ChartJSNodeCanvas }
from "chartjs-node-canvas";

import fs from "fs";

import path from "path";


// =========================
// CHART SIZE
// =========================

const width = 1000;

const height = 700;


// =========================
// CHART INSTANCE
// =========================

const chartCanvas =
    new ChartJSNodeCanvas({

        width,

        height,

        backgroundColour:
            "#111827"
    });


// =========================
// PREPARE GRAPH DATA
// =========================

function prepareGraphData(
    data,
    column
) {

    const counts = {};

    data.forEach(row => {

        const value =
            row[column] || "Unknown";

        counts[value] =
            (counts[value] || 0) + 1;
    });

    return {

        labels:
            Object.keys(counts),

        values:
            Object.values(counts)
    };
}


// =========================
// SAVE GRAPH
// =========================

function saveGraph(
    fileName,
    image
) {

    const outputPath =
        path.join(

            process.cwd(),

            `backend/graphs/${fileName}`
        );

    fs.writeFileSync(
        outputPath,
        image
    );
}


// =========================
// PIE CHART
// =========================

async function generatePieChart(
    data,
    column = "Status"
) {

    const graphData =
        prepareGraphData(
            data,
            column
        );

    const configuration = {

        type: "pie",

        data: {

            labels:
                graphData.labels,

            datasets: [
                {

                    label:
                        `${column} Distribution`,

                    data:
                        graphData.values,

                    backgroundColor: [

                        "#36A2EB",

                        "#FF6384",

                        "#FFCE56",

                        "#4BC0C0",

                        "#9966FF",

                        "#FF9F40",

                        "#8BC34A",

                        "#E91E63"
                    ]
                }
            ]
        },

        options: {

            plugins: {

                legend: {

                    labels: {

                        color: "white"
                    }
                },

                title: {

                    display: true,

                    text:
                        `${column} Distribution`,

                    color: "white",

                    font: {

                        size: 22
                    }
                }
            }
        }
    };

    const image =
        await chartCanvas
            .renderToBuffer(configuration);

    saveGraph(
        "pieChart.png",
        image
    );

    return "/graphs/pieChart.png";
}


// =========================
// BAR CHART
// =========================

async function generateBarChart(
    data,
    column = "Status"
) {

    const graphData =
        prepareGraphData(
            data,
            column
        );

    const configuration = {

        type: "bar",

        data: {

            labels:
                graphData.labels,

            datasets: [
                {

                    label:
                        `${column} Comparison`,

                    data:
                        graphData.values,

                    backgroundColor:
                        "#36A2EB"
                }
            ]
        },

        options: {

            scales: {

                x: {

                    ticks: {

                        color: "white"
                    }
                },

                y: {

                    ticks: {

                        color: "white"
                    }
                }
            },

            plugins: {

                legend: {

                    labels: {

                        color: "white"
                    }
                },

                title: {

                    display: true,

                    text:
                        `${column} Analysis`,

                    color: "white",

                    font: {

                        size: 22
                    }
                }
            }
        }
    };

    const image =
        await chartCanvas
            .renderToBuffer(configuration);

    saveGraph(
        "barChart.png",
        image
    );

    return "/graphs/barChart.png";
}


// =========================
// LINE CHART
// =========================

async function generateLineChart(
    data,
    column = "Status"
) {

    const graphData =
        prepareGraphData(
            data,
            column
        );

    const configuration = {

        type: "line",

        data: {

            labels:
                graphData.labels,

            datasets: [
                {

                    label:
                        `${column} Trend`,

                    data:
                        graphData.values,

                    borderColor:
                        "#36A2EB",

                    backgroundColor:
                        "#36A2EB",

                    fill: false,

                    tension: 0.3
                }
            ]
        },

        options: {

            scales: {

                x: {

                    ticks: {

                        color: "white"
                    }
                },

                y: {

                    ticks: {

                        color: "white"
                    }
                }
            },

            plugins: {

                legend: {

                    labels: {

                        color: "white"
                    }
                },

                title: {

                    display: true,

                    text:
                        `${column} Trend Analysis`,

                    color: "white",

                    font: {

                        size: 22
                    }
                }
            }
        }
    };

    const image =
        await chartCanvas
            .renderToBuffer(configuration);

    saveGraph(
        "lineChart.png",
        image
    );

    return "/graphs/lineChart.png";
}


export {

    generatePieChart,

    generateBarChart,

    generateLineChart
};