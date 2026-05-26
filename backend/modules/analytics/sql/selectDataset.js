import ai from "../../../../config/gemini.js";


import datasetMetadata
from "../semantic/datasetMetadata.js";

import businessRules
from "../semantic/businessRules.js";


// =========================
// SELECT BEST DATASET
// =========================

async function selectDataset({

  query,
  datasets,
  schemaMap

}) {

  // =========================
  // DATASET INFO
  // =========================

const datasetInfo =

  datasets.map(dataset => ({

    dataset:
      dataset.dataset,

    purpose:
      datasetMetadata[
        dataset.dataset
      ]?.purpose || "",

    domain:
      datasetMetadata[
        dataset.dataset
      ]?.domain || "",

    businessRules:
      businessRules[
        dataset.dataset
      ] || {},

    columns:

      schemaMap[
        dataset.dataset
      ]?.map(
        col => col.name
      ) || []

}));

  // =========================
  // PROMPT
  // =========================

  const prompt = `

You are a dataset selection AI.

Your job:
choose the BEST dataset
for the user's analytics query.

================================================
AVAILABLE DATASETS
================================================

${JSON.stringify(
  datasetInfo,
  null,
  2
)}

================================================
USER QUERY
================================================

${query}

================================================
RULES
================================================

Return ONLY the dataset name.

No explanation.
No markdown.
No JSON.
No extra text.

`;

  // =========================
  // AI RESPONSE
  // =========================

let response;

let retries = 3;

while (retries > 0) {

  try {

    response =
      await ai.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt,

      });

    break;

  } catch (error) {

    retries--;

    console.log(
      "\nGEMINI RETRY..."
    );

    if (retries === 0) {

      throw error;

    }

    await new Promise(
      resolve =>
        setTimeout(resolve, 2000)
    );

  }

}

  return response.text
    .trim()
    .replace(/[`"'*]/g, "");

}

export default selectDataset;