
function executeAnalytics(data, query, columns) {

  let result = [...data];

  // ========================
// SUMMARY MODE
// ========================

if (
  query.operation === "summary"
) {

  // APPLY FILTERS FIRST

  if (query.filters) {

    for (const filter of query.filters) {

      const field =
        columns[filter.field];

      if (!field) continue;

      result =
        result.filter(row => {

          const value =
            String(
              row[field] || ""
            )
            .toLowerCase()
            .trim();

          // EQUALS

          if (
            filter.operator === "="
          ) {

            return value.includes(
              String(filter.value)
                .toLowerCase()
                .trim()
            );
          }

          return true;
        });
    }
  }

  let summaryValue = 0;

  // COUNT

  if (
    query.aggregation === "count"
  ) {

    summaryValue =
      result.length;
  }

  // SUM

  else if (
    query.aggregation === "sum"
  ) {

    summaryValue =
      result.reduce((sum, row) => {

        return (
          sum +
          (
            parseFloat(
              row[
                columns.metric
              ]
            ) || 0
          )
        );

      }, 0);
  }

  return [
    {
      label: "Result",
      value: summaryValue
    }
  ];
}

  // ========================
  // FILTERS
  // ========================

  if (query.filters) {

    for (const filter of query.filters) {

      const field =
        columns[filter.field];

      if (!field) continue;

      result =
        result.filter(row => {

          const rawValue =
            row[field];

          const value =
            String(rawValue || "")
              .toLowerCase()
              .trim();

          // ========================
          // BETWEEN
          // ========================

          if (
            filter.operator === "between"
          ) {

            const start =
              String(
                filter.value[0]
              )
              .toLowerCase()
              .trim();

            const end =
              String(
                filter.value[1]
              )
              .toLowerCase()
              .trim();

            return (
              value.includes(start) ||
              value.includes(end)
            );
          }

          // ========================
          // EQUALS
          // ========================

          if (
            filter.operator === "="
          ) {

            return value.includes(
              String(filter.value)
                .toLowerCase()
                .trim()
            );
          }

          // ========================
          // GREATER THAN
          // ========================

          if (
            filter.operator === ">"
          ) {

            return (
              parseFloat(value) >
              parseFloat(filter.value)
            );
          }

          // ========================
          // LESS THAN
          // ========================

          if (
            filter.operator === "<"
          ) {

            return (
              parseFloat(value) <
              parseFloat(filter.value)
            );
          }

          return true;
        });
    }
  }

  // ========================
  // FAIL SAFE
  // ========================

  if (!columns.dimension) {

    return [];
  }

  // ========================
  // GROUPING
  // ========================

  const grouped = {};

  const dimensionColumn =
    columns.dimension;

  const metricColumn =
    columns.metric;

  for (const row of result) {

    const rawKey =
      row[dimensionColumn];

    if (
      rawKey === undefined ||
      rawKey === null ||
      String(rawKey).trim() === ""
    ) {

      continue;
    }

    const key =
      String(rawKey).trim();

    if (!grouped[key]) {

      grouped[key] = [];
    }

    grouped[key].push(row);
  }

  // ========================
  // AGGREGATION
  // ========================

  const finalData = [];

  for (const key in grouped) {

    const rows =
      grouped[key];

    let value = 0;

    // ========================
    // SUM
    // ========================

    if (
      query.aggregation === "sum"
    ) {

      value =
        rows.reduce((sum, row) => {

          return (
            sum +
            (
              parseFloat(
                row[metricColumn]
              ) || 0
            )
          );

        }, 0);
    }

    // ========================
    // COUNT
    // ========================

    else if (
      query.aggregation === "count"
    ) {

      value = rows.length;
    }

    // ========================
    // AVG
    // ========================

    else if (
      query.aggregation === "avg"
    ) {

      const total =
        rows.reduce((sum, row) => {

          return (
            sum +
            (
              parseFloat(
                row[metricColumn]
              ) || 0
            )
          );

        }, 0);

      value =
        total / rows.length;
    }

    // ========================
    // MAX
    // ========================

    else if (
      query.aggregation === "max"
    ) {

      value =
        Math.max(
          ...rows.map(row =>
            parseFloat(
              row[metricColumn]
            ) || 0
          )
        );
    }

    // ========================
    // MIN
    // ========================

    else if (
      query.aggregation === "min"
    ) {

      value =
        Math.min(
          ...rows.map(row =>
            parseFloat(
              row[metricColumn]
            ) || 0
          )
        );
    }

    finalData.push({

      label: key,

      value:
        Number(
          value.toFixed(2)
        )
    });
  }

  // ========================
  // SORTING
  // ========================

  if (query.sort === "desc") {

    finalData.sort(
      (a, b) =>
        b.value - a.value
    );
  }

  if (query.sort === "asc") {

    finalData.sort(
      (a, b) =>
        a.value - b.value
    );
  }

  // ========================
  // LIMIT
  // ========================

  const limit =
    query.limit || 10;

  return finalData.slice(
    0,
    limit
  );
}

export default executeAnalytics;