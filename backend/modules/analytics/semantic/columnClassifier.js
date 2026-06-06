function classifyColumns(schema) {

  const result = {
    metrics: [],
    dimensions: [],
    dates: []
  };

  for (const col of schema) {

    const name =
      col.name.toLowerCase();

    const type =
      col.type.toUpperCase();

    if (
      name.includes("amount") ||
      name.includes("revenue") ||
      name.includes("price") ||
      name.includes("cost")
    ) {

      result.metrics.push(col.name);

      continue;
    }

    if (
      type.includes("DATE") ||
      type.includes("TIMESTAMP")
    ) {

      result.dates.push(col.name);

      continue;
    }

    result.dimensions.push(col.name);
  }

  return result;
}

export default classifyColumns;