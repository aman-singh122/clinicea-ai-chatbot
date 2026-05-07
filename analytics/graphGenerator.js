import { ChartJSNodeCanvas } from "chartjs-node-canvas";

import fs from "fs";

import path from "path";

import { fileURLToPath } from "url";

// __dirname setup
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Chart size
const width = 800;

const height = 600;

// Chart instance
const chartCanvas = new ChartJSNodeCanvas({
  width,
  height,
});

// COMMON STATUS COUNT FUNCTION
function getStatusCounts(data) {
  const statusCounts = {};

  data.forEach((row) => {
    const status = row.Status || "Unknown";

    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return statusCounts;
}

// PIE CHART
async function generatePieChart(data) {
  const statusCounts = getStatusCounts(data);

  const configuration = {
    type: "pie",

    data: {
      labels: Object.keys(statusCounts),

      datasets: [
        {
          label: "Appointments",

          data: Object.values(statusCounts),

          backgroundColor: [
            "#36A2EB",
            "#FF6384",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    },
  };

  const image = await chartCanvas.renderToBuffer(configuration);

  const outputPath = path.join(process.cwd(), "backend/graphs/pieChart.png");

  fs.writeFileSync(outputPath, image);

  return "/graphs/pieChart.png";
}

// BAR CHART
async function generateBarChart(data) {
  const statusCounts = getStatusCounts(data);

  const configuration = {
    type: "bar",

    data: {
      labels: Object.keys(statusCounts),

      datasets: [
        {
          label: "Appointments",

          data: Object.values(statusCounts),

          backgroundColor: "#36A2EB",
        },
      ],
    },
  };

  const image = await chartCanvas.renderToBuffer(configuration);

  const outputPath = path.join(process.cwd(), "backend/graphs/barChart.png");

  fs.writeFileSync(outputPath, image);

  return "/graphs/barChart.png";
}

// LINE CHART
async function generateLineChart(data) {
  const statusCounts = getStatusCounts(data);

  const configuration = {
    type: "line",

    data: {
      labels: Object.keys(statusCounts),

      datasets: [
        {
          label: "Appointments",

          data: Object.values(statusCounts),

          borderColor: "#36A2EB",

          backgroundColor: "#36A2EB",

          fill: false,
        },
      ],
    },
  };

  const image = await chartCanvas.renderToBuffer(configuration);

  const outputPath = path.join(process.cwd(), "backend/graphs/lineChart.png");

  fs.writeFileSync(outputPath, image);

  return "/graphs/lineChart.png";
}

export { generatePieChart, generateBarChart, generateLineChart };
