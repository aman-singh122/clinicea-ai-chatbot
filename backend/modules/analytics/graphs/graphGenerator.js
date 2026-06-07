function graphGenerator(result) {

  // =========================
  // EMPTY CHECK
  // =========================

  if (
    !result ||
    !Array.isArray(result) ||
    result.length === 0
  ) {
    return null;
  }

  // =========================
  // FIRST ROW
  // =========================

  const firstRow = result[0];

  const keys =
    Object.keys(firstRow);

  // =========================
  // INVALID DATA
  // =========================

  if (
    !keys ||
    keys.length === 0
  ) {
    return null;
  }

  // =========================
  // SINGLE ROW RESULT
  // =========================

  if (
    result.length === 1 &&
    keys.length > 1
  ) {

    const numericKeys =
      keys.filter(
        key =>
          typeof firstRow[key] === "number"
      );

    if (
      numericKeys.length === 1
    ) {

      return {
        labels: [keys[0]],
        values: [firstRow[numericKeys[0]]]
      };

    }

    return {
      labels: keys,
      values:
        Object.values(firstRow).map(
          value =>
            typeof value === "number"
              ? value
              : Number(value) || 0
        )
    };

  }

  // =========================
  // FIND NUMERIC COLUMN
  // =========================

  // =========================
// FIND NUMERIC COLUMN
// =========================

const valueKey = keys.find(key => {

  return result.some(row => {

    const value = row[key];

    if (
      typeof value === "number"
    ) {
      return true;
    }

    if (
      typeof value === "string"
    ) {

      const cleaned =
        value
          .replace(/,/g, "")
          .replace(/₹/g, "")
          .replace(/%/g, "")
          .replace(/mins/gi, "")
          .replace(/hours/gi, "")
          .replace(/days/gi, "")
          .trim();

      return !isNaN(
        Number(cleaned)
      );

    }

    return false;

  });

});

if (!valueKey) {

  console.log(
    "NO NUMERIC COLUMN FOUND"
  );

  return null;

}

// =========================
// FIND LABEL COLUMN
// =========================

const labelKey = keys.find(
  key =>
    key !== valueKey
);

if (!labelKey) {

  console.log(
    "NO LABEL COLUMN FOUND"
  );

  return null;

}

  if (!labelKey) {

    console.log(
      "NO LABEL COLUMN FOUND"
    );

    return null;

  }

  console.log(
    "GRAPH LABEL KEY:",
    labelKey
  );

  console.log(
    "GRAPH VALUE KEY:",
    valueKey
  );

  // =========================
  // LABELS
  // =========================

  const labels =
    result.map(
      row =>
        row[labelKey]
    );

  // =========================
  // VALUES
  // =========================

  const values =
    result.map(row => {

      const value =
        row[valueKey];

      // =====================
      // NUMBER
      // =====================

      if (
        typeof value === "number"
      ) {
        return value;
      }

      // =====================
      // STRING
      // =====================

      if (
        typeof value === "string"
      ) {

        const cleaned =
          value
            .replace(/,/g, "")
            .replace(/mins/gi, "")
            .replace(/hours/gi, "")
            .replace(/days/gi, "")
            .replace(/₹/g, "")
            .replace(/%/g, "")
            .trim();

        return Number(cleaned) || 0;
      }

      // =====================
      // DEFAULT
      // =====================

      return 0;

    });

  // =========================
  // FINAL
  // =========================

  return {
    labels,
    values
  };

}

export default graphGenerator;