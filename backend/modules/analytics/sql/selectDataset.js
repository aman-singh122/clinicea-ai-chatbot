
import createGeminiClient
from "../../../../config/gemini.js";

import getUserGemini
from "../../../utils/getUserGemini.js";

import datasetMetadata
from "../semantic/datasetMetadata.js";

import businessRules
from "../semantic/businessRules.js";

import datasetRouter
from "../utils/datasetRouter.js";

// =========================
// SELECT BEST DATASET
// =========================

async function selectDataset({

  query,
  datasets,
  schemaMap

}) {

  const apiKey =
  getUserGemini("user1");

if (!apiKey) {

  throw new Error(
    "No Gemini API Key Found"
  );

}

const ai =
  createGeminiClient(apiKey);

console.log(
  "\nSELECT DATASET AI READY"
);
  // =========================
  // TRY JS ROUTER FIRST
  // =========================

  const jsDataset =
    datasetRouter(query);

  console.log(
    "\nJS ROUTER RESULT:",
    jsDataset
  );

  // =========================
  // AI BYPASS
  // =========================

  if (

    jsDataset &&

    jsDataset !== "AI_FALLBACK"

  ) {

    console.log(
      "\nAI BYPASSED"
    );

    // =========================
    // MATCH REAL DATASET
    // =========================

    const matchedDataset =

      datasets.find(dataset =>

        dataset.dataset
          .toLowerCase()
          .includes(
            jsDataset.toLowerCase()
          )

      );

    // =========================
    // FOUND MATCH
    // =========================

    if (matchedDataset) {

      console.log(
        "\nMATCHED DATASET:",
        matchedDataset.dataset
      );

      return matchedDataset.dataset;

    }

    // =========================
    // SAFETY FALLBACK
    // =========================

    console.log(
      "\nNO MATCH FOUND → USING AI"
    );

  }

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
  // AI PROMPT
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

  // =========================
  // CLEAN AI RESPONSE
  // =========================

  const aiDataset =

    response.text
      .trim()
      .replace(/[`"'*]/g, "");

  console.log(
    "\nAI DATASET:",
    aiDataset
  );

  // =========================
  // MATCH REAL DATASET
  // =========================

  const matchedAiDataset =

    datasets.find(dataset =>

      dataset.dataset
        .toLowerCase()
        .includes(
          aiDataset.toLowerCase()
        )

    );

  // =========================
  // FOUND AI MATCH
  // =========================

  if (matchedAiDataset) {

    console.log(
      "\nMATCHED AI DATASET:",
      matchedAiDataset.dataset
    );

    return matchedAiDataset.dataset;

  }

  // =========================
  // FINAL SAFETY
  // =========================

  console.log(
    "\nAI MATCH FAILED"
  );

  return datasets[0]?.dataset;

}

export default selectDataset;

