function buildSchema(data) {

  if (!data.length)
    return [];

  const headers =
    Object.keys(data[0]);

  return headers.map(header => {

    const lower =
      header.toLowerCase();

    let type = "string";

    // NUMBER DETECTION

    if (

      lower.includes("price") ||
      lower.includes("amount") ||
      lower.includes("duration") ||
      lower.includes("score")

    ) {

      type = "number";
    }

    // DATE DETECTION

    if (

      lower.includes("date") ||
      lower.includes("time") ||
      lower.includes("dtm")

    ) {

      type = "date";
    }

    return {

      column: header,

      normalized:
        lower
          .replace(/[^a-z0-9 ]/g, " "),

      type
    };
  });
}

export default buildSchema;