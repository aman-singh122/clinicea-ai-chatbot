function classifyColumns(schema) {

  const result = {
    metrics: [],
    dimensions: [],
    dates: []
  };

  const metricKeywords = [
    "amount",
    "revenue",
    "price",
    "cost",
    "quantity",
    "qty",
    "count",
    "total",
    "paid",
    "due",
    "tax",
    "sales",
    "income",
    "earning",
    "profit",
    "discount",
    "fee",
    "charge",
    "duration",
    "score",
    "rate"
  ];

  const numericTypes = [
    "INTEGER",
    "BIGINT",
    "DOUBLE",
    "FLOAT",
    "DECIMAL",
    "NUMERIC",
    "REAL"
  ];

  for (const col of schema) {

    const name =
      col.name.toLowerCase();

    const type =
      col.type.toUpperCase();

    const isDate =
      type.includes("DATE") ||
      type.includes("TIMESTAMP");

    if (isDate) {

      result.dates.push(col.name);

      continue;
    }

    const isMetricByName =
      metricKeywords.some(keyword =>
        name.includes(keyword)
      );

    const isMetricByType =
      numericTypes.some(numericType =>
        type.includes(numericType)
      );

    if (isMetricByName || isMetricByType) {

      result.metrics.push(col.name);

      continue;
    }

    result.dimensions.push(col.name);
  }

  return result;
}

export default classifyColumns;
