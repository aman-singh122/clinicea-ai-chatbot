// =========================
// DYNAMIC DATASET SELECTOR
// =========================

const staticDatasets = [
  "appointments",
  "bills",
  "billitems",
  "bill_items"
];

function normalizeText(value) {

  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .toLowerCase()
    .trim();

}

function tokenize(value) {

  return normalizeText(value)
    .split(/\s+/)
    .filter(token =>
      token.length > 1
    );

}

function isStaticDataset(dataset) {

  const normalized =
    normalizeText(dataset)
      .replace(/\s+/g, "");

  return staticDatasets.some(staticName =>
    normalized === staticName ||
    normalized.startsWith(staticName) ||
    normalized.includes(`${staticName}consolidated`)
  );

}

function scoreText(queryText, queryTokens, value, weight) {

  const text =
    normalizeText(value);

  if (!text) {

    return 0;

  }

  let score = 0;

  if (queryText.includes(text)) {

    score += weight * 2;

  }

  const valueTokens =
    tokenize(value);

  for (const token of valueTokens) {

    if (queryTokens.includes(token)) {

      score += weight;

    }

  }

  return score;

}

function selectDynamicDataset({
  query,
  datasets,
  metadataMap
}) {

  const queryText =
    normalizeText(query);

  const queryTokens =
    tokenize(query);

  const dynamicCandidates =
    datasets
      .filter(dataset =>
        !isStaticDataset(dataset.dataset)
      )
      .map(dataset => ({

        dataset,

        metadata:
          metadataMap[dataset.dataset]

      }))
      .filter(candidate =>
        candidate.metadata
      );

  if (dynamicCandidates.length === 0) {

    console.log(
      "\nNO DYNAMIC METADATA CANDIDATES FOUND"
    );

    return null;

  }

  const scored =
    dynamicCandidates.map(candidate => {

      const metadata =
        candidate.metadata;

      let score = 0;

      score += scoreText(
        queryText,
        queryTokens,
        metadata.dataset,
        6
      );

      for (const metric of metadata.metrics || []) {

        score += scoreText(
          queryText,
          queryTokens,
          metric,
          5
        );

      }

      for (const dimension of metadata.dimensions || []) {

        score += scoreText(
          queryText,
          queryTokens,
          dimension,
          4
        );

      }

      for (const date of metadata.dates || []) {

        score += scoreText(
          queryText,
          queryTokens,
          date,
          3
        );

      }

      if (
        queryTokens.some(token =>
          [
            "top",
            "highest",
            "lowest",
            "total",
            "sum",
            "average",
            "avg",
            "count"
          ].includes(token)
        ) &&
        metadata.metrics?.length > 0
      ) {

        score += 2;

      }

      if (
        queryTokens.some(token =>
          [
            "monthly",
            "daily",
            "weekly",
            "trend",
            "date",
            "time"
          ].includes(token)
        ) &&
        metadata.dates?.length > 0
      ) {

        score += 2;

      }

      return {

        dataset:
          candidate.dataset,

        metadata,

        score

      };

    });

  scored.sort(
    (a, b) => b.score - a.score
  );

  console.log(
    "\nDYNAMIC DATASET SCORES:\n",
    scored.map(item => ({
      dataset: item.dataset.dataset,
      score: item.score
    }))
  );

  const best =
    scored[0];

  if (!best || best.score <= 0) {

    console.log(
      "\nDYNAMIC DATASET LOW CONFIDENCE"
    );

    return null;

  }

  return best;

}

export default selectDynamicDataset;

export {
  isStaticDataset
};
