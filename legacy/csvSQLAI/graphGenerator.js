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

  const firstRow =
    result[0];

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
  // SINGLE ROW MULTI COLUMN
  // PERFECT FOR PIE CHARTS
  // =========================

  if (

    result.length === 1 &&

    keys.length > 1

  ) {

    return {

      labels:

        keys,

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
  // NORMAL GRAPH
  // =========================

  const labelKey =
    keys[0];

  const valueKey =
    keys[1];

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

    result.map(

      row => {

        const value =
          row[valueKey];

        // =====================
        // HANDLE NUMBERS
        // =====================

        if (

          typeof value === "number"

        ) {

          return value;
        }

        // =====================
        // HANDLE STRINGS
        // =====================

        if (

          typeof value === "string"

        ) {

          // REMOVE:
          // commas
          // mins
          // %
          // ₹
          // spaces

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

      }

    );

  // =========================
  // FINAL
  // =========================

  return {

    labels,

    values

  };

}

export default graphGenerator;